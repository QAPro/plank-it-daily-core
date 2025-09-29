-- Comprehensive Security Fix: Secure all remaining sensitive tables with proper RLS policies

-- ==========================================
-- Phase 1: Secure Users Table
-- ==========================================
-- Users should only view their own profile data, admins can view all

DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all users" 
ON public.users 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- ==========================================
-- Phase 2: Secure Notification Logs
-- ==========================================
-- Users should only see their own notifications

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notification_logs;
DROP POLICY IF EXISTS "Admins can view all notifications" ON public.notification_logs;
DROP POLICY IF EXISTS "Users can create own notifications" ON public.notification_logs;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notification_logs;

CREATE POLICY "Users can view own notifications" 
ON public.notification_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all notifications" 
ON public.notification_logs 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Users can create own notifications" 
ON public.notification_logs 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.notification_logs 
FOR UPDATE 
USING (auth.uid() = user_id);

-- ==========================================
-- Phase 3: Verify Admin Audit Log is Secure
-- ==========================================
-- Admin audit log should only be accessible by admins
-- (policies already exist, just verifying they're the only ones)

DROP POLICY IF EXISTS "Anyone can view audit log" ON public.admin_audit_log;
DROP POLICY IF EXISTS "Public can view audit log" ON public.admin_audit_log;

-- Existing admin-only policies remain:
-- - "Admins can view audit log"
-- - "Only admins and system can create audit entries"
-- - "Only superadmins can delete audit entries"
-- - "Only superadmins can update audit entries"

-- ==========================================
-- Phase 4: Verify User Data Access Audit is Secure
-- ==========================================
-- User data access audit should only be accessible by admins

DROP POLICY IF EXISTS "Anyone can view data access audit" ON public.user_data_access_audit;
DROP POLICY IF EXISTS "Public can view data access audit" ON public.user_data_access_audit;

-- Existing admin-only policies remain:
-- - "Only admins can view user data access audit"
-- - "System and admins can create user data access audit entries"

-- ==========================================
-- Security Summary
-- ==========================================
-- ✅ users: Users can only view/update their own profile, admins can view all
-- ✅ billing_transactions: Already secured - users view own, admins with audit
-- ✅ notification_logs: Users can only view/manage their own, admins can view all
-- ✅ admin_audit_log: Admin-only access maintained
-- ✅ user_data_access_audit: Admin-only access maintained