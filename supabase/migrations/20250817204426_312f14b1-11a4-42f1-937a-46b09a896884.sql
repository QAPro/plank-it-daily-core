
-- Create user_feature_overrides table for individual user feature control
CREATE TABLE public.user_feature_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  granted_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, feature_name)
);

-- Enable RLS on user_feature_overrides
ALTER TABLE public.user_feature_overrides ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can manage feature overrides
CREATE POLICY "Admins can manage user feature overrides"
  ON public.user_feature_overrides
  FOR ALL
  USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- Create admin_audit_log table for tracking admin actions
CREATE TABLE public.admin_audit_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id),
  target_user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  action_details JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on admin_audit_log
ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_log
  FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- Policy: Only admins can create audit log entries
CREATE POLICY "Admins can create audit logs"
  ON public.admin_audit_log
  FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  ));

-- Create function to grant admin role with audit logging
CREATE OR REPLACE FUNCTION public.grant_admin_role(_target_user_id UUID, _reason TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_user_id UUID;
BEGIN
  -- Get the current admin user
  _admin_user_id := auth.uid();
  
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = _admin_user_id AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Insert admin role if not exists
  INSERT INTO user_roles (user_id, role)
  VALUES (_target_user_id, 'admin')
  ON CONFLICT (user_id, role) DO NOTHING;
  
  -- Log the action
  INSERT INTO admin_audit_log (admin_user_id, target_user_id, action_type, action_details)
  VALUES (_admin_user_id, _target_user_id, 'grant_admin_role', 
    jsonb_build_object('reason', COALESCE(_reason, 'No reason provided')));
  
  RETURN TRUE;
END;
$$;

-- Create function to revoke admin role with audit logging
CREATE OR REPLACE FUNCTION public.revoke_admin_role(_target_user_id UUID, _reason TEXT DEFAULT NULL)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_user_id UUID;
BEGIN
  -- Get the current admin user
  _admin_user_id := auth.uid();
  
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = _admin_user_id AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Prevent self-demotion
  IF _admin_user_id = _target_user_id THEN
    RAISE EXCEPTION 'Cannot revoke your own admin role';
  END IF;
  
  -- Remove admin role
  DELETE FROM user_roles 
  WHERE user_id = _target_user_id AND role = 'admin';
  
  -- Log the action
  INSERT INTO admin_audit_log (admin_user_id, target_user_id, action_type, action_details)
  VALUES (_admin_user_id, _target_user_id, 'revoke_admin_role', 
    jsonb_build_object('reason', COALESCE(_reason, 'No reason provided')));
  
  RETURN TRUE;
END;
$$;

-- Create function to set user feature override
CREATE OR REPLACE FUNCTION public.set_user_feature_override(
  _target_user_id UUID,
  _feature_name TEXT,
  _is_enabled BOOLEAN,
  _reason TEXT DEFAULT NULL,
  _expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _admin_user_id UUID;
BEGIN
  -- Get the current admin user
  _admin_user_id := auth.uid();
  
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = _admin_user_id AND ur.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  -- Upsert feature override
  INSERT INTO user_feature_overrides (user_id, feature_name, is_enabled, granted_by, reason, expires_at)
  VALUES (_target_user_id, _feature_name, _is_enabled, _admin_user_id, _reason, _expires_at)
  ON CONFLICT (user_id, feature_name)
  DO UPDATE SET
    is_enabled = _is_enabled,
    granted_by = _admin_user_id,
    reason = _reason,
    expires_at = _expires_at,
    created_at = now();
  
  -- Log the action
  INSERT INTO admin_audit_log (admin_user_id, target_user_id, action_type, action_details)
  VALUES (_admin_user_id, _target_user_id, 'set_feature_override', 
    jsonb_build_object(
      'feature_name', _feature_name,
      'is_enabled', _is_enabled,
      'reason', COALESCE(_reason, 'No reason provided'),
      'expires_at', _expires_at
    ));
  
  RETURN TRUE;
END;
$$;

-- Add indexes for efficient searching
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_username ON public.users(username) WHERE username IS NOT NULL;
CREATE INDEX idx_users_full_name ON public.users(full_name) WHERE full_name IS NOT NULL;
CREATE INDEX idx_admin_audit_log_admin_user ON public.admin_audit_log(admin_user_id);
CREATE INDEX idx_admin_audit_log_target_user ON public.admin_audit_log(target_user_id);
CREATE INDEX idx_admin_audit_log_created_at ON public.admin_audit_log(created_at DESC);
CREATE INDEX idx_user_feature_overrides_user_id ON public.user_feature_overrides(user_id);
CREATE INDEX idx_user_feature_overrides_expires_at ON public.user_feature_overrides(expires_at) WHERE expires_at IS NOT NULL;
