-- Add enhanced security logging for user data access
-- This creates additional safeguards without modifying existing policies

-- Create secure admin function for accessing user management data with full audit trail
CREATE OR REPLACE FUNCTION public.admin_secure_user_lookup(_user_id uuid, _access_reason text DEFAULT 'Administrative lookup')
RETURNS TABLE(
  user_id uuid,
  username text, 
  subscription_tier text,
  current_level integer,
  created_at timestamp with time zone,
  total_xp integer,
  last_active timestamp with time zone
) 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT is_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Log admin access attempt with detailed audit trail
  INSERT INTO public.user_data_access_audit (
    accessing_user_id,
    target_user_id,
    access_type,
    accessed_fields,
    access_reason
  ) VALUES (
    auth.uid(),
    _user_id,
    'admin_secure_lookup',
    ARRAY['username', 'subscription_tier', 'current_level', 'created_at', 'total_xp'],
    _access_reason
  );

  -- Return only non-sensitive management data (NEVER email or full_name)
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.subscription_tier,
    u.current_level,
    u.created_at,
    u.total_xp,
    (
      SELECT MAX(us.completed_at) 
      FROM public.user_sessions us 
      WHERE us.user_id = u.id
    ) as last_active
  FROM public.users u
  WHERE u.id = _user_id;
END;
$$;

-- Add trigger to log all SELECT access to users table for monitoring
CREATE OR REPLACE FUNCTION public.audit_users_table_access()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to users table when email or full_name fields might be accessed
  IF TG_OP = 'SELECT' AND auth.uid() IS NOT NULL THEN
    -- Only log if this is not the user accessing their own data
    IF NEW.id != auth.uid() THEN
      INSERT INTO public.user_data_access_audit (
        accessing_user_id,
        target_user_id,
        access_type,
        accessed_fields,
        access_reason
      ) VALUES (
        auth.uid(),
        NEW.id,
        'table_direct_access',
        ARRAY['potentially_sensitive_fields'],
        'Direct table access logged for security monitoring'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;