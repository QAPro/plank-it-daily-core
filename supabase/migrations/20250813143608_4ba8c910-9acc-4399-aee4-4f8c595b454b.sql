
-- Fix security warnings by adding explicit search_path settings to all functions
-- This prevents potential SQL injection via search_path manipulation

-- 1. Fix update_user_weekly_stats function
CREATE OR REPLACE FUNCTION public.update_user_weekly_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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

-- 2. Fix update_user_monthly_stats function
CREATE OR REPLACE FUNCTION public.update_user_monthly_stats()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
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

-- 3. Fix find_user_by_username_or_email function
CREATE OR REPLACE FUNCTION public.find_user_by_username_or_email(identifier text)
 RETURNS TABLE(user_id uuid, email text, username text, full_name text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.username, u.full_name
  FROM public.users u
  WHERE u.username = identifier OR u.email = identifier;
END;
$function$;

-- 4. Fix handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.users (id, email, full_name, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'username'
  );
  
  -- Initialize user streak record
  INSERT INTO public.user_streaks (user_id)
  VALUES (new.id);
  
  -- Initialize user onboarding record
  INSERT INTO public.user_onboarding (user_id)
  VALUES (new.id);
  
  -- Initialize user preferences record
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$function$;

-- 5. Create triggers for the weekly and monthly stats functions
-- First drop existing triggers if they exist
DROP TRIGGER IF EXISTS trigger_update_user_weekly_stats ON user_sessions;
DROP TRIGGER IF EXISTS trigger_update_user_monthly_stats ON user_sessions;

-- Create the triggers
CREATE TRIGGER trigger_update_user_weekly_stats
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_weekly_stats();

CREATE TRIGGER trigger_update_user_monthly_stats
  AFTER INSERT ON user_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_user_monthly_stats();

-- 6. Ensure the handle_new_user trigger exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
