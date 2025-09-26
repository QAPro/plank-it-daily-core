-- Enable competitive leagues and tournaments to make Compete tab visible
UPDATE feature_flags 
SET is_enabled = true, updated_at = now() 
WHERE feature_name IN ('competitive_leagues', 'tournaments');