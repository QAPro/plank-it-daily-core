-- Add parent_feature_id column to support hierarchical feature flags (if not already exists)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='feature_flags' AND column_name='parent_feature_id') THEN
        ALTER TABLE public.feature_flags 
        ADD COLUMN parent_feature_id UUID REFERENCES public.feature_flags(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_feature_flags_parent ON public.feature_flags(parent_feature_id);
CREATE INDEX IF NOT EXISTS idx_feature_flags_enabled_parent ON public.feature_flags(is_enabled, parent_feature_id);

-- Insert or update comprehensive granular feature flags with parent-child relationships

-- Core feature categories (parents) - using UPSERT
INSERT INTO public.feature_flags (feature_name, description, is_enabled, target_audience, rollout_percentage) VALUES
('music_features', 'All music and audio-related features', true, 'all', 100),
('ai_features', 'All AI-powered features and coaching', true, 'premium', 100),
('analytics_features', 'All analytics and tracking features', true, 'premium', 100),
('premium_features', 'All premium-tier features', true, 'premium', 100),
('ui_features', 'All user interface enhancements', true, 'all', 100),
('competition_features', 'All competitive and challenge features', true, 'all', 100)
ON CONFLICT (feature_name) DO UPDATE SET
    description = EXCLUDED.description,
    target_audience = EXCLUDED.target_audience,
    rollout_percentage = EXCLUDED.rollout_percentage;

-- Update existing social_features to be a parent category
UPDATE public.feature_flags 
SET description = 'All social and community features', 
    target_audience = 'all', 
    rollout_percentage = 100,
    parent_feature_id = NULL
WHERE feature_name = 'social_features';

-- Music & Audio Features (children of music_features)
INSERT INTO public.feature_flags (feature_name, description, is_enabled, target_audience, rollout_percentage, parent_feature_id) VALUES
('background_music', 'Background music player during workouts', true, 'all', 100, 
 (SELECT id FROM public.feature_flags WHERE feature_name = 'music_features')),
('victory_playlists', 'Special playlists for workout completion', true, 'premium', 90,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'music_features')),
('playlist_sharing', 'Share workout playlists with friends', true, 'all', 85,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'music_features')),
('audio_coaching', 'Voice coaching and audio cues', true, 'premium', 80,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'music_features'))
ON CONFLICT (feature_name) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    description = EXCLUDED.description;

-- AI Features (children of ai_features)
INSERT INTO public.feature_flags (feature_name, description, is_enabled, target_audience, rollout_percentage, parent_feature_id) VALUES
('coaching_overlay', 'AI coaching messages during workouts', true, 'premium', 90,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'ai_features')),
('form_analysis', 'AI form correction and analysis', true, 'premium', 70,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'ai_features')),
('ai_insights', 'AI-generated performance insights', true, 'premium', 80,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'ai_features'))
ON CONFLICT (feature_name) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    description = EXCLUDED.description;

-- Update existing smart_recommendations to be child of ai_features
UPDATE public.feature_flags 
SET parent_feature_id = (SELECT id FROM public.feature_flags WHERE feature_name = 'ai_features')
WHERE feature_name = 'smart_recommendations';

-- Social Features (children of social_features)
INSERT INTO public.feature_flags (feature_name, description, is_enabled, target_audience, rollout_percentage, parent_feature_id) VALUES
('workout_posting', 'Post workout completions to feed', true, 'all', 90,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'social_features')),
('friend_reactions', 'React to friends activities', true, 'all', 85,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'social_features')),
('activity_comments', 'Comment on friends activities', true, 'all', 80,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'social_features'))
ON CONFLICT (feature_name) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    description = EXCLUDED.description;

-- Update existing social features to be children
UPDATE public.feature_flags 
SET parent_feature_id = (SELECT id FROM public.feature_flags WHERE feature_name = 'social_features')
WHERE feature_name IN ('friend_system', 'activity_feed', 'social_challenges');

-- Competition Features (children of competition_features)
INSERT INTO public.feature_flags (feature_name, description, is_enabled, target_audience, rollout_percentage, parent_feature_id) VALUES
('leaderboards', 'Global and friend leaderboards', true, 'all', 85,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'competition_features')),
('league_sharing', 'Share league results with graphics', true, 'premium', 80,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'competition_features')),
('tournaments', 'Structured tournament competitions', true, 'premium', 70,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'competition_features'))
ON CONFLICT (feature_name) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    description = EXCLUDED.description;

-- Analytics Features (children of analytics_features)
INSERT INTO public.feature_flags (feature_name, description, is_enabled, target_audience, rollout_percentage, parent_feature_id) VALUES
('progress_charts', 'Visual progress tracking charts', true, 'premium', 90,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'analytics_features')),
('performance_insights', 'Detailed performance analysis', true, 'premium', 85,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'analytics_features'))
ON CONFLICT (feature_name) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    description = EXCLUDED.description;

-- Update existing analytics features to be children
UPDATE public.feature_flags 
SET parent_feature_id = (SELECT id FROM public.feature_flags WHERE feature_name = 'analytics_features')
WHERE feature_name IN ('advanced_stats', 'goal_tracking');

-- UI Features (children of ui_features)
INSERT INTO public.feature_flags (feature_name, description, is_enabled, target_audience, rollout_percentage, parent_feature_id) VALUES
('timer_tips', 'Helpful tips during timer workouts', true, 'all', 100,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'ui_features')),
('dark_mode', 'Dark theme interface', true, 'all', 100,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'ui_features')),
('custom_themes', 'Personalized color themes', true, 'premium', 80,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'ui_features')),
('animated_transitions', 'Smooth UI animations', true, 'all', 90,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'ui_features'))
ON CONFLICT (feature_name) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    description = EXCLUDED.description;

-- Premium Features (children of premium_features)
INSERT INTO public.feature_flags (feature_name, description, is_enabled, target_audience, rollout_percentage, parent_feature_id) VALUES
('offline_mode', 'Download workouts for offline use', true, 'premium', 75,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'premium_features')),
('priority_support', 'Enhanced customer support', true, 'premium', 100,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'premium_features')),
('export_data', 'Export workout and progress data', true, 'premium', 85,
 (SELECT id FROM public.feature_flags WHERE feature_name = 'premium_features'))
ON CONFLICT (feature_name) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    description = EXCLUDED.description;

-- Update existing premium features to be children
UPDATE public.feature_flags 
SET parent_feature_id = (SELECT id FROM public.feature_flags WHERE feature_name = 'premium_features')
WHERE feature_name IN ('custom_workouts');

-- Create function to check if feature is enabled considering parent dependencies
CREATE OR REPLACE FUNCTION public.is_feature_enabled_with_parents(_feature_name TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  feature_record RECORD;
  parent_enabled BOOLEAN := true;
BEGIN
  -- Get the feature record
  SELECT * INTO feature_record 
  FROM feature_flags 
  WHERE feature_name = _feature_name;
  
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- If feature is disabled, return false immediately
  IF NOT feature_record.is_enabled THEN
    RETURN false;
  END IF;
  
  -- If feature has a parent, check if parent is enabled
  IF feature_record.parent_feature_id IS NOT NULL THEN
    SELECT is_enabled INTO parent_enabled
    FROM feature_flags
    WHERE id = feature_record.parent_feature_id;
    
    IF NOT parent_enabled THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;