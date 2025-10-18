
-- Backfill momentum points for existing sessions
-- This updates all sessions with 0 or NULL momentum to have calculated values
UPDATE user_sessions us
SET momentum_points_earned = (
  10 + -- base momentum
  (COALESCE((SELECT difficulty_level FROM exercises WHERE id = us.exercise_id), 1) * 2) + -- difficulty bonus (2-10 points)
  FLOOR(us.duration_seconds / 60) -- duration bonus (1 point per minute)
)
WHERE (momentum_points_earned = 0 OR momentum_points_earned IS NULL)
AND user_id IN (SELECT id FROM users WHERE username = 'Migrate1');
