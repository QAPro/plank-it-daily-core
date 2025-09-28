-- Fix the trigger function to have proper search_path
CREATE OR REPLACE FUNCTION public.update_rollout_schedules_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;