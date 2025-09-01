-- Fix database function search path security vulnerabilities
-- Add SET search_path TO 'public' to all functions missing this critical security setting

-- 1. Fix has_role function
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$function$;

-- 2. Fix is_admin function  
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE 
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT public.has_role(_user_id, 'admin');
$function$;

-- 3. Fix get_subscription_health_score function
CREATE OR REPLACE FUNCTION public.get_subscription_health_score(target_user_id uuid)
RETURNS TABLE(health_score integer, risk_factors jsonb, recommendations jsonb)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  score INTEGER := 100;
  factors JSONB := '[]'::jsonb;
  recommendations JSONB := '[]'::jsonb;
  sub_record RECORD;
  payment_failures INTEGER;
  usage_rate NUMERIC;
BEGIN
  -- Get subscription info
  SELECT s.*, sp.name as plan_name, sp.price_cents
  INTO sub_record
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = target_user_id AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, '["no_active_subscription"]'::jsonb, '["consider_upgrade_campaign"]'::jsonb;
    RETURN;
  END IF;
  
  -- Check payment failures
  SELECT COUNT(*) INTO payment_failures
  FROM billing_transactions bt
  WHERE bt.user_id = target_user_id 
    AND bt.status = 'failed'
    AND bt.created_at >= NOW() - INTERVAL '30 days';
  
  IF payment_failures > 0 THEN
    score := score - (payment_failures * 20);
    factors := factors || '"payment_failures"'::jsonb;
    recommendations := recommendations || '"review_payment_method"'::jsonb;
  END IF;
  
  -- Check if subscription is near expiration
  IF sub_record.current_period_end < NOW() + INTERVAL '7 days' THEN
    score := score - 30;
    factors := factors || '"expiring_soon"'::jsonb;
    recommendations := recommendations || '"renewal_reminder"'::jsonb;
  END IF;
  
  -- Check usage rate (sessions in last 30 days)
  SELECT COUNT(*) INTO usage_rate
  FROM user_sessions us
  WHERE us.user_id = target_user_id 
    AND us.completed_at >= NOW() - INTERVAL '30 days';
  
  IF usage_rate < 5 THEN
    score := score - 25;
    factors := factors || '"low_usage"'::jsonb;
    recommendations := recommendations || '"engagement_campaign"'::jsonb;
  END IF;
  
  -- Ensure score doesn't go below 0
  score := GREATEST(score, 0);
  
  RETURN QUERY SELECT score, factors, recommendations;
END;
$function$;

-- 4. Fix refresh_subscription_analytics function
CREATE OR REPLACE FUNCTION public.refresh_subscription_analytics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW subscription_analytics;
END;
$function$;

-- 5. Fix refresh_user_engagement_metrics function
CREATE OR REPLACE FUNCTION public.refresh_user_engagement_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  REFRESH MATERIALIZED VIEW user_engagement_metrics;
END;
$function$;

-- 6. Fix get_user_billing_history function
CREATE OR REPLACE FUNCTION public.get_user_billing_history(target_user_id uuid, limit_count integer DEFAULT 10)
RETURNS TABLE(transaction_id uuid, amount_cents integer, currency text, status text, description text, created_at timestamp with time zone, stripe_payment_intent_id text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only the user themselves or an admin can query this
  IF NOT (auth.uid() = target_user_id OR EXISTS(
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    bt.id,
    bt.amount_cents,
    bt.currency,
    bt.status,
    bt.description,
    bt.created_at,
    bt.stripe_payment_intent_id
  FROM billing_transactions bt
  WHERE bt.user_id = target_user_id
  ORDER BY bt.created_at DESC
  LIMIT limit_count;
END;
$function$;

-- 7. Fix get_user_subscription_timeline function
CREATE OR REPLACE FUNCTION public.get_user_subscription_timeline(target_user_id uuid)
RETURNS TABLE(event_date timestamp with time zone, event_type text, event_description text, plan_name text, amount_cents integer, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Only the user themselves or an admin can query this
  IF NOT (auth.uid() = target_user_id OR EXISTS(
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )) THEN
    RETURN;
  END IF;

  RETURN QUERY
  -- Subscription events
  SELECT 
    s.created_at as event_date,
    'subscription_created'::TEXT as event_type,
    'Subscription created for ' || sp.name as event_description,
    sp.name as plan_name,
    sp.price_cents as amount_cents,
    s.status
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = target_user_id
  
  UNION ALL
  
  -- Billing events
  SELECT 
    bt.created_at as event_date,
    CASE bt.status
      WHEN 'completed' THEN 'payment_success'
      WHEN 'failed' THEN 'payment_failed'
      ELSE 'payment_pending'
    END as event_type,
    bt.description as event_description,
    NULL as plan_name,
    bt.amount_cents,
    bt.status
  FROM billing_transactions bt
  WHERE bt.user_id = target_user_id
  
  ORDER BY event_date DESC;
END;
$function$;

-- 8. Fix evaluate_user_cohort function
CREATE OR REPLACE FUNCTION public.evaluate_user_cohort(_user_id uuid, _cohort_rules jsonb)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_data RECORD;
  rule_key TEXT;
  rule_value JSONB;
  subscription_tier TEXT;
  current_level INTEGER;
  total_xp INTEGER;
  registration_date DATE;
BEGIN
  -- Get user data
  SELECT u.subscription_tier, u.current_level, u.total_xp, u.created_at::date
  INTO user_data
  FROM users u
  WHERE u.id = _user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  subscription_tier := user_data.subscription_tier;
  current_level := user_data.current_level;
  total_xp := user_data.total_xp;
  registration_date := user_data.created_at;
  
  -- Evaluate each rule
  FOR rule_key, rule_value IN SELECT * FROM jsonb_each(_cohort_rules)
  LOOP
    CASE rule_key
      WHEN 'subscription_tiers' THEN
        IF NOT (subscription_tier = ANY(ARRAY(SELECT jsonb_array_elements_text(rule_value)))) THEN
          RETURN FALSE;
        END IF;
      WHEN 'min_level' THEN
        IF current_level < (rule_value->>0)::INTEGER THEN
          RETURN FALSE;
        END IF;
      WHEN 'max_level' THEN
        IF current_level > (rule_value->>0)::INTEGER THEN
          RETURN FALSE;
        END IF;
      WHEN 'min_xp' THEN
        IF total_xp < (rule_value->>0)::INTEGER THEN
          RETURN FALSE;
        END IF;
      WHEN 'registration_after' THEN
        IF registration_date <= (rule_value->>0)::DATE THEN
          RETURN FALSE;
        END IF;
      WHEN 'registration_before' THEN
        IF registration_date >= (rule_value->>0)::DATE THEN
          RETURN FALSE;
        END IF;
    END CASE;
  END LOOP;
  
  RETURN TRUE;
END;
$function$;