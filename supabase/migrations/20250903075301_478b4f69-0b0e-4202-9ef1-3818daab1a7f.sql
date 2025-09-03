-- Fix security warnings by updating functions and handling materialized view dependencies

-- 1) Update admin_get_subscription_analytics to not depend on materialized view
DROP FUNCTION IF EXISTS public.admin_get_subscription_analytics();

-- 2) Create replacement function for subscription analytics
CREATE OR REPLACE FUNCTION public.admin_get_subscription_analytics()
RETURNS TABLE(
  plan_id uuid,
  plan_name text,
  active_subscriptions bigint,
  mrr numeric,
  churn_rate numeric,
  period_start date,
  period_end date
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to access this data
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    sp.id as plan_id,
    sp.name as plan_name,
    COUNT(s.id)::bigint as active_subscriptions,
    COALESCE(SUM(sp.price_cents), 0)::numeric / 100 as mrr,
    0::numeric as churn_rate,
    CURRENT_DATE - INTERVAL '30 days' as period_start,
    CURRENT_DATE as period_end
  FROM subscription_plans sp
  LEFT JOIN subscriptions s ON sp.id = s.plan_id AND s.status = 'active'
  WHERE sp.is_active = true
  GROUP BY sp.id, sp.name;
END;
$$;

-- 3) Remove refresh function that depends on materialized view
DROP FUNCTION IF EXISTS public.refresh_subscription_analytics();

-- 4) Drop materialized views with cascade to handle dependencies
DROP MATERIALIZED VIEW IF EXISTS public.subscription_analytics CASCADE;
DROP MATERIALIZED VIEW IF EXISTS public.user_engagement_metrics CASCADE;

-- 5) Create secure replacement for user engagement metrics
CREATE OR REPLACE FUNCTION public.get_user_engagement_metrics()
RETURNS TABLE(
  user_id uuid,
  total_sessions bigint,
  avg_session_duration numeric,
  last_activity_date date,
  engagement_score numeric,
  engagement_status text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only allow admins to access this data
  IF NOT is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  SELECT 
    us.user_id,
    COUNT(us.id)::bigint as total_sessions,
    AVG(us.duration_seconds)::numeric as avg_session_duration,
    MAX(us.completed_at)::date as last_activity_date,
    LEAST(100, COUNT(us.id) * 10)::numeric as engagement_score,
    CASE 
      WHEN MAX(us.completed_at) >= CURRENT_DATE - INTERVAL '7 days' THEN 'active'
      WHEN MAX(us.completed_at) >= CURRENT_DATE - INTERVAL '30 days' THEN 'declining'
      ELSE 'inactive'
    END as engagement_status
  FROM user_sessions us
  WHERE us.completed_at >= CURRENT_DATE - INTERVAL '90 days'
  GROUP BY us.user_id;
END;
$$;

-- Note: Auth OTP expiry should be set to 300 seconds in Dashboard: Auth > Settings