-- Security Fix: Properly secure users table with comprehensive RLS policies
-- This migration addresses the critical security vulnerability where user email addresses
-- and personal data could be exposed

-- First, ensure RLS is enabled on the users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Drop existing potentially problematic policies to start fresh
DROP POLICY IF EXISTS "Authenticated users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view user data" ON public.users;
DROP POLICY IF EXISTS "Admins can update user data" ON public.users;
DROP POLICY IF EXISTS "Prevent profile deletion" ON public.users;

-- Create security definer functions to avoid infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
  SELECT role::TEXT FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1;
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_user_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE SET search_path = public;

-- Create new secure RLS policies for the users table

-- 1. Users can only view their own profile (including email)
CREATE POLICY "Users can view own profile data" 
ON public.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- 2. Users can only update their own profile
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 3. Only authenticated users can insert their own profile during signup
CREATE POLICY "Users can create own profile" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- 4. Admins can view user data for management purposes
CREATE POLICY "Admins can view user data for management" 
ON public.users 
FOR SELECT 
TO authenticated
USING (public.is_user_admin() = true);

-- 5. Admins can update user data for management purposes
CREATE POLICY "Admins can update user data" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (public.is_user_admin() = true)
WITH CHECK (public.is_user_admin() = true);

-- 6. Prevent any deletion of user profiles (data retention)
CREATE POLICY "Prevent user profile deletion" 
ON public.users 
FOR DELETE 
TO authenticated
USING (false);

-- Create audit logging for sensitive user data access
CREATE TABLE IF NOT EXISTS public.user_data_access_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessing_user_id UUID NOT NULL,
  target_user_id UUID NOT NULL,
  access_type TEXT NOT NULL CHECK (access_type IN ('view', 'update', 'admin_view', 'admin_update')),
  accessed_fields TEXT[] NOT NULL,
  access_reason TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit table
ALTER TABLE public.user_data_access_audit ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view access audit logs" 
ON public.user_data_access_audit 
FOR SELECT 
TO authenticated
USING (public.is_user_admin() = true);

-- System can insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.user_data_access_audit 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = accessing_user_id);

-- Create secure function for safe user lookups (no email exposure)
CREATE OR REPLACE FUNCTION public.find_user_by_username_secure(search_username TEXT)
RETURNS TABLE(user_id UUID, username TEXT, avatar_url TEXT) AS $$
BEGIN
  -- Only return safe, non-sensitive user data for lookups
  -- Never return email or full_name through this function
  RETURN QUERY
  SELECT u.id, u.username, u.avatar_url
  FROM public.users u
  WHERE u.username = search_username;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create secure function for admin user management
CREATE OR REPLACE FUNCTION public.admin_get_user_summary()
RETURNS TABLE(
  user_id UUID, 
  username TEXT, 
  subscription_tier TEXT, 
  current_level INTEGER,
  created_at TIMESTAMP WITH TIME ZONE,
  total_xp INTEGER,
  last_active TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  -- Only allow admins to call this function
  IF NOT public.is_user_admin() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  -- Log admin access
  INSERT INTO public.user_data_access_audit (
    accessing_user_id, 
    target_user_id, 
    access_type, 
    accessed_fields, 
    access_reason
  )
  SELECT 
    auth.uid(), 
    u.id, 
    'admin_view',
    ARRAY['username', 'subscription_tier', 'current_level', 'created_at', 'total_xp'],
    'Admin user management access'
  FROM public.users u;

  -- Return only management data (no email or full_name)
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
  ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add check constraint to prevent email exposure in username field
ALTER TABLE public.users 
ADD CONSTRAINT username_not_email 
CHECK (username IS NULL OR username !~ '^[^@]+@[^@]+\.[^@]+$');

COMMENT ON TABLE public.users IS 'User profiles with RLS protection for sensitive data like email addresses';
COMMENT ON COLUMN public.users.email IS 'Sensitive field - only accessible to user themselves and admins';
COMMENT ON COLUMN public.users.full_name IS 'Sensitive field - only accessible to user themselves and admins';
COMMENT ON COLUMN public.users.pending_new_email IS 'Sensitive field - only accessible to user themselves and admins';