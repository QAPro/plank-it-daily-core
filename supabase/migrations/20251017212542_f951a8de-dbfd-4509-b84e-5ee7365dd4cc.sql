-- Step 1: Delete all existing user_sessions (test data only)
DELETE FROM user_sessions;

-- Step 2: Alter the column to NOT NULL (prevent future NULL values)
ALTER TABLE user_sessions 
ALTER COLUMN exercise_id SET NOT NULL;

-- Step 3: Add index for performance (if not exists)
CREATE INDEX IF NOT EXISTS idx_user_sessions_exercise_id 
ON user_sessions(exercise_id);