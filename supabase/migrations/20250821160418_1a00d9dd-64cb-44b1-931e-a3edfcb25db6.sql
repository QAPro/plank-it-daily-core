
-- 1) Harden SECURITY DEFINER functions: enforce a fixed search_path
-- It's safe to run even if some already have it.

ALTER FUNCTION public.has_role(uuid, app_role) SET search_path TO 'public';
ALTER FUNCTION public.is_admin(uuid) SET search_path TO 'public';

ALTER FUNCTION public.get_user_active_subscription(uuid) SET search_path TO 'public';
ALTER FUNCTION public.increment_challenge_participants(uuid) SET search_path TO 'public';
ALTER FUNCTION public.update_goal_progress() SET search_path TO 'public';
ALTER FUNCTION public.update_user_weekly_stats() SET search_path TO 'public';
ALTER FUNCTION public.update_user_monthly_stats() SET search_path TO 'public';

ALTER FUNCTION public.get_subscription_health_score(uuid) SET search_path TO 'public';
ALTER FUNCTION public.refresh_subscription_analytics() SET search_path TO 'public';
ALTER FUNCTION public.refresh_user_engagement_metrics() SET search_path TO 'public';
ALTER FUNCTION public.get_user_billing_history(uuid, integer) SET search_path TO 'public';
ALTER FUNCTION public.get_user_subscription_timeline(uuid) SET search_path TO 'public';

ALTER FUNCTION public.evaluate_user_cohort(uuid, jsonb) SET search_path TO 'public';
ALTER FUNCTION public.get_user_feature_flag(uuid, text) SET search_path TO 'public';
ALTER FUNCTION public.refresh_user_cohort_memberships(uuid) SET search_path TO 'public';
ALTER FUNCTION public.get_user_retention_cohorts(integer) SET search_path TO 'public';

ALTER FUNCTION public.find_user_by_username_or_email(text) SET search_path TO 'public';
ALTER FUNCTION public.handle_new_user() SET search_path TO 'public';
ALTER FUNCTION public.set_user_sessions_completed_at() SET search_path TO 'public';

ALTER FUNCTION public.get_onboarding_analytics(integer) SET search_path TO 'public';
ALTER FUNCTION public.get_user_registration_trends(integer) SET search_path TO 'public';
ALTER FUNCTION public.get_active_users_metrics() SET search_path TO 'public';
ALTER FUNCTION public.get_feature_flag_analytics() SET search_path TO 'public';
ALTER FUNCTION public.get_workout_completion_analytics(integer) SET search_path TO 'public';
ALTER FUNCTION public.get_user_engagement_summary() SET search_path TO 'public';
ALTER FUNCTION public.get_admin_activity_summary(integer) SET search_path TO 'public';
ALTER FUNCTION public.bootstrap_first_admin(text) SET search_path TO 'public';
ALTER FUNCTION public.get_device_platform_analytics(integer) SET search_path TO 'public';
ALTER FUNCTION public.set_updated_at() SET search_path TO 'public';

-- 2) Lock down materialized views (MV) from direct API access
-- These MVs cannot have RLS, so prevent anon/authenticated direct access.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname='public' AND matviewname='user_engagement_metrics') THEN
    REVOKE ALL ON MATERIALIZED VIEW public.user_engagement_metrics FROM PUBLIC;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname='public' AND matviewname='subscription_analytics') THEN
    REVOKE ALL ON MATERIALIZED VIEW public.subscription_analytics FROM PUBLIC;
  END IF;
END$$;

-- 3) Create secured RPCs to read those MVs safely

-- 3a) Per-user engagement metrics (self or admin)
CREATE OR REPLACE FUNCTION public.get_user_engagement_metrics_row(target_user_id uuid DEFAULT auth.uid())
RETURNS SETOF user_engagement_metrics
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT (auth.uid() = target_user_id OR public.is_admin(auth.uid())) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT * FROM public.user_engagement_metrics WHERE user_id = target_user_id;
END;
$function$;

-- 3b) Admin: get user IDs by engagement status (used for segmentation)
CREATE OR REPLACE FUNCTION public.admin_get_user_ids_by_engagement_status(_status text)
RETURNS TABLE(user_id uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT uem.user_id
  FROM public.user_engagement_metrics uem
  WHERE uem.engagement_status = _status;
END;
$function$;

-- 3c) Admin: subscription analytics via MV
CREATE OR REPLACE FUNCTION public.admin_get_subscription_analytics()
RETURNS SETOF subscription_analytics
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT * FROM public.subscription_analytics;
END;
$function$;

-- 4) Prevent email/username leakage:
-- Restrict the lookup RPC so only admins can use it.
CREATE OR REPLACE FUNCTION public.find_user_by_username_or_email(identifier text)
RETURNS TABLE(user_id uuid, email text, username text, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Allow admins only
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT u.id, u.email, u.username, u.full_name
  FROM public.users u
  WHERE u.username = identifier OR u.email = identifier;
END;
$function$;

-- 5) Strengthen billing data access with RLS (if not enabled yet)

-- Enable RLS
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='billing_transactions') THEN
    EXECUTE 'ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY';
    -- Users can read their own billing transactions
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='billing_transactions' AND policyname='Users can view own billing transactions'
    ) THEN
      EXECUTE $$CREATE POLICY "Users can view own billing transactions"
        ON public.billing_transactions
        FOR SELECT
        USING (auth.uid() = user_id)$$;
    END IF;

    -- Admins can read all
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname='public' AND tablename='billing_transactions' AND policyname='Admins can view billing transactions'
    ) THEN
      EXECUTE $$CREATE POLICY "Admins can view billing transactions"
        ON public.billing_transactions
        FOR SELECT
        USING (public.is_admin(auth.uid()))$$;
    END IF;
  END IF;
END$$;
