-- Fix security linter warnings by ensuring all functions have proper search_path

-- Update notify_via_edge_function to have proper search_path
DROP FUNCTION IF EXISTS public.notify_via_edge_function(jsonb);
CREATE OR REPLACE FUNCTION public.notify_via_edge_function(p_payload jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_url text := 'https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events';
BEGIN
  -- Use pg_net to POST to the Edge Function. If pg_net is not installed, just NOTICE.
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_net') THEN
    PERFORM net.http_post(
      url := v_url,
      headers := '{"Content-Type":"application/json"}'::jsonb,
      body := p_payload
    );
  ELSE
    RAISE NOTICE 'pg_net extension not installed; skipping HTTP POST for payload: %', p_payload::text;
  END IF;
END;
$$;

-- Update all trigger functions to have proper search_path
CREATE OR REPLACE FUNCTION public.trg_notify_achievement_unlocked()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM public.notify_via_edge_function(jsonb_build_object(
    'type', 'achievement_unlocked',
    'user_id', NEW.user_id,
    'achievement', jsonb_build_object(
      'name', NEW.achievement_name,
      'description', COALESCE(NEW.description, ''),
      'rarity', COALESCE(NEW.rarity, 'common'),
      'points', COALESCE(NEW.points, 0)
    )
  ));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_notify_streak_milestone()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  is_milestone boolean := false;
BEGIN
  IF NEW.current_streak IS DISTINCT FROM OLD.current_streak THEN
    -- Define milestones (adjust as needed)
    IF NEW.current_streak IN (3, 7, 14, 21, 30, 50, 100, 200, 365) THEN
      is_milestone := true;
    END IF;
  END IF;

  IF is_milestone THEN
    PERFORM public.notify_via_edge_function(jsonb_build_object(
      'type', 'streak_milestone',
      'user_id', NEW.user_id,
      'streak_days', NEW.current_streak
    ));
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.trg_notify_session_completed()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  PERFORM public.notify_via_edge_function(jsonb_build_object(
    'type', 'session_completed',
    'user_id', NEW.user_id,
    'session', jsonb_build_object(
      'duration_seconds', COALESCE(NEW.duration_seconds, 0),
      'exercise_id', NEW.exercise_id,
      'completed_at', COALESCE(NEW.completed_at, now())
    )
  ));
  RETURN NEW;
END;
$$;