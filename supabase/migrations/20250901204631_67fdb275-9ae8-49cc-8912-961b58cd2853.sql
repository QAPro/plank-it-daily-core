-- Continue fixing remaining database functions with search path security vulnerabilities

-- 9. Fix get_user_feature_flag function
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

-- 10. Fix refresh_user_cohort_memberships function
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

-- 11. Fix get_user_retention_cohorts function
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
    WHERE us.completed_at >= CURRENT_DATE - INTERVAL '1 month' * months_back
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

-- 12. Fix set_user_sessions_completed_at function (trigger function)
CREATE OR REPLACE FUNCTION public.set_user_sessions_completed_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;
  RETURN NEW;
END;
$function$;

-- 13. Fix get_onboarding_analytics function
CREATE OR REPLACE FUNCTION public.get_onboarding_analytics(days_back integer DEFAULT 30)
RETURNS TABLE(step_name text, total_users bigint, completed_users bigint, completion_rate numeric, avg_time_to_complete numeric, drop_off_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH new_users AS (
    SELECT id, created_at
    FROM public.users
    WHERE created_at >= CURRENT_DATE - (days_back || ' days')::interval
  ),
  onboarding AS (
    SELECT u.id AS user_id,
           u.created_at AS user_created_at,
           uo.fitness_level,
           uo.experience_level,
           uo.preferred_duration,
           uo.goals,
           uo.completed_at
    FROM new_users u
    LEFT JOIN public.user_onboarding uo ON uo.user_id = u.id
  ),
  assessments AS (
    SELECT ua.user_id,
           MIN(ua.created_at) AS first_assessment_at
    FROM public.user_assessments ua
    WHERE ua.created_at >= CURRENT_DATE - (days_back || ' days')::interval
    GROUP BY ua.user_id
  ),
  sessions AS (
    SELECT us.user_id,
           MIN(us.completed_at) AS first_session_at
    FROM public.user_sessions us
    WHERE us.completed_at IS NOT NULL
      AND us.completed_at >= CURRENT_DATE - (days_back || ' days')::interval
    GROUP BY us.user_id
  ),
  user_flags AS (
    SELECT 
      o.user_id,
      o.user_created_at,
      TRUE AS welcome_completed,
      -- Any of these being present indicates the fitness level step was done
      (o.fitness_level IS NOT NULL 
       OR o.experience_level IS NOT NULL 
       OR o.preferred_duration IS NOT NULL) AS fitness_level_completed,
      (o.goals IS NOT NULL AND array_length(o.goals, 1) > 0) AS goal_selection_completed,
      (a.user_id IS NOT NULL) AS assessment_completed,
      (s.user_id IS NOT NULL) AS first_workout_completed,
      (o.completed_at IS NOT NULL) AS is_completed,
      o.completed_at
    FROM onboarding o
    LEFT JOIN assessments a ON a.user_id = o.user_id
    LEFT JOIN sessions s ON s.user_id = o.user_id
  ),
  -- Funnel roll-up: total at each step is the number who reached previous step
  step_stats AS (
    SELECT 
      'welcome'::text AS step_name,
      COUNT(*)::bigint AS total_users,
      COUNT(*)::bigint AS completed_users,
      NULL::numeric AS avg_time_to_complete
    FROM user_flags

    UNION ALL
    SELECT 
      'fitness_level',
      COUNT(*)::bigint AS total_users,
      COUNT(*) FILTER (WHERE fitness_level_completed) AS completed_users,
      NULL::numeric AS avg_time_to_complete
    FROM user_flags

    UNION ALL
    SELECT 
      'goal_selection',
      COUNT(*) FILTER (WHERE fitness_level_completed) AS total_users,
      COUNT(*) FILTER (WHERE goal_selection_completed) AS completed_users,
      NULL::numeric AS avg_time_to_complete
    FROM user_flags

    UNION ALL
    SELECT 
      'assessment',
      COUNT(*) FILTER (WHERE goal_selection_completed) AS total_users,
      COUNT(*) FILTER (WHERE assessment_completed) AS completed_users,
      NULL::numeric AS avg_time_to_complete
    FROM user_flags

    UNION ALL
    SELECT 
      'first_workout',
      COUNT(*) FILTER (WHERE assessment_completed) AS total_users,
      COUNT(*) FILTER (WHERE first_workout_completed) AS completed_users,
      NULL::numeric AS avg_time_to_complete
    FROM user_flags

    UNION ALL
    SELECT 
      'completion',
      COUNT(*) FILTER (WHERE first_workout_completed) AS total_users,
      COUNT(*) FILTER (WHERE is_completed) AS completed_users,
      ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - user_created_at)))/3600.0, 2)::numeric AS avg_time_to_complete
    FROM user_flags
  )
  SELECT 
    s.step_name,
    s.total_users,
    s.completed_users,
    ROUND((s.completed_users::numeric / NULLIF(s.total_users, 0)) * 100.0, 1) AS completion_rate,
    s.avg_time_to_complete,
    ROUND(((s.total_users - s.completed_users)::numeric / NULLIF(s.total_users, 0)) * 100.0, 1) AS drop_off_rate
  FROM step_stats s
  ORDER BY 
    CASE s.step_name
      WHEN 'welcome' THEN 1
      WHEN 'fitness_level' THEN 2
      WHEN 'goal_selection' THEN 3
      WHEN 'assessment' THEN 4
      WHEN 'first_workout' THEN 5
      WHEN 'completion' THEN 6
    END;
END;
$function$;