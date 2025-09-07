-- Create user_notification_schedules table (replaces user_reminder_slots)
CREATE TABLE IF NOT EXISTS public.user_notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('morning', 'lunch', 'evening', 'last_chance')),
  send_time TIME NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, slot)
);

-- Enable RLS
ALTER TABLE public.user_notification_schedules ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage own notification schedules" 
ON public.user_notification_schedules 
FOR ALL 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all notification schedules" 
ON public.user_notification_schedules 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Add missing columns to notification_message_variants
ALTER TABLE public.notification_message_variants 
ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS experiment_key TEXT,
ADD COLUMN IF NOT EXISTS title_template TEXT,
ADD COLUMN IF NOT EXISTS body_template TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add missing columns to notification_logs  
ALTER TABLE public.notification_logs 
ADD COLUMN IF NOT EXISTS variant_key TEXT,
ADD COLUMN IF NOT EXISTS experiment_key TEXT;

-- Create notification_interactions table if not exists
CREATE TABLE IF NOT EXISTS public.notification_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_log_id UUID REFERENCES public.notification_logs(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('click', 'dismiss', 'view')),
  interaction_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for notification_interactions
ALTER TABLE public.notification_interactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for notification_interactions
CREATE POLICY "Users can create own interactions" 
ON public.notification_interactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own interactions" 
ON public.notification_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all interactions" 
ON public.notification_interactions 
FOR SELECT 
USING (is_admin(auth.uid()));

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notification_schedules_user_enabled ON public.user_notification_schedules(user_id, enabled);
CREATE INDEX IF NOT EXISTS idx_notification_variants_lookup ON public.notification_message_variants(category, COALESCE(slot,''), is_active);
CREATE INDEX IF NOT EXISTS idx_notification_interactions_user ON public.notification_interactions(user_id, created_at);

-- Migrate existing reminder_time data to evening slots
INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT 
  user_id,
  'evening' as slot,
  COALESCE(reminder_time, '18:00:00'::TIME) as send_time,
  workout_reminders as enabled
FROM public.user_preferences
WHERE user_id NOT IN (
  SELECT user_id FROM public.user_notification_schedules WHERE slot = 'evening'
)
ON CONFLICT (user_id, slot) DO NOTHING;

-- Add default disabled slots for existing users
INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'morning', '08:00:00'::TIME, false
FROM public.user_preferences
WHERE user_id NOT IN (
  SELECT user_id FROM public.user_notification_schedules WHERE slot = 'morning'
)
ON CONFLICT (user_id, slot) DO NOTHING;

INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'lunch', '12:00:00'::TIME, false
FROM public.user_preferences
WHERE user_id NOT IN (
  SELECT user_id FROM public.user_notification_schedules WHERE slot = 'lunch'
)
ON CONFLICT (user_id, slot) DO NOTHING;

INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'last_chance', '20:00:00'::TIME, false
FROM public.user_preferences
WHERE user_id NOT IN (
  SELECT user_id FROM public.user_notification_schedules WHERE slot = 'last_chance'
)
ON CONFLICT (user_id, slot) DO NOTHING;

-- Seed notification message variants for A/B testing
INSERT INTO public.notification_message_variants (category, slot, variant_key, weight, experiment_key, title_template, body_template, metadata, is_active) VALUES
-- Morning reminder variants
('reminder', 'morning', 'encouraging', 2, 'morning_tone_test', 'Good morning! 💪', 'Start your day strong with a quick plank session!', '{"tone": "encouraging"}', true),
('reminder', 'morning', 'gentle', 1, 'morning_tone_test', 'Morning stretch time', 'A gentle plank to wake up your core', '{"tone": "gentle"}', true),

-- Evening reminder variants  
('reminder', 'evening', 'motivational', 2, 'evening_tone_test', 'Evening workout time! 🔥', 'End your day with strength - plank time!', '{"tone": "motivational"}', true),
('reminder', 'evening', 'relaxed', 1, 'evening_tone_test', 'Wind down workout', 'A calming plank session to finish your day', '{"tone": "relaxed"}', true),

-- Streak risk variants
('streak_risk', null, 'urgent', 2, 'streak_urgency_test', 'Your streak is at risk! ⚠️', 'Don''t break your {{streak_days}} day streak - quick plank now!', '{"urgency": "high"}', true),
('streak_risk', null, 'supportive', 1, 'streak_urgency_test', 'Keep it going! 💪', 'You''ve got {{streak_days}} days - just a quick plank to continue!', '{"urgency": "low"}', true),

-- Achievement variants
('achievement', null, 'celebration', 2, 'achievement_style_test', 'Achievement Unlocked! 🏆', 'Amazing! You just earned: {{achievement_name}}', '{"style": "celebration"}', true),
('achievement', null, 'progress', 1, 'achievement_style_test', 'Progress milestone! ⭐', 'Great work reaching: {{achievement_name}}', '{"style": "progress"}', true)

ON CONFLICT (category, COALESCE(slot,''), variant_key) DO NOTHING;