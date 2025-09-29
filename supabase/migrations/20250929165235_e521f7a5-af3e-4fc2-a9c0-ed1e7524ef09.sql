-- Fix remaining security linter warning: Function Search Path Mutable
-- Ensure all SECURITY DEFINER functions have proper search_path settings

-- Update the rate limiting function to include proper search_path
CREATE OR REPLACE FUNCTION public.check_billing_access_rate_limit(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Fixed: Added explicit search_path
AS $$
DECLARE
  access_count INTEGER;
  rate_limit_window INTERVAL := '1 hour';
  max_access_per_window INTEGER := 50;
BEGIN
  -- Count recent access attempts
  SELECT COUNT(*) INTO access_count
  FROM public.billing_data_access_audit
  WHERE accessing_user_id = _user_id
    AND created_at > (NOW() - rate_limit_window);
  
  -- Log rate limit check
  IF access_count >= max_access_per_window THEN
    INSERT INTO public.billing_data_access_audit (
      accessing_user_id,
      access_type,
      accessed_fields,
      access_reason
    ) VALUES (
      _user_id,
      'rate_limit_exceeded',
      ARRAY['rate_limit_check'],
      'Billing access rate limit exceeded: ' || access_count || ' attempts in last hour'
    );
    
    RETURN FALSE;
  END IF;
  
  RETURN TRUE;
END;
$$;

-- Update the enhanced billing validation function to include proper search_path
CREATE OR REPLACE FUNCTION public.enhanced_billing_validation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'  -- Fixed: Added explicit search_path
AS $$
BEGIN
  -- Enhanced security validations
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'Billing transaction must have a valid user_id for security tracking';
  END IF;
  
  -- Validate amount is within reasonable bounds
  IF NEW.amount_cents < 0 OR NEW.amount_cents > 1000000000 THEN -- $10M max
    RAISE EXCEPTION 'Invalid transaction amount: % cents', NEW.amount_cents;
  END IF;
  
  -- Prevent sensitive data in description
  IF NEW.description IS NOT NULL AND (
    NEW.description ILIKE '%card%number%'
    OR NEW.description ILIKE '%cvv%'
    OR NEW.description ILIKE '%ssn%'
    OR NEW.description ILIKE '%social%security%'
    OR NEW.description ILIKE '%password%'
    OR LENGTH(NEW.description) > 500
  ) THEN
    RAISE EXCEPTION 'Description contains prohibited sensitive information or exceeds length limit';
  END IF;
  
  -- Rate limit check for non-admin users
  IF NOT public.is_admin_with_audit(auth.uid()) THEN
    IF NOT public.check_billing_access_rate_limit(auth.uid()) THEN
      RAISE EXCEPTION 'Billing access rate limit exceeded. Please wait before accessing more billing data.';
    END IF;
  END IF;
  
  -- Encrypt sensitive payment intent if provided
  IF NEW.stripe_payment_intent_id IS NOT NULL THEN
    NEW.encrypted_payment_intent_id := encode(
      encrypt(NEW.stripe_payment_intent_id::bytea, 'billing_encryption_key', 'aes'), 
      'base64'
    );
  END IF;
  
  RETURN NEW;
END;
$$;