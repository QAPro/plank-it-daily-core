
-- User Retention Cohorts Function
CREATE OR REPLACE FUNCTION public.get_user_retention_cohorts(months_back integer DEFAULT 6)
 RETURNS TABLE(
   cohort_month text,
   cohort_size bigint,
   week_1_retention numeric,
   week_2_retention numeric,
   week_4_retention numeric,
   week_8_retention numeric,
   week_12_retention numeric
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
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

-- Onboarding Analytics Function
CREATE OR REPLACE FUNCTION public.get_onboarding_analytics(days_back integer DEFAULT 30)
 RETURNS TABLE(
   step_name text,
   total_users bigint,
   completed_users bigint,
   completion_rate numeric,
   avg_time_to_complete numeric,
   drop_off_rate numeric
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  WITH onboarding_steps AS (
    SELECT 
      'welcome' AS step_name, 1 AS step_order
    UNION ALL SELECT 'fitness_level', 2 
    UNION ALL SELECT 'goal_selection', 3
    UNION ALL SELECT 'assessment', 4
    UNION ALL SELECT 'first_workout', 5
    UNION ALL SELECT 'completion', 6
  ),
  user_progress AS (
    SELECT 
      uo.user_id,
      u.created_at,
      uo.welcome_completed,
      uo.fitness_level_completed,
      uo.goal_selection_completed,
      uo.assessment_completed,
      uo.first_workout_completed,
      uo.is_completed,
      uo.completed_at,
      EXTRACT(EPOCH FROM (uo.completed_at - u.created_at))/3600 AS completion_hours
    FROM user_onboarding uo
    JOIN users u ON uo.user_id = u.id
    WHERE u.created_at >= CURRENT_DATE - INTERVAL '1 day' * days_back
  ),
  step_analytics AS (
    SELECT 
      'welcome' AS step_name,
      COUNT(*) AS total_users,
      COUNT(CASE WHEN welcome_completed THEN 1 END) AS completed_users,
      AVG(CASE WHEN welcome_completed THEN completion_hours END) AS avg_completion_time
    FROM user_progress
    
    UNION ALL
    
    SELECT 
      'fitness_level',
      COUNT(CASE WHEN welcome_completed THEN 1 END),
      COUNT(CASE WHEN fitness_level_completed THEN 1 END),
      AVG(CASE WHEN fitness_level_completed THEN completion_hours END)
    FROM user_progress
    
    UNION ALL
    
    SELECT 
      'goal_selection',
      COUNT(CASE WHEN fitness_level_completed THEN 1 END),
      COUNT(CASE WHEN goal_selection_completed THEN 1 END),
      AVG(CASE WHEN goal_selection_completed THEN completion_hours END)
    FROM user_progress
    
    UNION ALL
    
    SELECT 
      'assessment',
      COUNT(CASE WHEN goal_selection_completed THEN 1 END),
      COUNT(CASE WHEN assessment_completed THEN 1 END),
      AVG(CASE WHEN assessment_completed THEN completion_hours END)
    FROM user_progress
    
    UNION ALL
    
    SELECT 
      'first_workout',
      COUNT(CASE WHEN assessment_completed THEN 1 END),
      COUNT(CASE WHEN first_workout_completed THEN 1 END),
      AVG(CASE WHEN first_workout_completed THEN completion_hours END)
    FROM user_progress
    
    UNION ALL
    
    SELECT 
      'completion',
      COUNT(CASE WHEN first_workout_completed THEN 1 END),
      COUNT(CASE WHEN is_completed THEN 1 END),
      AVG(CASE WHEN is_completed THEN completion_hours END)
    FROM user_progress
  )
  SELECT 
    sa.step_name,
    sa.total_users,
    sa.completed_users,
    ROUND((sa.completed_users::numeric / NULLIF(sa.total_users, 0)) * 100, 1) AS completion_rate,
    ROUND(sa.avg_completion_time, 1) AS avg_time_to_complete,
    ROUND(((sa.total_users - sa.completed_users)::numeric / NULLIF(sa.total_users, 0)) * 100, 1) AS drop_off_rate
  FROM step_analytics sa
  ORDER BY 
    CASE sa.step_name 
      WHEN 'welcome' THEN 1
      WHEN 'fitness_level' THEN 2
      WHEN 'goal_selection' THEN 3
      WHEN 'assessment' THEN 4
      WHEN 'first_workout' THEN 5
      WHEN 'completion' THEN 6
    END;
END;
$function$;

-- Device/Platform Analytics Function  
CREATE OR REPLACE FUNCTION public.get_device_platform_analytics(days_back integer DEFAULT 30)
 RETURNS TABLE(
   platform_type text,
   device_category text,
   user_count bigint,
   session_count bigint,
   avg_session_duration numeric,
   bounce_rate numeric
 )
 LANGUAGE plpgsql
 SECURITY DEFINER
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

-- Create user_agent column if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_sessions' AND column_name = 'user_agent'
  ) THEN
    ALTER TABLE user_sessions ADD COLUMN user_agent text;
  END IF;
END $$;
