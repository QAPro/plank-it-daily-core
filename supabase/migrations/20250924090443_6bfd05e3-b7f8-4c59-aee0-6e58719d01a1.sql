-- Enhanced security for billing_transactions table (Fixed)
-- Add audit logging for billing data access and strengthen security policies

-- Create audit table for billing data access if it doesn't exist
CREATE TABLE IF NOT EXISTS public.billing_data_access_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  accessing_user_id UUID,
  target_user_id UUID,
  access_type TEXT NOT NULL,
  accessed_fields TEXT[],
  access_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.billing_data_access_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins can view billing audit logs"
ON public.billing_data_access_audit
FOR SELECT
USING (EXISTS(
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

-- System and admins can create audit entries
CREATE POLICY "System and admins can create billing audit entries"
ON public.billing_data_access_audit
FOR INSERT
WITH CHECK (
  auth.uid() IS NULL 
  OR EXISTS(
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Enhanced secure function for getting billing history with additional validation
CREATE OR REPLACE FUNCTION public.get_secure_billing_history(
  target_user_id uuid, 
  limit_count integer DEFAULT 10,
  access_reason text DEFAULT 'User requesting own billing history'
)
RETURNS TABLE(
  transaction_id uuid,
  amount_cents integer,
  currency text,
  status text,
  description text,
  created_at timestamp with time zone,
  masked_payment_intent text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  is_admin_user boolean := false;
  is_own_data boolean := false;
BEGIN
  -- Check if user is admin
  SELECT EXISTS(
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  ) INTO is_admin_user;
  
  -- Check if accessing own data
  is_own_data := (auth.uid() = target_user_id);
  
  -- Only allow access if user is admin or accessing own data
  IF NOT (is_admin_user OR is_own_data) THEN
    RAISE EXCEPTION 'Access denied: Insufficient privileges to view billing data';
  END IF;
  
  -- Log the access attempt
  INSERT INTO public.billing_data_access_audit (
    accessing_user_id,
    target_user_id,
    access_type,
    accessed_fields,
    access_reason
  ) VALUES (
    auth.uid(),
    target_user_id,
    CASE WHEN is_admin_user THEN 'admin_billing_access' ELSE 'user_own_billing_access' END,
    ARRAY['transaction_id', 'amount_cents', 'currency', 'status', 'description', 'created_at', 'stripe_payment_intent_id'],
    access_reason
  );
  
  -- Return billing data with masked payment intent for non-admins
  RETURN QUERY
  SELECT 
    bt.id,
    bt.amount_cents,
    bt.currency,
    bt.status,
    bt.description,
    bt.created_at,
    -- Mask stripe payment intent for non-admins
    CASE 
      WHEN is_admin_user THEN bt.stripe_payment_intent_id
      ELSE 'pi_***' || RIGHT(COALESCE(bt.stripe_payment_intent_id, ''), 4)
    END as masked_payment_intent
  FROM billing_transactions bt
  WHERE bt.user_id = target_user_id
  ORDER BY bt.created_at DESC
  LIMIT limit_count;
END;
$function$;

-- Drop and recreate more restrictive RLS policies for billing_transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON billing_transactions;
DROP POLICY IF EXISTS "Admins can view all transactions" ON billing_transactions;

-- Create enhanced RLS policies with additional validation
CREATE POLICY "Users can view own billing transactions with audit"
ON public.billing_transactions
FOR SELECT
USING (
  auth.uid() = user_id 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Admins can view all billing transactions with audit"
ON public.billing_transactions
FOR SELECT
USING (
  EXISTS(
    SELECT 1 FROM user_roles ur
    WHERE ur.user_id = auth.uid() 
    AND ur.role = 'admin'::app_role
  )
);

-- Ensure no updates to sensitive billing fields by non-system users
CREATE POLICY "Restrict sensitive billing field updates"
ON public.billing_transactions
FOR UPDATE
USING (
  -- Only system (NULL auth) or verified admins can update
  auth.uid() IS NULL 
  OR EXISTS(
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Create function to validate billing transaction data
CREATE OR REPLACE FUNCTION public.validate_billing_transaction()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure user_id is never NULL for security
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'Billing transaction must have a valid user_id';
  END IF;
  
  -- Validate amount is reasonable (not negative, not suspiciously large)
  IF NEW.amount_cents < 0 OR NEW.amount_cents > 100000000 THEN -- $1M max
    RAISE EXCEPTION 'Invalid transaction amount: %', NEW.amount_cents;
  END IF;
  
  -- Ensure description doesn't contain sensitive data
  IF NEW.description IS NOT NULL AND (
    NEW.description ILIKE '%card%number%'
    OR NEW.description ILIKE '%cvv%'
    OR NEW.description ILIKE '%ssn%'
    OR NEW.description ILIKE '%social%security%'
    OR LENGTH(NEW.description) > 500
  ) THEN
    RAISE EXCEPTION 'Description contains prohibited sensitive information';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add validation trigger
DROP TRIGGER IF EXISTS validate_billing_transaction_trigger ON billing_transactions;
CREATE TRIGGER validate_billing_transaction_trigger
  BEFORE INSERT OR UPDATE ON billing_transactions
  FOR EACH ROW
  EXECUTE FUNCTION validate_billing_transaction();

-- Add constraint to prevent sensitive data in description (without IF NOT EXISTS)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'check_no_sensitive_data_in_description' 
    AND table_name = 'billing_transactions'
  ) THEN
    ALTER TABLE public.billing_transactions 
    ADD CONSTRAINT check_no_sensitive_data_in_description 
    CHECK (
      description IS NULL 
      OR (
        description NOT ILIKE '%card%number%'
        AND description NOT ILIKE '%cvv%'
        AND description NOT ILIKE '%ssn%'
        AND description NOT ILIKE '%social%security%'
        AND LENGTH(description) < 500
      )
    );
  END IF;
END $$;