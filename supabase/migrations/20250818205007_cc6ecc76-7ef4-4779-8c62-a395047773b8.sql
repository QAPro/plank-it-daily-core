
-- 1) Replace onboarding analytics to match current schema
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

-- 2) Ensure user_sessions has a timestamp even if the client omits it
CREATE OR REPLACE FUNCTION public.set_user_sessions_completed_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_user_sessions_set_completed_at ON public.user_sessions;
CREATE TRIGGER trg_user_sessions_set_completed_at
BEFORE INSERT ON public.user_sessions
FOR EACH ROW
EXECUTE FUNCTION public.set_user_sessions_completed_at();

-- Optional one-time backfill so existing rows participate in analytics windows
UPDATE public.user_sessions
SET completed_at = now()
WHERE completed_at IS NULL;

-- 3) Helpful indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_completed_at ON public.user_sessions (completed_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id_completed_at ON public.user_sessions (user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_agent ON public.user_sessions (user_agent);

CREATE INDEX IF NOT EXISTS idx_user_assessments_user_id_created_at ON public.user_assessments (user_id, created_at);

CREATE INDEX IF NOT EXISTS idx_user_onboarding_user_id ON public.user_onboarding (user_id);

-- 4) Ensure RPCs are callable by authenticated users
GRANT EXECUTE ON FUNCTION public.get_onboarding_analytics(integer) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_device_platform_analytics(integer) TO authenticated;
