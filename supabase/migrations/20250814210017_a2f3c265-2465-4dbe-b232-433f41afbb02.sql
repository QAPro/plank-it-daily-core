
-- Add activity comments table for the commenting system
CREATE TABLE activity_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  activity_id UUID REFERENCES friend_activities(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add RLS policies for activity comments
ALTER TABLE activity_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view comments on visible activities" 
  ON activity_comments 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM friend_activities fa 
      WHERE fa.id = activity_id 
      AND (fa.visibility = 'public' OR 
           (fa.visibility = 'friends' AND 
            (fa.user_id = auth.uid() OR 
             EXISTS (SELECT 1 FROM friends WHERE 
                    (user_id = auth.uid() AND friend_id = fa.user_id AND status = 'accepted') OR
                    (friend_id = auth.uid() AND user_id = fa.user_id AND status = 'accepted')))))
    )
  );

CREATE POLICY "Users can create comments on friend activities" 
  ON activity_comments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
  ON activity_comments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" 
  ON activity_comments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Enhance friend_activities table with visibility and shares
ALTER TABLE friend_activities 
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'friends' CHECK (visibility IN ('public', 'friends', 'private')),
ADD COLUMN IF NOT EXISTS shares_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS activity_data JSONB DEFAULT '{}';

-- Update friend_reactions to support more reaction types
ALTER TABLE friend_reactions 
DROP CONSTRAINT IF EXISTS friend_reactions_reaction_type_check;

ALTER TABLE friend_reactions 
ADD CONSTRAINT friend_reactions_reaction_type_check 
CHECK (reaction_type IN ('cheer', 'fire', 'strong', 'clap', 'heart'));

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_friend_activities_type ON friend_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_friend_activities_visibility ON friend_activities(visibility);
CREATE INDEX IF NOT EXISTS idx_friend_activities_created_at ON friend_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_id ON activity_comments(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_created_at ON activity_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_reactions_activity_id ON friend_reactions(activity_id);

-- Add trigger to update activity_data with rich content for existing activities
CREATE OR REPLACE FUNCTION update_activity_data_trigger()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure activity_data is properly structured
  IF NEW.activity_data IS NULL OR NEW.activity_data = '{}' THEN
    CASE NEW.activity_type
      WHEN 'workout' THEN
        NEW.activity_data = jsonb_build_object(
          'exercise_name', COALESCE(NEW.activity_data->>'exercise_name', 'Workout'),
          'duration', COALESCE((NEW.activity_data->>'duration')::integer, 30),
          'difficulty_level', COALESCE((NEW.activity_data->>'difficulty_level')::integer, 1)
        );
      WHEN 'achievement' THEN
        NEW.activity_data = jsonb_build_object(
          'achievement_name', COALESCE(NEW.activity_data->>'achievement_name', 'Achievement Unlocked'),
          'achievement_description', COALESCE(NEW.activity_data->>'achievement_description', 'Great job!'),
          'achievement_rarity', COALESCE(NEW.activity_data->>'achievement_rarity', 'common')
        );
      WHEN 'streak_milestone' THEN
        NEW.activity_data = jsonb_build_object(
          'streak_length', COALESCE((NEW.activity_data->>'streak_length')::integer, 1),
          'streak_type', COALESCE(NEW.activity_data->>'streak_type', 'daily')
        );
      ELSE
        NEW.activity_data = '{}';
    END CASE;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_data_before_insert
  BEFORE INSERT ON friend_activities
  FOR EACH ROW
  EXECUTE FUNCTION update_activity_data_trigger();

-- Add privacy settings to users table if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'privacy_settings') THEN
    ALTER TABLE users ADD COLUMN privacy_settings JSONB DEFAULT jsonb_build_object(
      'show_workouts', true,
      'show_achievements', true,
      'show_streak', true,
      'show_level_ups', true,
      'show_personal_bests', true
    );
  END IF;
END $$;

-- Enable realtime for new tables
ALTER TABLE activity_comments REPLICA IDENTITY FULL;
ALTER TABLE friend_activities REPLICA IDENTITY FULL;
ALTER TABLE friend_reactions REPLICA IDENTITY FULL;

-- Add to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE activity_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE friend_activities;
ALTER PUBLICATION supabase_realtime ADD TABLE friend_reactions;
