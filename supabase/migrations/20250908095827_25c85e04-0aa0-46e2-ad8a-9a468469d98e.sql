-- Drop mentor system tables and functions
DROP TRIGGER IF EXISTS update_mentor_stats_trigger ON mentor_relationships;
DROP FUNCTION IF EXISTS update_mentor_stats();
DROP TABLE IF EXISTS mentor_achievements;
DROP TABLE IF EXISTS mentor_relationships;
DROP TABLE IF EXISTS mentor_profiles;