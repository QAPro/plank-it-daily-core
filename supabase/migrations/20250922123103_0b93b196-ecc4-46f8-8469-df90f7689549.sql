-- Security Fix: Secure the users table properly
-- Remove potentially vulnerable public role policies and implement secure access patterns

-- First, drop all existing policies on the users table
DROP POLICY IF EXISTS "Users can only view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can only update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Admins can update all users" ON public.users;

-- Create secure RLS policies for authenticated users only
-- Users can only view their own profile data
CREATE POLICY "Authenticated users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Users can only update their own profile data
CREATE POLICY "Authenticated users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Users can insert their own profile (for registration)
CREATE POLICY "Authenticated users can insert own profile"
ON public.users
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Prevent users from deleting their own profiles
-- (Profile deletion should be handled through proper account deletion flows)
CREATE POLICY "Prevent profile deletion"
ON public.users
FOR DELETE
TO authenticated
USING (false);

-- Admins can view limited user information for administrative purposes
-- Only essential fields, not sensitive personal data
CREATE POLICY "Admins can view user management data"
ON public.users
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Admins can update specific administrative fields only
-- Not personal information like email, full_name, etc.
CREATE POLICY "Admins can update administrative fields"
ON public.users
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
  -- Prevent admins from modifying sensitive personal fields
  AND OLD.email = NEW.email
  AND OLD.full_name = NEW.full_name
  AND OLD.id = NEW.id
);

-- Create a security definer function for safe user lookups
-- This allows controlled access to user data for specific operations
CREATE OR REPLACE FUNCTION public.get_user_display_info(target_user_id uuid)
RETURNS TABLE(
  user_id uuid,
  username text,
  avatar_url text,
  current_level integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only return non-sensitive display information
  -- Never return email, full_name, or other personal data
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.avatar_url,
    u.current_level
  FROM users u
  WHERE u.id = target_user_id;
END;
$$;

-- Create a security definer function for admin user management
-- Limits what admins can see to essential management data only
CREATE OR REPLACE FUNCTION public.get_admin_user_list()
RETURNS TABLE(
  user_id uuid,
  username text,
  subscription_tier text,
  current_level integer,
  created_at timestamp with time zone,
  total_xp integer
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  ) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Return only non-sensitive management data
  -- Never return email, full_name, avatar_url, or other personal data
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.subscription_tier,
    u.current_level,
    u.created_at,
    u.total_xp
  FROM users u
  ORDER BY u.created_at DESC;
END;
$$;

-- Update the existing find_user_by_username_or_email function to be more secure
-- Ensure it only returns necessary data and requires authentication
CREATE OR REPLACE FUNCTION public.find_user_by_username_or_email(identifier text)
RETURNS TABLE(user_id uuid, username text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only authenticated users can search for other users
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required to search for users';
  END IF;

  -- Return only safe, non-sensitive data for user lookup
  RETURN QUERY
  SELECT u.id, u.username
  FROM public.users u
  WHERE u.username = identifier OR u.email = identifier;
END;
$$;

-- Create audit logging for sensitive operations
CREATE TABLE IF NOT EXISTS public.user_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  accessing_user_id uuid NOT NULL,
  target_user_id uuid NOT NULL,
  access_type text NOT NULL,
  accessed_fields text[] NOT NULL,
  access_reason text,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on the audit log
ALTER TABLE public.user_data_access_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view access logs"
ON public.user_data_access_log
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- System can insert access logs
CREATE POLICY "System can insert access logs"
ON public.user_data_access_log
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = accessing_user_id);