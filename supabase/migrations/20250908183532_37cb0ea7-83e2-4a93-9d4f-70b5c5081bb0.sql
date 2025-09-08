-- Add user-level write policies while keeping analytics read admin-only

-- Hook cycle events: allow users to insert/update their own events
CREATE POLICY IF NOT EXISTS "Users can insert own hook cycles"
ON hook_cycle_events
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own hook cycles"
ON hook_cycle_events
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Friction point logs: allow users to insert their own logs
CREATE POLICY IF NOT EXISTS "Users can insert friction logs"
ON friction_point_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Trigger effectiveness logs: allow users to insert/update their own logs
CREATE POLICY IF NOT EXISTS "Users can insert trigger logs"
ON trigger_effectiveness_logs
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own trigger logs"
ON trigger_effectiveness_logs
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
