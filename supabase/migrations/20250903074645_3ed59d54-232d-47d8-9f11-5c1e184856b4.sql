-- Fix security linter warnings

-- 1. Fix function search path issues by updating functions to set search_path
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    -- Update duration-based goals
    UPDATE user_goals 
    SET current_value = (
        SELECT COALESCE(MAX(duration_seconds), 0)
        FROM user_sessions 
        WHERE user_id = NEW.user_id 
        AND goal_type = 'duration'
    ),
    updated_at = now()
    WHERE user_id = NEW.user_id 
    AND goal_type = 'duration' 
    AND is_active = true;
    
    -- Update consistency-based goals (sessions this month)
    UPDATE user_goals 
    SET current_value = (
        SELECT COUNT(*)
        FROM user_sessions 
        WHERE user_id = NEW.user_id 
        AND completed_at >= date_trunc('month', now())
    ),
    updated_at = now()
    WHERE user_id = NEW.user_id 
    AND goal_type = 'consistency' 
    AND is_active = true;
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_push_subscription_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_weekly_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    week_start_date DATE;
BEGIN
    -- Calculate the start of the week (Monday)
    week_start_date := date_trunc('week', NEW.completed_at::date);
    
    -- Insert or update weekly stats
    INSERT INTO user_weekly_stats (user_id, week_start, sessions_count, total_duration, days_active)
    VALUES (
        NEW.user_id, 
        week_start_date, 
        1, 
        NEW.duration_seconds,
        1
    )
    ON CONFLICT (user_id, week_start)
    DO UPDATE SET
        sessions_count = user_weekly_stats.sessions_count + 1,
        total_duration = user_weekly_stats.total_duration + NEW.duration_seconds,
        days_active = CASE 
            WHEN NEW.completed_at::date != (
                SELECT MAX(completed_at::date) 
                FROM user_sessions 
                WHERE user_id = NEW.user_id 
                AND date_trunc('week', completed_at::date) = week_start_date
                AND completed_at < NEW.completed_at
            ) THEN user_weekly_stats.days_active + 1
            ELSE user_weekly_stats.days_active
        END,
        average_duration = (user_weekly_stats.total_duration + NEW.duration_seconds) / (user_weekly_stats.sessions_count + 1),
        updated_at = now();
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_user_monthly_stats()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    month_start_date DATE;
    exercises_tried_count INTEGER;
BEGIN
    -- Calculate the start of the month
    month_start_date := date_trunc('month', NEW.completed_at::date);
    
    -- Count unique exercises tried this month
    SELECT COUNT(DISTINCT exercise_id) INTO exercises_tried_count
    FROM user_sessions
    WHERE user_id = NEW.user_id
    AND date_trunc('month', completed_at::date) = month_start_date;
    
    -- Insert or update monthly stats
    INSERT INTO user_monthly_stats (user_id, month_start, sessions_count, total_duration, exercises_tried)
    VALUES (
        NEW.user_id, 
        month_start_date, 
        1, 
        NEW.duration_seconds,
        exercises_tried_count
    )
    ON CONFLICT (user_id, month_start)
    DO UPDATE SET
        sessions_count = user_monthly_stats.sessions_count + 1,
        total_duration = user_monthly_stats.total_duration + NEW.duration_seconds,
        exercises_tried = exercises_tried_count,
        updated_at = now();
    
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.set_user_sessions_completed_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NEW.completed_at IS NULL THEN
    NEW.completed_at := now();
  END IF;
  RETURN NEW;
END;
$function$;

-- 2. Enable RLS on materialized views and add policies
ALTER MATERIALIZED VIEW subscription_analytics ENABLE ROW LEVEL SECURITY;
ALTER MATERIALIZED VIEW user_engagement_metrics ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for materialized views
CREATE POLICY "Only admins can view subscription analytics" 
ON subscription_analytics 
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "Only admins can view user engagement metrics" 
ON user_engagement_metrics 
FOR SELECT 
USING (is_admin(auth.uid()));

-- 3. Configure Auth OTP settings to reduce expiry time
-- Note: This needs to be done via Supabase dashboard Auth settings
-- Recommended: Set OTP expiry to 300 seconds (5 minutes) instead of default 3600 seconds (1 hour)