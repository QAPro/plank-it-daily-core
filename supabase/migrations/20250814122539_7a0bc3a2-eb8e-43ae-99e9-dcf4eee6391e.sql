
-- First, let's update the existing achievement system to support the expanded framework

-- Add new columns to support the enhanced achievement system
ALTER TABLE user_achievements ADD COLUMN IF NOT EXISTS
  category TEXT DEFAULT 'milestone',
  rarity TEXT DEFAULT 'common',
  points INTEGER DEFAULT 10;

-- Create achievement progress tracking table
CREATE TABLE IF NOT EXISTS user_achievement_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  achievement_id TEXT NOT NULL,
  current_progress INTEGER DEFAULT 0,
  target_progress INTEGER NOT NULL,
  progress_data JSONB DEFAULT '{}',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS on the new table
ALTER TABLE user_achievement_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for achievement progress
CREATE POLICY "Users can view own achievement progress"
  ON user_achievement_progress
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own achievement progress"
  ON user_achievement_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievement progress"
  ON user_achievement_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievement progress"
  ON user_achievement_progress
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add achievement points and level to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  total_achievement_points INTEGER DEFAULT 0,
  achievement_level INTEGER DEFAULT 1;

-- Create function to update achievement progress
CREATE OR REPLACE FUNCTION update_achievement_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Update progress in the user_achievement_progress table
  INSERT INTO user_achievement_progress (user_id, achievement_id, current_progress, target_progress)
  VALUES (NEW.user_id, NEW.achievement_name, 1, 1)
  ON CONFLICT (user_id, achievement_id) 
  DO UPDATE SET 
    current_progress = user_achievement_progress.target_progress,
    last_updated = NOW();
  
  -- Update user's total achievement points
  UPDATE users 
  SET total_achievement_points = total_achievement_points + COALESCE(NEW.points, 10)
  WHERE id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update progress when achievements are earned
DROP TRIGGER IF EXISTS trigger_update_achievement_progress ON user_achievements;
CREATE TRIGGER trigger_update_achievement_progress
  AFTER INSERT ON user_achievements
  FOR EACH ROW
  EXECUTE FUNCTION update_achievement_progress();
