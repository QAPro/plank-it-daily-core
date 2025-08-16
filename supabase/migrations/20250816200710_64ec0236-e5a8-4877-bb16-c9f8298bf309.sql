
-- Extend user_preferences table with enhanced timer settings
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS timer_theme TEXT DEFAULT 'default';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS timer_sound_pack TEXT DEFAULT 'classic';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS coaching_voice TEXT DEFAULT 'encouraging';
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS breathing_guidance BOOLEAN DEFAULT true;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS form_reminders BOOLEAN DEFAULT true;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS adaptive_timing BOOLEAN DEFAULT true;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS background_music BOOLEAN DEFAULT false;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS music_volume NUMERIC DEFAULT 0.3;
ALTER TABLE public.user_preferences ADD COLUMN IF NOT EXISTS vibration_intensity INTEGER DEFAULT 3;

-- Create timer_themes table for custom themes
CREATE TABLE public.timer_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color_scheme JSONB NOT NULL DEFAULT '{}',
  visual_effects JSONB NOT NULL DEFAULT '{}',
  created_by UUID,
  is_public BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create coaching_messages table for personalized content
CREATE TABLE public.coaching_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_type TEXT NOT NULL, -- 'encouragement', 'form_reminder', 'breathing', 'milestone'
  content TEXT NOT NULL,
  voice_variant TEXT DEFAULT 'encouraging',
  trigger_condition JSONB DEFAULT '{}', -- when to show this message
  user_id UUID, -- NULL for global messages
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create detailed timer sessions for advanced analytics
CREATE TABLE public.timer_sessions_detailed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID,
  duration_seconds INTEGER NOT NULL,
  target_duration INTEGER NOT NULL,
  completion_rate NUMERIC NOT NULL DEFAULT 0,
  theme_used TEXT,
  coaching_enabled BOOLEAN DEFAULT false,
  breathing_guidance_used BOOLEAN DEFAULT false,
  performance_metrics JSONB DEFAULT '{}',
  user_feedback JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.timer_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coaching_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.timer_sessions_detailed ENABLE ROW LEVEL SECURITY;

-- RLS Policies for timer_themes
CREATE POLICY "Anyone can view public themes" 
ON public.timer_themes FOR SELECT 
USING (is_public = true OR created_by = auth.uid());

CREATE POLICY "Users can create themes" 
ON public.timer_themes FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own themes" 
ON public.timer_themes FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own themes" 
ON public.timer_themes FOR DELETE 
USING (auth.uid() = created_by);

-- RLS Policies for coaching_messages
CREATE POLICY "Users can view global and own messages" 
ON public.coaching_messages FOR SELECT 
USING (user_id IS NULL OR user_id = auth.uid());

CREATE POLICY "Users can create own messages" 
ON public.coaching_messages FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own messages" 
ON public.coaching_messages FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages" 
ON public.coaching_messages FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for timer_sessions_detailed
CREATE POLICY "Users can view own detailed sessions" 
ON public.timer_sessions_detailed FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own detailed sessions" 
ON public.timer_sessions_detailed FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own detailed sessions" 
ON public.timer_sessions_detailed FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_timer_themes_public ON public.timer_themes(is_public) WHERE is_public = true;
CREATE INDEX idx_timer_themes_featured ON public.timer_themes(is_featured) WHERE is_featured = true;
CREATE INDEX idx_coaching_messages_type ON public.coaching_messages(message_type);
CREATE INDEX idx_coaching_messages_user ON public.coaching_messages(user_id);
CREATE INDEX idx_timer_sessions_detailed_user ON public.timer_sessions_detailed(user_id);
CREATE INDEX idx_timer_sessions_detailed_date ON public.timer_sessions_detailed(created_at);

-- Insert default timer themes
INSERT INTO public.timer_themes (name, description, color_scheme, visual_effects, is_public, is_featured) VALUES
('Ocean Breeze', 'Calming blue gradient theme with wave animations', 
'{"primary": "#0EA5E9", "secondary": "#0284C7", "accent": "#38BDF8", "background": "linear-gradient(135deg, #0EA5E9, #0284C7)"}',
'{"particles": "waves", "animation": "gentle", "glow": true}', true, true),

('Sunset Power', 'Energizing orange and red theme for high-intensity workouts',
'{"primary": "#F97316", "secondary": "#EA580C", "accent": "#FB923C", "background": "linear-gradient(135deg, #F97316, #EA580C)"}',
'{"particles": "energy", "animation": "dynamic", "glow": true}', true, true),

('Forest Zen', 'Green nature theme for mindful focus',
'{"primary": "#22C55E", "secondary": "#16A34A", "accent": "#4ADE80", "background": "linear-gradient(135deg, #22C55E, #16A34A)"}',
'{"particles": "leaves", "animation": "peaceful", "glow": false}', true, true),

('Midnight Focus', 'Dark theme for evening workouts',
'{"primary": "#6366F1", "secondary": "#4F46E5", "accent": "#8B5CF6", "background": "linear-gradient(135deg, #1F2937, #374151)"}',
'{"particles": "stars", "animation": "subtle", "glow": true}', true, true),

('Classic Clean', 'Simple, distraction-free theme',
'{"primary": "#64748B", "secondary": "#475569", "accent": "#94A3B8", "background": "linear-gradient(135deg, #F8FAFC, #E2E8F0)"}',
'{"particles": "none", "animation": "minimal", "glow": false}', true, true);

-- Insert default coaching messages
INSERT INTO public.coaching_messages (message_type, content, voice_variant, trigger_condition) VALUES
('encouragement', 'You''re doing amazing! Keep that form strong!', 'encouraging', '{"timing": "mid_session"}'),
('encouragement', 'Push through! You''ve got this!', 'motivational', '{"timing": "difficult_moment"}'),
('encouragement', 'Fantastic work! You''re stronger than you think!', 'celebrating', '{"timing": "completion"}'),
('form_reminder', 'Keep your core tight and breathe steadily', 'instructional', '{"timing": "form_check"}'),
('form_reminder', 'Remember to keep your body in a straight line', 'gentle', '{"timing": "form_check"}'),
('breathing', 'Breathe in... and out... find your rhythm', 'calming', '{"timing": "breathing_guide"}'),
('breathing', 'Deep breath in... slow breath out...', 'soothing', '{"timing": "breathing_guide"}'),
('milestone', 'Halfway there! You''re crushing this!', 'celebrating', '{"timing": "50_percent"}'),
('milestone', '10 seconds left! Finish strong!', 'urgent', '{"timing": "final_countdown"}'),
('milestone', 'New personal best! Keep going!', 'exciting', '{"timing": "personal_record"}');
