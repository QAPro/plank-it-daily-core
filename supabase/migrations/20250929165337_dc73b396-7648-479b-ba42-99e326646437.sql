-- Find and fix all SECURITY DEFINER functions missing search_path
-- Query to identify functions without search_path and fix them

-- Fix admin_secure_billing_access function
CREATE OR REPLACE FUNCTION public.admin_secure_billing_access(
  _target_user_id UUID,
  _access_reason TEXT DEFAULT 'Administrative billing review',
  _limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  transaction_id UUID,
  amount_cents INTEGER,
  currency TEXT,
  status TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  masked_payment_intent TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Fixed: Added explicit search_path
AS $$
DECLARE
  admin_check BOOLEAN := FALSE;
BEGIN
  -- Verify admin status with audit logging
  SELECT public.is_admin_with_audit(auth.uid()) INTO admin_check;
  
  IF NOT admin_check THEN
    RAISE EXCEPTION 'Access denied: Admin privileges required for billing data access';
  END IF;
  
  -- Log the admin access attempt with detailed audit trail
  INSERT INTO public.billing_data_access_audit (
    accessing_user_id,
    target_user_id,
    access_type,
    accessed_fields,
    access_reason
  ) VALUES (
    auth.uid(),
    _target_user_id,
    'admin_secure_billing_access',
    ARRAY['transaction_id', 'amount_cents', 'currency', 'status', 'description', 'created_at', 'stripe_payment_intent_id'],
    _access_reason
  );
  
  -- Update access tracking on transactions
  UPDATE public.billing_transactions 
  SET 
    access_log_count = access_log_count + 1,
    last_accessed_at = NOW()
  WHERE user_id = _target_user_id;
  
  -- Return billing data with enhanced security logging
  RETURN QUERY
  SELECT 
    bt.id,
    bt.amount_cents,
    bt.currency,
    bt.status,
    bt.description,
    bt.created_at,
    -- Always mask payment intent for additional security
    CASE 
      WHEN bt.stripe_payment_intent_id IS NOT NULL 
      THEN 'pi_***' || RIGHT(bt.stripe_payment_intent_id, 4)
      ELSE NULL
    END as masked_payment_intent
  FROM billing_transactions bt
  WHERE bt.user_id = _target_user_id
  ORDER BY bt.created_at DESC
  LIMIT _limit_count;
END;
$$;

-- Fix user_secure_billing_history function
CREATE OR REPLACE FUNCTION public.user_secure_billing_history(
  _limit_count INTEGER DEFAULT 10
)
RETURNS TABLE(
  transaction_id UUID,
  amount_cents INTEGER,
  currency TEXT,
  status TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  masked_payment_intent TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Fixed: Added explicit search_path
AS $$
BEGIN
  -- Verify user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for billing data access';
  END IF;
  
  -- Rate limit check
  IF NOT public.check_billing_access_rate_limit(auth.uid()) THEN
    RAISE EXCEPTION 'Access rate limit exceeded. Please wait before requesting more billing data.';
  END IF;
  
  -- Log user access attempt
  INSERT INTO public.billing_data_access_audit (
    accessing_user_id,
    target_user_id,
    access_type,
    accessed_fields,
    access_reason
  ) VALUES (
    auth.uid(),
    auth.uid(),
    'user_own_billing_access',
    ARRAY['transaction_id', 'amount_cents', 'currency', 'status', 'description', 'created_at'],
    'User accessing own billing history'
  );
  
  -- Update access tracking
  UPDATE public.billing_transactions 
  SET 
    access_log_count = access_log_count + 1,
    last_accessed_at = NOW()
  WHERE user_id = auth.uid();
  
  -- Return user's own billing data with masked sensitive info
  RETURN QUERY
  SELECT 
    bt.id,
    bt.amount_cents,
    bt.currency,
    bt.status,
    bt.description,
    bt.created_at,
    -- Always mask payment intent for security
    CASE 
      WHEN bt.stripe_payment_intent_id IS NOT NULL 
      THEN 'pi_***' || RIGHT(bt.stripe_payment_intent_id, 4)
      ELSE NULL
    END as masked_payment_intent
  FROM billing_transactions bt
  WHERE bt.user_id = auth.uid()
    AND NOT bt.access_restricted
  ORDER BY bt.created_at DESC
  LIMIT _limit_count;
END;
$$;