-- Achievement Analytics Functions for Admin Dashboard

-- Get achievement completion statistics
CREATE OR REPLACE FUNCTION public.get_achievement_completion_analytics()
RETURNS TABLE(
  achievement_type text,
  achievement_name text,
  total_unlocks bigint,
  completion_rate numeric,
  avg_days_to_unlock numeric,
  category text,
  rarity text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only admins can access achievement analytics
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  WITH total_users AS (
    SELECT COUNT(DISTINCT id) as total_count FROM users
  ),
  achievement_stats AS (
    SELECT 
      ua.achievement_type,
      ua.achievement_name,
      COUNT(*) as unlocks,
      AVG(EXTRACT(EPOCH FROM (ua.earned_at - u.created_at)) / 86400) as avg_days_to_unlock
    FROM user_achievements ua
    JOIN users u ON ua.user_id = u.id
    GROUP BY ua.achievement_type, ua.achievement_name
  )
  SELECT 
    ast.achievement_type,
    ast.achievement_name,
    ast.unlocks,
    ROUND((ast.unlocks::numeric / tu.total_count) * 100, 2) as completion_rate,
    ROUND(ast.avg_days_to_unlock, 1) as avg_days_to_unlock,
    -- Extract category from metadata or default to achievement_type
    COALESCE(
      CASE 
        WHEN ast.achievement_type ILIKE '%streak%' OR ast.achievement_type ILIKE '%daily%' THEN 'consistency'
        WHEN ast.achievement_type ILIKE '%duration%' OR ast.achievement_type ILIKE '%time%' THEN 'performance'
        WHEN ast.achievement_type ILIKE '%explorer%' OR ast.achievement_type ILIKE '%variety%' THEN 'exploration'
        WHEN ast.achievement_type ILIKE '%social%' OR ast.achievement_type ILIKE '%friend%' THEN 'social'
        WHEN ast.achievement_type ILIKE '%milestone%' OR ast.achievement_type ILIKE '%champion%' THEN 'milestone'
        WHEN ast.achievement_type ILIKE '%planking%' OR ast.achievement_type ILIKE '%leg_lift%' 
             OR ast.achievement_type ILIKE '%seated%' OR ast.achievement_type ILIKE '%standing%' 
             OR ast.achievement_type ILIKE '%cardio%' OR ast.achievement_type ILIKE '%strength%' THEN 'category_specific'
        ELSE 'cross_category'
      END, 
      'general'
    ) as category,
    -- Determine rarity based on completion rate
    CASE 
      WHEN (ast.unlocks::numeric / tu.total_count) * 100 >= 50 THEN 'common'
      WHEN (ast.unlocks::numeric / tu.total_count) * 100 >= 25 THEN 'uncommon'
      WHEN (ast.unlocks::numeric / tu.total_count) * 100 >= 10 THEN 'rare'
      WHEN (ast.unlocks::numeric / tu.total_count) * 100 >= 3 THEN 'epic'
      ELSE 'legendary'
    END as rarity
  FROM achievement_stats ast, total_users tu
  ORDER BY ast.unlocks DESC;
END;
$function$;

-- Get achievement category engagement analytics
CREATE OR REPLACE FUNCTION public.get_achievement_category_analytics()
RETURNS TABLE(
  category text,
  total_achievements bigint,
  total_unlocks bigint,
  unique_users_unlocked bigint,
  avg_completion_rate numeric,
  most_popular_achievement text,
  category_engagement_score numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only admins can access achievement analytics
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  WITH categorized_achievements AS (
    SELECT 
      ua.achievement_type,
      ua.achievement_name,
      ua.user_id,
      ua.earned_at,
      CASE 
        WHEN ua.achievement_type ILIKE '%streak%' OR ua.achievement_type ILIKE '%daily%' THEN 'consistency'
        WHEN ua.achievement_type ILIKE '%duration%' OR ua.achievement_type ILIKE '%time%' THEN 'performance'
        WHEN ua.achievement_type ILIKE '%explorer%' OR ua.achievement_type ILIKE '%variety%' THEN 'exploration'
        WHEN ua.achievement_type ILIKE '%social%' OR ua.achievement_type ILIKE '%friend%' THEN 'social'
        WHEN ua.achievement_type ILIKE '%milestone%' OR ua.achievement_type ILIKE '%champion%' THEN 'milestone'
        WHEN ua.achievement_type ILIKE '%planking%' OR ua.achievement_type ILIKE '%leg_lift%' 
             OR ua.achievement_type ILIKE '%seated%' OR ua.achievement_type ILIKE '%standing%' 
             OR ua.achievement_type ILIKE '%cardio%' OR ua.achievement_type ILIKE '%strength%' THEN 'category_specific'
        ELSE 'cross_category'
      END as category
    FROM user_achievements ua
  ),
  category_stats AS (
    SELECT 
      ca.category,
      COUNT(DISTINCT ca.achievement_type) as unique_achievements,
      COUNT(*) as total_unlocks,
      COUNT(DISTINCT ca.user_id) as unique_users,
      ca.achievement_name,
      COUNT(*) OVER (PARTITION BY ca.category, ca.achievement_name) as achievement_popularity
    FROM categorized_achievements ca
    GROUP BY ca.category, ca.achievement_name
  ),
  most_popular_per_category AS (
    SELECT DISTINCT ON (cs.category)
      cs.category,
      cs.achievement_name as most_popular_achievement,
      cs.achievement_popularity
    FROM category_stats cs
    ORDER BY cs.category, cs.achievement_popularity DESC
  ),
  total_users AS (
    SELECT COUNT(DISTINCT id) as total_count FROM users
  )
  SELECT 
    cs.category,
    MAX(cs.unique_achievements) as total_achievements,
    SUM(cs.total_unlocks) as total_unlocks,
    MAX(cs.unique_users) as unique_users_unlocked,
    ROUND(AVG((cs.total_unlocks::numeric / tu.total_count) * 100), 2) as avg_completion_rate,
    mp.most_popular_achievement,
    -- Engagement score based on variety of unlocks and user participation
    ROUND((MAX(cs.unique_users)::numeric / tu.total_count) * 100 + 
          (SUM(cs.total_unlocks)::numeric / MAX(cs.unique_achievements)) / 10, 2) as category_engagement_score
  FROM category_stats cs
  LEFT JOIN most_popular_per_category mp ON cs.category = mp.category
  CROSS JOIN total_users tu
  GROUP BY cs.category, mp.most_popular_achievement, tu.total_count
  ORDER BY category_engagement_score DESC;
END;
$function$;

-- Get achievement unlock trends over time
CREATE OR REPLACE FUNCTION public.get_achievement_unlock_trends(days_back integer DEFAULT 30)
RETURNS TABLE(
  date date,
  total_unlocks bigint,
  unique_users bigint,
  most_unlocked_achievement text,
  category_breakdown jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only admins can access achievement analytics
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (days_back || ' days')::INTERVAL,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE as date
  ),
  daily_unlocks AS (
    SELECT 
      ua.earned_at::date as unlock_date,
      ua.achievement_type,
      ua.achievement_name,
      ua.user_id,
      CASE 
        WHEN ua.achievement_type ILIKE '%streak%' OR ua.achievement_type ILIKE '%daily%' THEN 'consistency'
        WHEN ua.achievement_type ILIKE '%duration%' OR ua.achievement_type ILIKE '%time%' THEN 'performance'
        WHEN ua.achievement_type ILIKE '%explorer%' OR ua.achievement_type ILIKE '%variety%' THEN 'exploration'
        WHEN ua.achievement_type ILIKE '%social%' OR ua.achievement_type ILIKE '%friend%' THEN 'social'
        WHEN ua.achievement_type ILIKE '%milestone%' OR ua.achievement_type ILIKE '%champion%' THEN 'milestone'
        WHEN ua.achievement_type ILIKE '%planking%' OR ua.achievement_type ILIKE '%leg_lift%' 
             OR ua.achievement_type ILIKE '%seated%' OR ua.achievement_type ILIKE '%standing%' 
             OR ua.achievement_type ILIKE '%cardio%' OR ua.achievement_type ILIKE '%strength%' THEN 'category_specific'
        ELSE 'cross_category'
      END as category
    FROM user_achievements ua
    WHERE ua.earned_at >= CURRENT_DATE - (days_back || ' days')::INTERVAL
  ),
  daily_stats AS (
    SELECT 
      ds.date,
      COALESCE(COUNT(du.achievement_name), 0) as total_unlocks,
      COALESCE(COUNT(DISTINCT du.user_id), 0) as unique_users,
      mode() WITHIN GROUP (ORDER BY du.achievement_name) as most_unlocked_achievement,
      COALESCE(
        jsonb_object_agg(
          du.category, 
          COUNT(du.achievement_name)
        ) FILTER (WHERE du.category IS NOT NULL),
        '{}'::jsonb
      ) as category_breakdown
    FROM date_series ds
    LEFT JOIN daily_unlocks du ON ds.date = du.unlock_date
    GROUP BY ds.date
  )
  SELECT 
    ds.date,
    ds.total_unlocks,
    ds.unique_users,
    ds.most_unlocked_achievement,
    ds.category_breakdown
  FROM daily_stats ds
  ORDER BY ds.date;
END;
$function$;

-- Get achievement system health metrics
CREATE OR REPLACE FUNCTION public.get_achievement_system_health()
RETURNS TABLE(
  metric_name text,
  metric_value numeric,
  metric_status text,
  last_calculated timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only admins can access achievement analytics
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;

  RETURN QUERY
  WITH health_metrics AS (
    SELECT 
      'total_achievements_unlocked' as metric_name,
      COUNT(*)::numeric as metric_value,
      CASE WHEN COUNT(*) > 0 THEN 'healthy' ELSE 'warning' END as metric_status,
      now() as last_calculated
    FROM user_achievements
    
    UNION ALL
    
    SELECT 
      'unique_users_with_achievements',
      COUNT(DISTINCT user_id)::numeric,
      CASE WHEN COUNT(DISTINCT user_id) > 0 THEN 'healthy' ELSE 'critical' END,
      now()
    FROM user_achievements
    
    UNION ALL
    
    SELECT 
      'avg_achievements_per_user',
      ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT user_id), 0), 2),
      CASE 
        WHEN ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT user_id), 0), 2) >= 3 THEN 'healthy'
        WHEN ROUND(COUNT(*)::numeric / NULLIF(COUNT(DISTINCT user_id), 0), 2) >= 1 THEN 'warning'
        ELSE 'critical'
      END,
      now()
    FROM user_achievements
    
    UNION ALL
    
    SELECT 
      'achievements_unlocked_today',
      COUNT(*) FILTER (WHERE earned_at::date = CURRENT_DATE)::numeric,
      CASE 
        WHEN COUNT(*) FILTER (WHERE earned_at::date = CURRENT_DATE) > 10 THEN 'healthy'
        WHEN COUNT(*) FILTER (WHERE earned_at::date = CURRENT_DATE) > 0 THEN 'warning'
        ELSE 'critical'
      END,
      now()
    FROM user_achievements
    
    UNION ALL
    
    SELECT 
      'achievement_unlock_rate_7d',
      ROUND(COUNT(*) FILTER (WHERE earned_at >= CURRENT_DATE - INTERVAL '7 days')::numeric / 7, 2),
      CASE 
        WHEN ROUND(COUNT(*) FILTER (WHERE earned_at >= CURRENT_DATE - INTERVAL '7 days')::numeric / 7, 2) >= 5 THEN 'healthy'
        WHEN ROUND(COUNT(*) FILTER (WHERE earned_at >= CURRENT_DATE - INTERVAL '7 days')::numeric / 7, 2) > 0 THEN 'warning'
        ELSE 'critical'
      END,
      now()
    FROM user_achievements
  )
  SELECT * FROM health_metrics;
END;
$function$;