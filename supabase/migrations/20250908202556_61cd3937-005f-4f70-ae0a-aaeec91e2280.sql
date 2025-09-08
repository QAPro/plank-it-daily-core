-- Phase 1: Database Schema Enhancement for User Role Access Control System

-- Extend app_role enum to include new roles
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'beta_tester';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support_agent';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content_creator';

-- Create special_permissions table for granular access control
CREATE TABLE IF NOT EXISTS public.special_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_type TEXT NOT NULL,
  granted_by UUID,
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on special_permissions
ALTER TABLE public.special_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for special_permissions
CREATE POLICY "Admins can manage special permissions"
ON public.special_permissions
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view own special permissions"
ON public.special_permissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_special_permissions_updated_at
BEFORE UPDATE ON public.special_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to check if user has superadmin role
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'superadmin');
$$;

-- Create function to get user's role level (hierarchy)
CREATE OR REPLACE FUNCTION public.get_user_role_level(_user_id UUID DEFAULT auth.uid())
RETURNS INTEGER
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF public.has_role(_user_id, 'superadmin') THEN
    RETURN 5;
  ELSIF public.has_role(_user_id, 'admin') THEN
    RETURN 4;
  ELSIF public.has_role(_user_id, 'moderator') THEN
    RETURN 3;
  ELSIF public.has_role(_user_id, 'subscriber') THEN
    RETURN 2;
  ELSE
    RETURN 1; -- user
  END IF;
END;
$$;

-- Create function to check if user can modify another user's roles
CREATE OR REPLACE FUNCTION public.can_modify_user_roles(_admin_id UUID, _target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER  
SET search_path = public
AS $$
DECLARE
  admin_level INTEGER;
  target_level INTEGER;
BEGIN
  -- Get role levels
  admin_level := public.get_user_role_level(_admin_id);
  target_level := public.get_user_role_level(_target_user_id);
  
  -- Only admins (level 4+) can modify roles
  IF admin_level < 4 THEN
    RETURN FALSE;
  END IF;
  
  -- Superadmins can modify anyone
  IF admin_level = 5 THEN
    RETURN TRUE;
  END IF;
  
  -- Admins can only modify users below their level
  IF admin_level > target_level THEN
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$;

-- Create function to get all user roles including special roles
CREATE OR REPLACE FUNCTION public.get_all_user_roles(_user_id UUID)
RETURNS TABLE(
  role_type TEXT,
  role_name TEXT,
  granted_at TIMESTAMP WITH TIME ZONE,
  granted_by UUID,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN
)
LANGUAGE PLPGSQL
STABLE SECURITY DEFINER
SET search_path = public  
AS $$
BEGIN
  -- Only allow admins or the user themselves to query
  IF NOT (auth.uid() = _user_id OR public.is_admin(auth.uid())) THEN
    RETURN;
  END IF;
  
  -- Return administrative roles
  RETURN QUERY
  SELECT
    'administrative'::TEXT as role_type,
    ur.role::TEXT as role_name,
    ur.created_at as granted_at,
    NULL::UUID as granted_by,
    NULL::TIMESTAMP WITH TIME ZONE as expires_at,
    TRUE as is_active
  FROM public.user_roles ur
  WHERE ur.user_id = _user_id;
  
  -- Return special permissions
  RETURN QUERY  
  SELECT
    'special'::TEXT as role_type,
    sp.permission_type as role_name,
    sp.created_at as granted_at,
    sp.granted_by,
    sp.expires_at,
    sp.is_active
  FROM public.special_permissions sp
  WHERE sp.user_id = _user_id
    AND (sp.expires_at IS NULL OR sp.expires_at > now())
    AND sp.is_active = true;
END;
$$;