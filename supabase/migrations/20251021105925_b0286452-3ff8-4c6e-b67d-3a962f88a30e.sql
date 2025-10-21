-- Reset Migrate1 user to clean testing state
-- User ID: a4d6155d-dce5-4195-a58f-f7c539f6ba80

-- Clear sessions
DELETE FROM user_sessions 
WHERE user_id = 'a4d6155d-dce5-4195-a58f-f7c539f6ba80';

-- Clear XP transactions
DELETE FROM xp_transactions 
WHERE user_id = 'a4d6155d-dce5-4195-a58f-f7c539f6ba80';

-- Clear momentum scores
DELETE FROM user_momentum_scores 
WHERE user_id = 'a4d6155d-dce5-4195-a58f-f7c539f6ba80';

-- Reset streak data
UPDATE user_streaks 
SET current_streak = 0,
    longest_streak = 0,
    last_workout_date = NULL,
    updated_at = NOW()
WHERE user_id = 'a4d6155d-dce5-4195-a58f-f7c539f6ba80';

-- Reset user XP and level
UPDATE users 
SET total_xp = 0,
    current_level = 1,
    updated_at = NOW()
WHERE id = 'a4d6155d-dce5-4195-a58f-f7c539f6ba80';