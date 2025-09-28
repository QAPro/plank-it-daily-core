-- Create table for scheduled rollouts
CREATE TABLE public.rollout_schedules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  created_by UUID NOT NULL,
  schedule_name TEXT NOT NULL,
  schedule_data JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array of {percentage: number, execute_at: timestamp, executed: boolean}
  current_step INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active', -- active, paused, completed, cancelled
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('active', 'paused', 'completed', 'cancelled')),
  CONSTRAINT valid_current_step CHECK (current_step >= 0)
);

-- Enable RLS
ALTER TABLE public.rollout_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage rollout schedules" 
ON public.rollout_schedules 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles ur 
  WHERE ur.user_id = auth.uid() 
  AND ur.role = 'admin'::app_role
));

-- Create index for efficient queries
CREATE INDEX idx_rollout_schedules_feature_name ON public.rollout_schedules(feature_name);
CREATE INDEX idx_rollout_schedules_status ON public.rollout_schedules(status);
CREATE INDEX idx_rollout_schedules_execution ON public.rollout_schedules USING GIN((schedule_data));

-- Function to get pending rollout executions
CREATE OR REPLACE FUNCTION public.get_pending_rollout_executions()
RETURNS TABLE(
  schedule_id UUID,
  feature_name TEXT,
  target_percentage INTEGER,
  step_index INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  RETURN QUERY
  WITH parsed_schedules AS (
    SELECT 
      rs.id as schedule_id,
      rs.feature_name,
      rs.current_step,
      jsonb_array_elements(rs.schedule_data) as step_data,
      generate_subscripts(rs.schedule_data::jsonb[], 1) - 1 as step_index
    FROM rollout_schedules rs
    WHERE rs.status = 'active'
      AND rs.current_step < jsonb_array_length(rs.schedule_data)
  )
  SELECT 
    ps.schedule_id,
    ps.feature_name,
    (ps.step_data->>'percentage')::INTEGER as target_percentage,
    ps.step_index
  FROM parsed_schedules ps
  WHERE ps.step_index = ps.current_step
    AND (ps.step_data->>'execute_at')::TIMESTAMP WITH TIME ZONE <= now()
    AND (ps.step_data->>'executed')::BOOLEAN = false;
END;
$function$;

-- Function to mark rollout step as executed
CREATE OR REPLACE FUNCTION public.execute_rollout_step(
  _schedule_id UUID,
  _step_index INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  _schedule_data JSONB;
  _updated_data JSONB;
  _total_steps INTEGER;
BEGIN
  -- Get current schedule data
  SELECT schedule_data INTO _schedule_data
  FROM rollout_schedules
  WHERE id = _schedule_id;
  
  IF _schedule_data IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Mark step as executed
  _updated_data := jsonb_set(
    _schedule_data,
    array[_step_index::TEXT, 'executed'],
    'true'::jsonb
  );
  
  -- Get total steps
  _total_steps := jsonb_array_length(_schedule_data);
  
  -- Update the schedule
  UPDATE rollout_schedules
  SET 
    schedule_data = _updated_data,
    current_step = _step_index + 1,
    status = CASE 
      WHEN _step_index + 1 >= _total_steps THEN 'completed'
      ELSE status
    END,
    completed_at = CASE 
      WHEN _step_index + 1 >= _total_steps THEN now()
      ELSE completed_at
    END,
    updated_at = now()
  WHERE id = _schedule_id;
  
  RETURN TRUE;
END;
$function$;

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.update_rollout_schedules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rollout_schedules_updated_at
  BEFORE UPDATE ON public.rollout_schedules
  FOR EACH ROW
  EXECUTE FUNCTION public.update_rollout_schedules_updated_at();