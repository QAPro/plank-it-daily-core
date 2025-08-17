
-- Create admin analytics functions for system-wide metrics

-- Function to get user registration trends
CREATE OR REPLACE FUNCTION get_user_registration_trends(
  days_back INTEGER DEFAULT 30
)
RETURNS TABLE(
  date DATE,
  new_users BIGINT,
  cumulative_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Function to get active users metrics
CREATE OR REPLACE FUNCTION get_active_users_metrics()
RETURNS TABLE(
  metric_type TEXT,
  metric_value BIGINT,
  period_label TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Function to get feature flag adoption rates
CREATE OR REPLACE FUNCTION get_feature_flag_analytics()
RETURNS TABLE(
  feature_name TEXT,
  total_evaluations BIGINT,
  enabled_evaluations BIGINT,
  adoption_rate NUMERIC,
  unique_users BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Function to get workout completion analytics
CREATE OR REPLACE FUNCTION get_workout_completion_analytics(days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  exercise_name TEXT,
  total_attempts BIGINT,
  avg_duration NUMERIC,
  completion_rate NUMERIC,
  popularity_rank BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Function to get user engagement summary
CREATE OR REPLACE FUNCTION get_user_engagement_summary()
RETURNS TABLE(
  total_users BIGINT,
  active_today BIGINT,
  active_this_week BIGINT,
  avg_sessions_per_user NUMERIC,
  avg_session_duration NUMERIC,
  total_sessions BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Function to get admin audit summary (mock data for now since audit table structure unknown)
CREATE OR REPLACE FUNCTION get_admin_activity_summary(days_back INTEGER DEFAULT 7)
RETURNS TABLE(
  action_type TEXT,
  action_count BIGINT,
  last_action_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
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
$$;

-- Create RLS policies for admin analytics functions
GRANT EXECUTE ON FUNCTION get_user_registration_trends TO authenticated;
GRANT EXECUTE ON FUNCTION get_active_users_metrics TO authenticated;
GRANT EXECUTE ON FUNCTION get_feature_flag_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_workout_completion_analytics TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_engagement_summary TO authenticated;
GRANT EXECUTE ON FUNCTION get_admin_activity_summary TO authenticated;
