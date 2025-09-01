-- Final batch: Fix remaining database functions with search path security vulnerabilities

-- 14. Fix get_user_registration_trends function
CREATE OR REPLACE FUNCTION public.get_user_registration_trends(days_back integer DEFAULT 30)
RETURNS TABLE(date date, new_users bigint, cumulative_users bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - INTERVAL '1 day' * days_back,
      CURRENT_DATE,
      INTERVAL '1 day'
    )::date AS date
  ),
  daily_registrations AS (
    SELECT 
      created_at::date AS reg_date,
      COUNT(*) AS new_users
    FROM users
    WHERE created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
    GROUP BY created_at::date
  )
  SELECT 
    ds.date,
    COALESCE(dr.new_users, 0) AS new_users,
    SUM(COALESCE(dr.new_users, 0)) OVER (ORDER BY ds.date) AS cumulative_users
  FROM date_series ds
  LEFT JOIN daily_registrations dr ON ds.date = dr.reg_date
  ORDER BY ds.date;
END;
$function$;

-- 15. Fix get_active_users_metrics function
CREATE OR REPLACE FUNCTION public.get_active_users_metrics()
RETURNS TABLE(metric_type text, metric_value bigint, period_label text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 'daily_active_users'::TEXT, COUNT(DISTINCT user_id), 'Last 24 hours'::TEXT
  FROM user_sessions
  WHERE completed_at >= NOW() - INTERVAL '1 day'
  
  UNION ALL
  
  SELECT 'weekly_active_users'::TEXT, COUNT(DISTINCT user_id), 'Last 7 days'::TEXT
  FROM user_sessions
  WHERE completed_at >= NOW() - INTERVAL '7 days'
  
  UNION ALL
  
  SELECT 'monthly_active_users'::TEXT, COUNT(DISTINCT user_id), 'Last 30 days'::TEXT
  FROM user_sessions
  WHERE completed_at >= NOW() - INTERVAL '30 days';
END;
$function$;

-- 16. Fix get_feature_flag_analytics function
CREATE OR REPLACE FUNCTION public.get_feature_flag_analytics()
RETURNS TABLE(feature_name text, total_evaluations bigint, enabled_evaluations bigint, adoption_rate numeric, unique_users bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    ff.feature_name,
    COUNT(*)::BIGINT AS total_evaluations,
    COUNT(CASE WHEN ata.variant != 'disabled' THEN 1 END)::BIGINT AS enabled_evaluations,
    ROUND(
      (COUNT(CASE WHEN ata.variant != 'disabled' THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) AS adoption_rate,
    COUNT(DISTINCT ata.user_id)::BIGINT AS unique_users
  FROM feature_flags ff
  LEFT JOIN ab_test_assignments ata ON ff.feature_name = ata.feature_name
  WHERE ff.is_enabled = true
  GROUP BY ff.feature_name
  ORDER BY adoption_rate DESC NULLS LAST;
END;
$function$;

-- 17. Fix get_workout_completion_analytics function
CREATE OR REPLACE FUNCTION public.get_workout_completion_analytics(days_back integer DEFAULT 30)
RETURNS TABLE(exercise_name text, total_attempts bigint, avg_duration numeric, completion_rate numeric, popularity_rank bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    pe.name AS exercise_name,
    COUNT(us.id)::BIGINT AS total_attempts,
    ROUND(AVG(us.duration_seconds), 1) AS avg_duration,
    ROUND(
      (COUNT(CASE WHEN us.duration_seconds >= 30 THEN 1 END)::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
      2
    ) AS completion_rate,
    ROW_NUMBER() OVER (ORDER BY COUNT(us.id) DESC) AS popularity_rank
  FROM plank_exercises pe
  LEFT JOIN user_sessions us ON pe.id = us.exercise_id
    AND us.completed_at >= NOW() - INTERVAL '1 day' * days_back
  GROUP BY pe.id, pe.name
  HAVING COUNT(us.id) > 0
  ORDER BY total_attempts DESC;
END;
$function$;

-- 18. Fix get_user_engagement_summary function
CREATE OR REPLACE FUNCTION public.get_user_engagement_summary()
RETURNS TABLE(total_users bigint, active_today bigint, active_this_week bigint, avg_sessions_per_user numeric, avg_session_duration numeric, total_sessions bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM users)::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE completed_at >= CURRENT_DATE)::BIGINT,
    (SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE completed_at >= CURRENT_DATE - INTERVAL '7 days')::BIGINT,
    ROUND(
      (SELECT COUNT(*)::NUMERIC FROM user_sessions WHERE completed_at >= CURRENT_DATE - INTERVAL '30 days') / 
      NULLIF((SELECT COUNT(DISTINCT user_id) FROM user_sessions WHERE completed_at >= CURRENT_DATE - INTERVAL '30 days'), 0),
      2
    ),
    ROUND(
      (SELECT AVG(duration_seconds) FROM user_sessions WHERE completed_at >= CURRENT_DATE - INTERVAL '30 days'),
      1
    ),
    (SELECT COUNT(*) FROM user_sessions)::BIGINT;
END;
$function$;

-- 19. Fix get_admin_activity_summary function
CREATE OR REPLACE FUNCTION public.get_admin_activity_summary(days_back integer DEFAULT 7)
RETURNS TABLE(action_type text, action_count bigint, last_action_at timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    'feature_flag_changes'::TEXT,
    COUNT(*)::BIGINT,
    MAX(updated_at)
  FROM feature_flags
  WHERE updated_at >= NOW() - INTERVAL '1 day' * days_back
  
  UNION ALL
  
  SELECT 
    'user_role_assignments'::TEXT,
    COUNT(*)::BIGINT,
    MAX(created_at)
  FROM user_roles
  WHERE created_at >= NOW() - INTERVAL '1 day' * days_back;
END;
$function$;

-- 20. Fix bootstrap_first_admin function
CREATE OR REPLACE FUNCTION public.bootstrap_first_admin(user_email text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  target_user_id UUID;
BEGIN
  -- Find user by email
  SELECT id INTO target_user_id
  FROM auth.users
  WHERE email = user_email;
  
  IF target_user_id IS NULL THEN
    RAISE EXCEPTION 'User with email % not found', user_email;
  END IF;
  
  -- Insert admin role if it doesn't exist
  INSERT INTO user_roles (user_id, role)
  VALUES (target_user_id, 'admin'::app_role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN TRUE;
END;
$function$;

-- 21. Fix get_device_platform_analytics function
CREATE OR REPLACE FUNCTION public.get_device_platform_analytics(days_back integer DEFAULT 30)
RETURNS TABLE(platform_type text, device_category text, user_count bigint, session_count bigint, avg_session_duration numeric, bounce_rate numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH user_agents AS (
    SELECT DISTINCT
      user_id,
      CASE 
        WHEN user_agent ILIKE '%mobile%' OR user_agent ILIKE '%android%' OR user_agent ILIKE '%iphone%' THEN 'Mobile'
        WHEN user_agent ILIKE '%tablet%' OR user_agent ILIKE '%ipad%' THEN 'Tablet'
        ELSE 'Desktop'
      END AS device_category,
      CASE 
        WHEN user_agent ILIKE '%windows%' THEN 'Windows'
        WHEN user_agent ILIKE '%mac%' OR user_agent ILIKE '%darwin%' THEN 'macOS'
        WHEN user_agent ILIKE '%linux%' THEN 'Linux'
        WHEN user_agent ILIKE '%android%' THEN 'Android'
        WHEN user_agent ILIKE '%ios%' OR user_agent ILIKE '%iphone%' OR user_agent ILIKE '%ipad%' THEN 'iOS'
        ELSE 'Other'
      END AS platform_type
    FROM user_sessions
    WHERE completed_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
      AND user_agent IS NOT NULL
  ),
  session_data AS (
    SELECT 
      us.user_id,
      ua.platform_type,
      ua.device_category,
      us.duration_seconds,
      CASE WHEN us.duration_seconds < 30 THEN 1 ELSE 0 END AS is_bounce
    FROM user_sessions us
    JOIN user_agents ua ON us.user_id = ua.user_id
    WHERE us.completed_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  )
  SELECT 
    sd.platform_type,
    sd.device_category,
    COUNT(DISTINCT sd.user_id) AS user_count,
    COUNT(*) AS session_count,
    ROUND(AVG(sd.duration_seconds), 1) AS avg_session_duration,
    ROUND((SUM(sd.is_bounce)::numeric / COUNT(*)) * 100, 1) AS bounce_rate
  FROM session_data sd
  GROUP BY sd.platform_type, sd.device_category
  ORDER BY user_count DESC;
END;
$function$;

-- 22. Fix should_refresh_achievement_progress function
CREATE OR REPLACE FUNCTION public.should_refresh_achievement_progress(p_user_id uuid, p_achievement_id text, p_last_session_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  last_progress_update TIMESTAMP WITH TIME ZONE;
  latest_session TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get last progress update
  SELECT last_updated INTO last_progress_update
  FROM user_achievement_progress
  WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
  
  -- If no progress record exists, needs refresh
  IF last_progress_update IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Get latest session if not provided
  IF p_last_session_at IS NULL THEN
    SELECT MAX(completed_at) INTO latest_session
    FROM user_sessions
    WHERE user_id = p_user_id;
  ELSE
    latest_session := p_last_session_at;
  END IF;
  
  -- Needs refresh if there's a session after last update
  RETURN latest_session > last_progress_update;
END;
$function$;