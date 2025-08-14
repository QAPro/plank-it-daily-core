
-- Add level progression fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS total_xp INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_level INTEGER DEFAULT 1;

-- Create XP transactions table for tracking XP gains
CREATE TABLE IF NOT EXISTS xp_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  source TEXT NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create feature unlocks table for user unlock tracking  
CREATE TABLE IF NOT EXISTS feature_unlocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  feature_name TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unlock_level INTEGER NOT NULL,
  UNIQUE(user_id, feature_name)
);

-- Create level unlocks definition table
CREATE TABLE IF NOT EXISTS level_unlocks (
  level INTEGER PRIMARY KEY,
  feature_name TEXT NOT NULL,
  feature_description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL
);

-- Seed level unlocks data
INSERT INTO level_unlocks (level, feature_name, feature_description, icon, category) VALUES
(3, 'Timer Customization', 'Customize timer appearance and sounds', '⏱️', 'customization'),
(5, 'Analytics Dashboard', 'Detailed workout analytics and insights', '📊', 'feature'),
(7, 'Custom Workouts', 'Create your own workout routines', '📝', 'feature'),
(10, 'Social Features', 'Connect with friends and join challenges', '👥', 'social'),
(12, 'Advanced Exercises', 'Unlock challenging plank variations', '💪', 'exercise'),
(15, 'AI Coaching', 'Get personalized coaching recommendations', '🤖', 'feature'),
(18, 'Premium Preview', 'Preview premium features', '⭐', 'feature'),
(20, 'Master Status', 'Achieve master level recognition', '🏆', 'feature')
ON CONFLICT (level) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_unlocks ENABLE ROW LEVEL SECURITY;

-- RLS policies for xp_transactions
CREATE POLICY "Users can view own XP transactions" ON xp_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own XP transactions" ON xp_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for feature_unlocks
CREATE POLICY "Users can view own feature unlocks" ON feature_unlocks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own feature unlocks" ON feature_unlocks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow public read access to level_unlocks (definition table)
ALTER TABLE level_unlocks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view level unlocks" ON level_unlocks
  FOR SELECT USING (true);
