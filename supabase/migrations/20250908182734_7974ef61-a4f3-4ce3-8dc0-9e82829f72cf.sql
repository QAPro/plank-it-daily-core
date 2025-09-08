-- Update RLS policies for hook model tables to be admin-only

-- Hook cycle events - only admins can access
ALTER TABLE hook_cycle_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage hook cycle events"
ON hook_cycle_events
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- User success correlations - only admins can access
ALTER TABLE user_success_correlations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage success correlations"
ON user_success_correlations
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Friction point logs - only admins can access
ALTER TABLE friction_point_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage friction point logs"
ON friction_point_logs
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Trigger effectiveness logs - only admins can access
ALTER TABLE trigger_effectiveness_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage trigger effectiveness logs"
ON trigger_effectiveness_logs
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Optimization experiments - only admins can access
ALTER TABLE optimization_experiments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage optimization experiments"
ON optimization_experiments
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));