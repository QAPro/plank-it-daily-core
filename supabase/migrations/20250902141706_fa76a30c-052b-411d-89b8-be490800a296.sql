
-- 1) Lock down materialized views from API access
REVOKE ALL ON MATERIALIZED VIEW public.subscription_analytics FROM anon, authenticated;
REVOKE ALL ON MATERIALIZED VIEW public.user_engagement_metrics FROM anon, authenticated;

-- 2) Enforce RLS even for table owners (defense-in-depth)
ALTER TABLE public.users FORCE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions FORCE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_log FORCE ROW LEVEL SECURITY;

-- 3) Tighten overly permissive INSERT policies to admin-only

-- Ensure only admins (or service role, which bypasses RLS) can insert audit logs.
ALTER POLICY "System can create audit entries"
  ON public.admin_audit_log
  WITH CHECK (is_admin(auth.uid()));

-- Ensure only admins (or service role) can create billing transactions from the API.
-- Note: this assumes the policy exists with this name; if not, adjust to your existing policy name.
ALTER POLICY "System can create transactions"
  ON public.billing_transactions
  WITH CHECK (is_admin(auth.uid()));

-- Ensure only admins (or service role) can create subscriptions from the API.
ALTER POLICY "System can create subscriptions"
  ON public.subscriptions
  WITH CHECK (is_admin(auth.uid()));
