
-- Extend users table with social fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS privacy_settings JSONB DEFAULT '{"show_workouts": true, "show_achievements": true, "show_streak": true}';
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_online BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Ensure username column exists and is unique
ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE users ADD CONSTRAINT users_username_unique UNIQUE (username);

-- Friends table for managing friendships and requests
CREATE TABLE friends (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  friend_user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, friend_user_id)
);

-- Friend activities feed
CREATE TABLE friend_activities (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('workout', 'achievement', 'level_up', 'streak_milestone')),
  activity_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Friend reactions to activities
CREATE TABLE friend_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  activity_id UUID REFERENCES friend_activities(id) ON DELETE CASCADE NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('cheer', 'fire', 'strong', 'clap')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, activity_id)
);

-- Create indexes for performance
CREATE INDEX idx_friends_user_id ON friends(user_id);
CREATE INDEX idx_friends_friend_user_id ON friends(friend_user_id);
CREATE INDEX idx_friends_status ON friends(status);
CREATE INDEX idx_friend_activities_user_id ON friend_activities(user_id);
CREATE INDEX idx_friend_activities_created_at ON friend_activities(created_at DESC);
CREATE INDEX idx_friend_reactions_activity_id ON friend_reactions(activity_id);

-- Enable RLS on new tables
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_reactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for friends table
CREATE POLICY "Users can view their own friendships" ON friends
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

CREATE POLICY "Users can create friend requests" ON friends
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update friend requests sent to them" ON friends
  FOR UPDATE USING (auth.uid() = friend_user_id);

CREATE POLICY "Users can delete their own friendships" ON friends
  FOR DELETE USING (auth.uid() = user_id OR auth.uid() = friend_user_id);

-- RLS policies for friend_activities table
CREATE POLICY "Users can view activities from friends" ON friend_activities
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM friends 
      WHERE (user_id = auth.uid() AND friend_user_id = friend_activities.user_id AND status = 'accepted')
    )
  );

CREATE POLICY "Users can create their own activities" ON friend_activities
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for friend_reactions table
CREATE POLICY "Users can view reactions on visible activities" ON friend_reactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM friend_activities fa
      WHERE fa.id = activity_id AND (
        auth.uid() = fa.user_id OR 
        EXISTS (
          SELECT 1 FROM friends 
          WHERE (user_id = auth.uid() AND friend_user_id = fa.user_id AND status = 'accepted')
        )
      )
    )
  );

CREATE POLICY "Users can create reactions" ON friend_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions" ON friend_reactions
  FOR DELETE USING (auth.uid() = user_id);

-- Add Friends feature unlock at Level 10
INSERT INTO level_unlocks (level, feature_name, feature_description, icon, category)
VALUES (10, 'friends_system', 'Connect with friends, share activities, and motivate each other', '👥', 'social')
ON CONFLICT (level, feature_name) DO NOTHING;

-- Enable realtime for friend activities
ALTER TABLE friend_activities REPLICA IDENTITY FULL;
ALTER publication supabase_realtime ADD TABLE friend_activities;
ALTER publication supabase_realtime ADD TABLE friend_reactions;
ALTER publication supabase_realtime ADD TABLE friends;
