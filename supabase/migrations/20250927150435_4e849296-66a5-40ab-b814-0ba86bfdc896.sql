-- Sync missing granular features from catalog to database
-- Add missing features with proper parent-child relationships

-- Insert parent features first
INSERT INTO feature_flags (feature_name, is_enabled, description, target_audience, rollout_percentage, parent_feature_id, created_at, updated_at)
VALUES 
  ('music_features', true, 'Music and audio functionality', 'all', 100, null, now(), now()),
  ('ai_features', true, 'AI-powered features and insights', 'all', 100, null, now(), now()),
  ('social_features', true, 'Social interaction features', 'all', 100, null, now(), now()),
  ('analytics_features', true, 'Analytics and tracking features', 'all', 100, null, now(), now()),
  ('premium_features', true, 'Premium subscription features', 'premium', 100, null, now(), now()),
  ('ui_features', true, 'User interface enhancements', 'all', 100, null, now(), now()),
  ('competition_features', true, 'Competition and league features', 'all', 100, null, now(), now())
ON CONFLICT (feature_name) DO UPDATE SET
  description = EXCLUDED.description,
  updated_at = now();

-- Get parent feature IDs for child features
WITH parent_ids AS (
  SELECT feature_name, id FROM feature_flags 
  WHERE feature_name IN ('music_features', 'ai_features', 'social_features', 'analytics_features', 'premium_features', 'ui_features', 'competition_features')
)
-- Insert child features with proper parent relationships
INSERT INTO feature_flags (feature_name, is_enabled, description, target_audience, rollout_percentage, parent_feature_id, created_at, updated_at)
SELECT 
  child_feature,
  true,
  child_description,
  'all',
  100,
  p.id,
  now(),
  now()
FROM (VALUES
  -- Music Features Children
  ('background_music_player', 'Background music during workouts', 'music_features'),
  ('victory_playlists', 'Victory celebration playlists', 'music_features'),
  ('workout_music', 'Music controls during exercises', 'music_features'),
  ('victory_sounds', 'Sound effects for completions', 'music_features'),
  ('audio_controls', 'Volume and audio settings', 'music_features'),
  
  -- AI Features Children
  ('coaching_overlay', 'AI coaching guidance overlay', 'ai_features'),
  ('smart_recommendations', 'ML-powered workout recommendations', 'ai_features'),
  ('ai_insights', 'AI-generated performance insights', 'ai_features'),
  ('form_analysis', 'AI form checking and feedback', 'ai_features'),
  ('personal_trainer_ai', 'Advanced AI personal trainer', 'ai_features'),
  ('ai_goal_suggestions', 'AI-generated goal recommendations', 'ai_features'),
  
  -- Social Features Children
  ('friend_system', 'Friend requests and management', 'social_features'),
  ('activity_feed', 'Social activity timeline', 'social_features'),
  ('workout_sharing', 'Share workout completions', 'social_features'),
  ('social_challenges', 'Community challenges', 'social_features'),
  ('leaderboards', 'Competition rankings', 'social_features'),
  ('friend_reactions', 'Like/react to friend activities', 'social_features'),
  ('activity_comments', 'Comment on friend activities', 'social_features'),
  
  -- Analytics Features Children
  ('basic_stats', 'Simple progress tracking', 'analytics_features'),
  ('advanced_analytics', 'Detailed analytics dashboard', 'analytics_features'),
  ('performance_insights', 'Performance metrics and insights', 'analytics_features'),
  ('progress_charts', 'Visual progress displays', 'analytics_features'),
  ('goal_tracking', 'Goal setting and tracking', 'analytics_features'),
  ('streak_tracking', 'Workout streak tracking', 'analytics_features'),
  
  -- Premium Features Children
  ('custom_workouts', 'Custom workout creation', 'premium_features'),
  ('offline_mode', 'Download workouts for offline use', 'premium_features'),
  ('premium_exercises', 'Advanced exercise library', 'premium_features'),
  ('export_data', 'Data export functionality', 'premium_features'),
  ('priority_support', 'Enhanced customer support', 'premium_features'),
  
  -- UI Features Children
  ('dark_mode', 'Dark theme support', 'ui_features'),
  ('custom_themes', 'Custom color themes', 'ui_features'),
  ('animations', 'UI animations and transitions', 'ui_features'),
  ('sound_effects', 'UI feedback sounds', 'ui_features'),
  ('tutorial_tooltips', 'Interactive help tooltips', 'ui_features'),
  
  -- Competition Features Children
  ('fitness_leagues', 'League participation system', 'competition_features'),
  ('tournaments', 'Tournament competitions', 'competition_features'),
  ('competitive_challenges', 'Head-to-head challenges', 'competition_features'),
  ('ranking_system', 'Skill-based ranking system', 'competition_features'),
  ('competition_graphics', 'Special competition sharing graphics', 'competition_features')
) AS child_data(child_feature, child_description, parent_name)
JOIN parent_ids p ON p.feature_name = child_data.parent_name
ON CONFLICT (feature_name) DO UPDATE SET
  description = EXCLUDED.description,
  parent_feature_id = EXCLUDED.parent_feature_id,
  updated_at = now();