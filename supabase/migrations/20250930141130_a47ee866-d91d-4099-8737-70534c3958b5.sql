-- Secure user_success_stories (without status column)

ALTER TABLE public.user_success_stories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view public stories" ON public.user_success_stories;
DROP POLICY IF EXISTS "Users can view own stories" ON public.user_success_stories;
DROP POLICY IF EXISTS "Users can manage own stories" ON public.user_success_stories;
DROP POLICY IF EXISTS "Admins can view all stories" ON public.user_success_stories;
DROP POLICY IF EXISTS "Anyone can view public stories" ON public.user_success_stories;

-- Anyone can view public stories
CREATE POLICY "Anyone can view public stories"
ON public.user_success_stories
FOR SELECT
TO authenticated
USING (is_public = true);

-- Users can view their own stories (public or private)
CREATE POLICY "Users can view own stories"
ON public.user_success_stories
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Users can manage their own stories
CREATE POLICY "Users can manage own stories"
ON public.user_success_stories
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all stories
CREATE POLICY "Admins can view all stories"
ON public.user_success_stories
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Apply FORCE ROW LEVEL SECURITY to all critical tables
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_data_access_audit FORCE ROW LEVEL SECURITY;
ALTER TABLE public.user_success_stories FORCE ROW LEVEL SECURITY;