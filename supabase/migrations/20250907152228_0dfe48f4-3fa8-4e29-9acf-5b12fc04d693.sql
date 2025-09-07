-- Add quick start fields to user_preferences table
ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS last_exercise_id UUID,
ADD COLUMN IF NOT EXISTS last_duration INTEGER,
ADD COLUMN IF NOT EXISTS last_workout_timestamp TIMESTAMPTZ;

-- Create index for better performance on quick start queries
CREATE INDEX IF NOT EXISTS idx_user_preferences_last_workout_timestamp 
ON user_preferences(user_id, last_workout_timestamp) 
WHERE last_workout_timestamp IS NOT NULL;