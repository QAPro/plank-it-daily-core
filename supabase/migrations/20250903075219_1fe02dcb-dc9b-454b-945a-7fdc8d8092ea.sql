-- Fix security warnings with compatible approach

-- 1) Fix function search paths for all functions missing the setting
-- The functions were already updated in the previous migration that succeeded

-- 2) Hide materialized views from API access by dropping and recreating as regular functions
-- since materialized views can't have RLS policies, we'll create secure functions instead

-- Create secure function to replace subscription_analytics materialized view
CREATE OR REPLACE FUNCTION public.get_subscription_analytics()
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

-- Create secure function to replace user_engagement_metrics materialized view
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

-- 3) Drop the materialized views that were exposing data via API
DROP MATERIALIZED VIEW IF EXISTS public.subscription_analytics;
DROP MATERIALIZED VIEW IF EXISTS public.user_engagement_metrics;

-- Note: Auth OTP expiry must be configured in Dashboard: Auth > Settings
-- Recommended: Set OTP expiry to 300 seconds (5 minutes)