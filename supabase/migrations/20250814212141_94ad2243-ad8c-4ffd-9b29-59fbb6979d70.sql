
-- Create share templates table
CREATE TABLE share_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('workout', 'achievement', 'streak', 'progress', 'challenge')),
  template_data JSONB NOT NULL DEFAULT '{}',
  is_public BOOLEAN DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create share analytics table
CREATE TABLE share_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  template_id UUID REFERENCES share_templates(id),
  shared_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  engagement_data JSONB DEFAULT '{}'
);

-- Create community challenges table
CREATE TABLE community_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  description TEXT,
  challenge_type TEXT NOT NULL DEFAULT 'workout',
  target_data JSONB NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_public BOOLEAN DEFAULT true,
  participant_count INTEGER DEFAULT 0,
  template_id UUID REFERENCES share_templates(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create challenge participants table
CREATE TABLE challenge_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES community_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  progress_data JSONB DEFAULT '{}',
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS on all tables
ALTER TABLE share_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE share_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenge_participants ENABLE ROW LEVEL SECURITY;

-- RLS policies for share_templates
CREATE POLICY "Users can view public templates and own templates" ON share_templates
  FOR SELECT USING (is_public = true OR auth.uid() = created_by);

CREATE POLICY "Users can create own templates" ON share_templates
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" ON share_templates
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates" ON share_templates
  FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for share_analytics
CREATE POLICY "Users can view own share analytics" ON share_analytics
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own share analytics" ON share_analytics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS policies for community_challenges
CREATE POLICY "Anyone can view public challenges" ON community_challenges
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can create challenges" ON community_challenges
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own challenges" ON community_challenges
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own challenges" ON community_challenges
  FOR DELETE USING (auth.uid() = created_by);

-- RLS policies for challenge_participants
CREATE POLICY "Users can view challenge participants" ON challenge_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join challenges" ON challenge_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" ON challenge_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Insert default share templates
INSERT INTO share_templates (name, type, template_data, is_public, created_by) VALUES
('Classic Workout Card', 'workout', '{
  "background_color": "#1a1a2e",
  "text_color": "#ffffff",
  "accent_color": "#16213e",
  "layout": "card",
  "elements": [
    {
      "type": "text",
      "content": "{{exercise_name}}",
      "position": {"x": 50, "y": 20},
      "style": {"fontSize": 24, "fontWeight": "bold", "textAlign": "center"}
    },
    {
      "type": "stat",
      "content": "{{duration}}s",
      "position": {"x": 50, "y": 40},
      "style": {"fontSize": 36, "fontWeight": "bold", "textAlign": "center", "color": "#4ade80"}
    },
    {
      "type": "text",
      "content": "Personal Best: {{is_personal_best}}",
      "position": {"x": 50, "y": 60},
      "style": {"fontSize": 16, "textAlign": "center"}
    }
  ]
}', true, null),
('Achievement Celebration', 'achievement', '{
  "background_color": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "text_color": "#ffffff",
  "layout": "celebration",
  "elements": [
    {
      "type": "text",
      "content": "🏆 Achievement Unlocked!",
      "position": {"x": 50, "y": 15},
      "style": {"fontSize": 20, "fontWeight": "bold", "textAlign": "center"}
    },
    {
      "type": "text",
      "content": "{{achievement_name}}",
      "position": {"x": 50, "y": 35},
      "style": {"fontSize": 28, "fontWeight": "bold", "textAlign": "center"}
    },
    {
      "type": "text",
      "content": "{{description}}",
      "position": {"x": 50, "y": 55},
      "style": {"fontSize": 16, "textAlign": "center", "opacity": 0.9}
    }
  ]
}', true, null),
('Streak Milestone', 'streak', '{
  "background_color": "linear-gradient(135deg, #ff9a56 0%, #ff6b6b 100%)",
  "text_color": "#ffffff",
  "layout": "milestone",
  "elements": [
    {
      "type": "text",
      "content": "🔥 {{streak_days}} Day Streak!",
      "position": {"x": 50, "y": 30},
      "style": {"fontSize": 32, "fontWeight": "bold", "textAlign": "center"}
    },
    {
      "type": "text",
      "content": "Consistency is key! 💪",
      "position": {"x": 50, "y": 55},
      "style": {"fontSize": 18, "textAlign": "center"}
    }
  ]
}', true, null);
