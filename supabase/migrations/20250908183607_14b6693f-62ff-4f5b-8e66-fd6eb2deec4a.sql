-- Add user-level write policies while keeping analytics read admin-only
-- Note: PostgreSQL doesn't support IF NOT EXISTS for policies, so we'll use CREATE OR REPLACE

-- Hook cycle events: allow users to insert/update their own events
DROP POLICY IF EXISTS "Users can insert own hook cycles" ON hook_cycle_events;
CREATE POLICY "Users can insert own hook cycles"
ON hook_cycle_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own hook cycles" ON hook_cycle_events;
CREATE POLICY "Users can update own hook cycles"
ON hook_cycle_events
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Friction point logs: allow users to insert their own logs
DROP POLICY IF EXISTS "Users can insert friction logs" ON friction_point_logs;
CREATE POLICY "Users can insert friction logs"
ON friction_point_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trigger effectiveness logs: allow users to insert/update their own logs
DROP POLICY IF EXISTS "Users can insert trigger logs" ON trigger_effectiveness_logs;
CREATE POLICY "Users can insert trigger logs"
ON trigger_effectiveness_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own trigger logs" ON trigger_effectiveness_logs;
CREATE POLICY "Users can update own trigger logs"
ON trigger_effectiveness_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);