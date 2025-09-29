-- Fix the get_pending_rollout_executions function
-- The error was caused by trying to cast jsonb to jsonb[] which is incorrect
DROP FUNCTION IF EXISTS public.get_pending_rollout_executions();

CREATE OR REPLACE FUNCTION public.get_pending_rollout_executions()
RETURNS TABLE(schedule_id uuid, feature_name text, target_percentage integer, step_index integer)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH parsed_schedules AS (
    SELECT 
      rs.id as schedule_id,
      rs.feature_name,
      rs.current_step,
      step_data.value as step_data,
      step_data.ordinality - 1 as step_index
    FROM rollout_schedules rs
    CROSS JOIN LATERAL jsonb_array_elements(rs.schedule_data) WITH ORDINALITY AS step_data(value, ordinality)
    WHERE rs.status = 'active'
      AND rs.current_step < jsonb_array_length(rs.schedule_data)
  )
  SELECT 
    ps.schedule_id,
    ps.feature_name,
    (ps.step_data->>'percentage')::INTEGER as target_percentage,
    ps.step_index::INTEGER
  FROM parsed_schedules ps
  WHERE ps.step_index = ps.current_step
    AND (ps.step_data->>'execute_at')::TIMESTAMP WITH TIME ZONE <= now()
    AND (ps.step_data->>'executed')::BOOLEAN = false;
END;
$function$;