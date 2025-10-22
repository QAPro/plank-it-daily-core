-- Remove music-related columns from user_preferences table
ALTER TABLE user_preferences DROP COLUMN IF EXISTS background_music;
ALTER TABLE user_preferences DROP COLUMN IF EXISTS music_volume;

-- Delete music-related feature flags
DELETE FROM feature_flags WHERE feature_name IN ('background_music_player', 'victory_playlists', 'music_features', 'background_music', 'playlist_sharing', 'audio_coaching');