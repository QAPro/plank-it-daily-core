-- Clean up incorrectly stored hidden achievement records
-- These were using achievement.category instead of achievement.id
DELETE FROM user_achievements 
WHERE user_id = 'a4d6155d-dce5-4195-a58f-f7c539f6ba80'
AND achievement_type IN ('behavior', 'timing');