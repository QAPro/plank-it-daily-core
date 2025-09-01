-- Add performance indexes for achievement calculations
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_exercise 
ON user_sessions(user_id, exercise_id);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_duration 
ON user_sessions(user_id, duration_seconds);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user_completed 
ON user_sessions(user_id, completed_at);

CREATE INDEX IF NOT EXISTS idx_user_achievement_progress_user_updated 
ON user_achievement_progress(user_id, last_updated);

CREATE INDEX IF NOT EXISTS idx_user_achievements_user_type 
ON user_achievements(user_id, achievement_type);

-- Add function to check if achievement progress needs refresh
CREATE OR REPLACE FUNCTION should_refresh_achievement_progress(
  p_user_id UUID,
  p_achievement_id TEXT,
  p_last_session_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  last_progress_update TIMESTAMP WITH TIME ZONE;
  latest_session TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Get last progress update
  SELECT last_updated INTO last_progress_update
  FROM user_achievement_progress
  WHERE user_id = p_user_id AND achievement_id = p_achievement_id;
  
  -- If no progress record exists, needs refresh
  IF last_progress_update IS NULL THEN
    RETURN TRUE;
  END IF;
  
  -- Get latest session if not provided
  IF p_last_session_at IS NULL THEN
    SELECT MAX(completed_at) INTO latest_session
    FROM user_sessions
    WHERE user_id = p_user_id;
  ELSE
    latest_session := p_last_session_at;
  END IF;
  
  -- Needs refresh if there's a session after last update
  RETURN latest_session > last_progress_update;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;