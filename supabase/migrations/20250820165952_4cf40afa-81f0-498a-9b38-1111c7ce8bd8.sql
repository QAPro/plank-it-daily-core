
-- 1) Safe username availability check (boolean only, no PII)
CREATE OR REPLACE FUNCTION public.does_username_exist(identifier text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.users u
    WHERE lower(u.username) = lower(identifier)
  );
$$;

-- Expose to client roles so the app can use it
GRANT EXECUTE ON FUNCTION public.does_username_exist(text) TO anon, authenticated;


-- 2) Lock down the PII enumerating function to admins only
-- Before: anyone could enumerate by username or email via SECURITY DEFINER
-- After: only admins receive results; others get no rows.
CREATE OR REPLACE FUNCTION public.find_user_by_username_or_email(identifier text)
RETURNS TABLE(user_id uuid, email text, username text, full_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Restrict to admins only to avoid PII enumeration
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT u.id, u.email, u.username, u.full_name
  FROM public.users u
  WHERE u.username = identifier OR u.email = identifier;
END;
$function$;


-- 3) Guard get_subscription_health_score so only the user or an admin can query it
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
  -- Authorization guard: only the user or an admin may query this
  IF NOT (auth.uid() = target_user_id OR public.is_admin(auth.uid())) THEN
    RETURN;
  END IF;

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


-- 4) Normalize SECURITY DEFINER functions to use a safe search_path
-- (Prevents function hijacking via later object shadowing)
-- Only updating those that lacked "SET search_path TO 'public'"

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

CREATE OR REPLACE FUNCTION public.get_user_feature_flag(_user_id uuid, _feature_name text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  flag_record RECORD;
  user_override RECORD;
  cohort_match BOOLEAN := FALSE;
  rollout_percentage INTEGER;
  user_hash TEXT;
  hash_value INTEGER;
  ab_assignment RECORD;
  result JSONB := '{"enabled": false, "variant": null}';
BEGIN
  -- Check for user-specific override first
  SELECT * INTO user_override
  FROM user_feature_overrides
  WHERE user_id = _user_id 
    AND feature_name = _feature_name
    AND (expires_at IS NULL OR expires_at > now());
  
  IF FOUND THEN
    result := jsonb_build_object(
      'enabled', user_override.is_enabled,
      'variant', 'override',
      'source', 'user_override'
    );
    RETURN result;
  END IF;
  
  -- Get feature flag
  SELECT * INTO flag_record
  FROM feature_flags
  WHERE feature_name = _feature_name AND is_enabled = true;
  
  IF NOT FOUND THEN
    RETURN result;
  END IF;
  
  -- Check cohort rules if they exist
  IF flag_record.cohort_rules != '{}' THEN
    cohort_match := evaluate_user_cohort(_user_id, flag_record.cohort_rules);
    IF NOT cohort_match THEN
      RETURN result;
    END IF;
  END IF;
  
  -- Check rollout percentage
  rollout_percentage := COALESCE(flag_record.rollout_percentage, 100);
  IF rollout_percentage < 100 THEN
    user_hash := md5(_user_id::text || _feature_name);
    hash_value := ('x' || substr(user_hash, 1, 8))::bit(32)::integer;
    IF abs(hash_value) % 100 >= rollout_percentage THEN
      RETURN result;
    END IF;
  END IF;
  
  -- Handle A/B testing
  IF flag_record.ab_test_config IS NOT NULL THEN
    -- Check existing assignment
    SELECT * INTO ab_assignment
    FROM ab_test_assignments
    WHERE user_id = _user_id AND feature_name = _feature_name;
    
    IF NOT FOUND THEN
      -- Create new assignment
      DECLARE
        variants JSONB := flag_record.ab_test_config->'variants';
        variant_count INTEGER := jsonb_array_length(variants);
        selected_variant TEXT;
        assignment_hash_val TEXT;
      BEGIN
        assignment_hash_val := md5(_user_id::text || _feature_name || 'ab_test');
        selected_variant := (variants->>((('x' || substr(assignment_hash_val, 1, 8))::bit(32)::integer % variant_count)));
        
        INSERT INTO ab_test_assignments (user_id, feature_name, variant, assignment_hash)
        VALUES (_user_id, _feature_name, selected_variant, assignment_hash_val);
        
        result := jsonb_build_object(
          'enabled', true,
          'variant', selected_variant,
          'source', 'ab_test'
        );
      END;
    ELSE
      result := jsonb_build_object(
        'enabled', true,
        'variant', ab_assignment.variant,
        'source', 'ab_test'
      );
    END IF;
  ELSE
    -- Standard feature flag
    result := jsonb_build_object(
      'enabled', true,
      'variant', 'default',
      'source', 'feature_flag'
    );
  END IF;
  
  RETURN result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.refresh_user_cohort_memberships(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  cohort_record RECORD;
BEGIN
  -- Remove expired memberships
  DELETE FROM user_cohort_memberships
  WHERE user_id = _user_id 
    AND expires_at IS NOT NULL 
    AND expires_at <= now();
  
  -- Check all active cohorts
  FOR cohort_record IN 
    SELECT id, rules FROM feature_cohorts WHERE is_active = true
  LOOP
    IF evaluate_user_cohort(_user_id, cohort_record.rules) THEN
      -- Add membership if not exists
      INSERT INTO user_cohort_memberships (user_id, cohort_id)
      VALUES (_user_id, cohort_record.id)
      ON CONFLICT (user_id, cohort_id) DO NOTHING;
    ELSE
      -- Remove membership if exists
      DELETE FROM user_cohort_memberships
      WHERE user_id = _user_id AND cohort_id = cohort_record.id;
    END IF;
  END LOOP;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_retention_cohorts(months_back integer DEFAULT 6)
RETURNS TABLE(cohort_month text, cohort_size bigint, week_1_retention numeric, week_2_retention numeric, week_4_retention numeric, week_8_retention numeric, week_12_retention numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH cohorts AS (
    SELECT 
      date_trunc('month', created_at) AS cohort_month,
      id AS user_id,
      created_at
    FROM users
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 month' * months_back
  ),
  cohort_sizes AS (
    SELECT 
      cohort_month,
      COUNT(*) AS cohort_size
    FROM cohorts
    GROUP BY cohort_month
  ),
  user_activity AS (
    SELECT DISTINCT
      us.user_id,
      date_trunc('week', us.completed_at) AS activity_week
    FROM user_sessions us
    WHERE completed_at >= CURRENT_DATE - INTERVAL '1 month' * months_back
  ),
  retention_data AS (
    SELECT 
      c.cohort_month,
      cs.cohort_size,
      COUNT(DISTINCT CASE 
        WHEN ua.activity_week BETWEEN date_trunc('week', c.cohort_month) 
        AND date_trunc('week', c.cohort_month) + INTERVAL '1 week' - INTERVAL '1 day'
        THEN c.user_id END) AS week_1_active,
      COUNT(DISTINCT CASE 
        WHEN ua.activity_week BETWEEN date_trunc('week', c.cohort_month) + INTERVAL '1 week'
        AND date_trunc('week', c.cohort_month) + INTERVAL '2 weeks' - INTERVAL '1 day'
        THEN c.user_id END) AS week_2_active,
      COUNT(DISTINCT CASE 
        WHEN ua.activity_week BETWEEN date_trunc('week', c.cohort_month) + INTERVAL '3 weeks'
        AND date_trunc('week', c.cohort_month) + INTERVAL '4 weeks' - INTERVAL '1 day'
        THEN c.user_id END) AS week_4_active,
      COUNT(DISTINCT CASE 
        WHEN ua.activity_week BETWEEN date_trunc('week', c.cohort_month) + INTERVAL '7 weeks'
        AND date_trunc('week', c.cohort_month) + INTERVAL '8 weeks' - INTERVAL '1 day'
        THEN c.user_id END) AS week_8_active,
      COUNT(DISTINCT CASE 
        WHEN ua.activity_week BETWEEN date_trunc('week', c.cohort_month) + INTERVAL '11 weeks'
        AND date_trunc('week', c.cohort_month) + INTERVAL '12 weeks' - INTERVAL '1 day'
        THEN c.user_id END) AS week_12_active
    FROM cohorts c
    JOIN cohort_sizes cs ON c.cohort_month = cs.cohort_month
    LEFT JOIN user_activity ua ON c.user_id = ua.user_id
    GROUP BY c.cohort_month, cs.cohort_size
  )
  SELECT 
    to_char(cohort_month, 'YYYY-MM') AS cohort_month,
    cohort_size,
    ROUND((week_1_active::numeric / cohort_size) * 100, 1) AS week_1_retention,
    ROUND((week_2_active::numeric / cohort_size) * 100, 1) AS week_2_retention,
    ROUND((week_4_active::numeric / cohort_size) * 100, 1) AS week_4_retention,
    ROUND((week_8_active::numeric / cohort_size) * 100, 1) AS week_8_retention,
    ROUND((week_12_active::numeric / cohort_size) * 100, 1) AS week_12_retention
  FROM retention_data
  ORDER BY cohort_month DESC;
END;
$function$;


-- 5) Prevent accidental API exposure of materialized views (no RLS support on MVs)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_matviews
    WHERE schemaname = 'public' AND matviewname = 'subscription_analytics'
  ) THEN
    EXECUTE 'REVOKE ALL ON MATERIALIZED VIEW public.subscription_analytics FROM anon, authenticated';
  END IF;

  IF EXISTS (
    SELECT 1 FROM pg_matviews
    WHERE schemaname = 'public' AND matviewname = 'user_engagement_metrics'
  ) THEN
    EXECUTE 'REVOKE ALL ON MATERIALIZED VIEW public.user_engagement_metrics FROM anon, authenticated';
  END IF;
END
$$;
