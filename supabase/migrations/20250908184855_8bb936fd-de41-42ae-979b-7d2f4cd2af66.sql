-- Add indexes for performance on hook analytics tables
CREATE INDEX IF NOT EXISTS idx_hook_cycle_events_user_created 
ON hook_cycle_events (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_hook_cycle_events_trigger_type 
ON hook_cycle_events (trigger_type);

CREATE INDEX IF NOT EXISTS idx_friction_point_logs_user_created 
ON friction_point_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_friction_point_logs_friction_type 
ON friction_point_logs (friction_type);

CREATE INDEX IF NOT EXISTS idx_trigger_effectiveness_logs_user_created 
ON trigger_effectiveness_logs (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_trigger_effectiveness_logs_trigger_type 
ON trigger_effectiveness_logs (trigger_type);