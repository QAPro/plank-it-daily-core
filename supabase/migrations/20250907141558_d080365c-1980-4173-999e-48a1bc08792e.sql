-- Fix function search path security warning for existing functions that don't have search_path set
ALTER FUNCTION public.trg_notify_achievement_unlocked() SET search_path = public;
ALTER FUNCTION public.trg_notify_streak_milestone() SET search_path = public;
ALTER FUNCTION public.trg_notify_session_completed() SET search_path = public;
ALTER FUNCTION public.set_user_sessions_completed_at() SET search_path = public;