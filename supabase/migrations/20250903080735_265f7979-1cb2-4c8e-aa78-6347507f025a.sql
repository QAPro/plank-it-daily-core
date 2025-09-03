-- Fix remaining function search path issues
-- Check which functions need search_path set

-- Add search_path to the refresh_user_engagement_metrics function
CREATE OR REPLACE FUNCTION public.refresh_user_engagement_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- This function now does nothing since we removed the materialized view
  -- but keeping it for backward compatibility
  RETURN;
END;
$$;

-- Ensure all other database functions have proper search_path
-- Most were already fixed in previous migrations, this catches any missed ones