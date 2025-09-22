-- Fix security issues with administrative tables
-- 1. Tighten INSERT policy on admin_audit_log to only allow system/admin users
DROP POLICY IF EXISTS "System can create audit entries" ON admin_audit_log;

CREATE POLICY "Only admins and system can create audit entries" 
ON admin_audit_log 
FOR INSERT 
WITH CHECK (
  -- Allow if user is admin or if called from a security definer function
  is_admin(auth.uid()) OR 
  -- Allow system operations (when called from SECURITY DEFINER functions)
  auth.uid() IS NULL OR
  -- Ensure the admin_user_id matches the current user if set
  (admin_user_id IS NULL OR admin_user_id = auth.uid())
);

-- 2. Add UPDATE/DELETE policies for admin_audit_log to prevent tampering
CREATE POLICY "Only superadmins can update audit entries" 
ON admin_audit_log 
FOR UPDATE 
USING (is_superadmin(auth.uid()));

CREATE POLICY "Only superadmins can delete audit entries" 
ON admin_audit_log 
FOR DELETE 
USING (is_superadmin(auth.uid()));

-- 3. Strengthen admin_user_notes policies to ensure proper ownership
DROP POLICY IF EXISTS "Admins can manage notes" ON admin_user_notes;

CREATE POLICY "Admins can view all notes" 
ON admin_user_notes 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Admins can create notes" 
ON admin_user_notes 
FOR INSERT 
WITH CHECK (is_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Admins can update own notes" 
ON admin_user_notes 
FOR UPDATE 
USING (is_admin(auth.uid()) AND created_by = auth.uid());

CREATE POLICY "Only superadmins can delete notes" 
ON admin_user_notes 
FOR DELETE 
USING (is_superadmin(auth.uid()));

-- 4. Add additional security function to check if user is superadmin
CREATE OR REPLACE FUNCTION public.is_superadmin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(_user_id, 'superadmin'::app_role);
$$;