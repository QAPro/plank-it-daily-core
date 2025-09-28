-- Create rollout history tracking table
CREATE TABLE IF NOT EXISTS public.rollout_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name text NOT NULL,
  old_percentage integer NOT NULL,
  new_percentage integer NOT NULL,
  changed_by uuid REFERENCES auth.users(id),
  change_reason text,
  user_impact_estimate integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rollout_history ENABLE ROW LEVEL SECURITY;

-- Create policies for rollout history
CREATE POLICY "Admins can manage rollout history" 
ON public.rollout_history 
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));

-- Add index for efficient querying
CREATE INDEX IF NOT EXISTS idx_rollout_history_feature_created 
ON public.rollout_history (feature_name, created_at DESC);

-- Function to get real user count for rollout calculations
CREATE OR REPLACE FUNCTION public.get_feature_user_metrics(_feature_name text)
RETURNS TABLE(
  total_users bigint,
  active_users_24h bigint,
  active_users_7d bigint,
  current_rollout_users bigint,
  error_rate numeric
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  rollout_pct integer := 100;
BEGIN
  -- Get current rollout percentage
  SELECT COALESCE(rollout_percentage, 100) INTO rollout_pct
  FROM feature_flags 
  WHERE feature_name = _feature_name;
  
  RETURN QUERY
  WITH user_counts AS (
    SELECT 
      COUNT(DISTINCT u.id) as total_users,
      COUNT(DISTINCT CASE WHEN fue.created_at >= NOW() - INTERVAL '1 day' THEN fue.user_id END) as active_24h,
      COUNT(DISTINCT CASE WHEN fue.created_at >= NOW() - INTERVAL '7 days' THEN fue.user_id END) as active_7d
    FROM users u
    LEFT JOIN feature_usage_events fue ON u.id::text = fue.user_id 
      AND fue.feature_name = _feature_name
  ),
  error_stats AS (
    SELECT 
      COALESCE(
        COUNT(CASE WHEN fue.metadata->>'error' IS NOT NULL THEN 1 END)::numeric / 
        NULLIF(COUNT(*), 0) * 100, 
        0
      ) as error_rate
    FROM feature_usage_events fue
    WHERE fue.feature_name = _feature_name
      AND fue.created_at >= NOW() - INTERVAL '7 days'
  )
  SELECT 
    uc.total_users,
    uc.active_24h,
    uc.active_7d,
    CEIL(uc.total_users::numeric * rollout_pct / 100)::bigint as current_rollout_users,
    es.error_rate
  FROM user_counts uc, error_stats es;
END;
$$;

-- Function to track rollout changes
CREATE OR REPLACE FUNCTION public.track_rollout_change()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only track if rollout percentage changed
  IF OLD.rollout_percentage IS DISTINCT FROM NEW.rollout_percentage THEN
    INSERT INTO public.rollout_history (
      feature_name,
      old_percentage,
      new_percentage,
      changed_by,
      change_reason,
      user_impact_estimate
    ) 
    SELECT 
      NEW.feature_name,
      COALESCE(OLD.rollout_percentage, 0),
      COALESCE(NEW.rollout_percentage, 0),
      auth.uid(),
      'Rollout percentage updated',
      -- Estimate user impact based on total users
      CEIL(
        (SELECT COUNT(*) FROM users) * 
        ABS(COALESCE(NEW.rollout_percentage, 0) - COALESCE(OLD.rollout_percentage, 0)) / 100.0
      )::integer;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for rollout tracking
DROP TRIGGER IF EXISTS trigger_track_rollout_change ON public.feature_flags;
CREATE TRIGGER trigger_track_rollout_change
  AFTER UPDATE ON public.feature_flags
  FOR EACH ROW
  EXECUTE FUNCTION public.track_rollout_change();