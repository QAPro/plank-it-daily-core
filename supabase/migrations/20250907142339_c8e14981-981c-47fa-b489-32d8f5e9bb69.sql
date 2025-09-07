-- Add weight and experiment support to notification_message_variants (skip time_zone as it already exists)
ALTER TABLE notification_message_variants
ADD COLUMN weight INTEGER DEFAULT 100,
ADD COLUMN experiment_key TEXT,
ADD COLUMN is_active BOOLEAN DEFAULT true;

-- Add variant tracking to notification_logs  
ALTER TABLE notification_logs
ADD COLUMN variant_key TEXT,
ADD COLUMN experiment_key TEXT;

-- Create notification_interactions table
CREATE TABLE notification_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  notification_type TEXT NOT NULL,
  category TEXT NOT NULL,
  action TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on notification_interactions
ALTER TABLE notification_interactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_interactions
CREATE POLICY "Users can view own interactions" ON notification_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert interactions" ON notification_interactions
  FOR INSERT WITH CHECK (true);

-- Add performance indexes
CREATE INDEX idx_notification_logs_user_sent ON notification_logs(user_id, sent_at);
CREATE INDEX idx_notification_logs_type_sent ON notification_logs(notification_type, sent_at);
CREATE INDEX idx_notification_interactions_user_created ON notification_interactions(user_id, created_at);
CREATE INDEX idx_user_notification_schedules_user_slot ON user_notification_schedules(user_id, slot);

-- Migrate existing reminder_time data to user_notification_schedules
INSERT INTO user_notification_schedules (user_id, slot, send_time, enabled)
SELECT 
  user_id,
  'evening' as slot,
  COALESCE(reminder_time, '18:00:00'::time) as send_time,
  true as enabled
FROM user_preferences
WHERE user_id NOT IN (
  SELECT DISTINCT user_id 
  FROM user_notification_schedules 
  WHERE slot = 'evening'
)
ON CONFLICT (user_id, slot) DO NOTHING;

-- Add default disabled slots for existing users
INSERT INTO user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'morning', '09:00:00'::time, false
FROM user_preferences
WHERE user_id NOT IN (
  SELECT user_id FROM user_notification_schedules WHERE slot = 'morning'
)
UNION ALL
SELECT user_id, 'lunch', '12:00:00'::time, false
FROM user_preferences
WHERE user_id NOT IN (
  SELECT user_id FROM user_notification_schedules WHERE slot = 'lunch'
)
UNION ALL
SELECT user_id, 'last_chance', '20:00:00'::time, false
FROM user_preferences
WHERE user_id NOT IN (
  SELECT user_id FROM user_notification_schedules WHERE slot = 'last_chance'
);

-- Seed notification message variants
INSERT INTO notification_message_variants (type, slot, variant_key, title_template, body_template, weight, experiment_key, is_active) VALUES
-- Morning reminders
('reminders', 'morning', 'energetic_start', '🌅 Rise and Shine!', 'Start your day strong with a quick plank session!', 100, 'morning_tone_test', true),
('reminders', 'morning', 'gentle_morning', '☀️ Good Morning!', 'A gentle plank to wake up your core muscles.', 100, 'morning_tone_test', true),

-- Lunch reminders  
('reminders', 'lunch', 'midday_boost', '🚀 Midday Power Up!', 'Take a quick break and energize with a plank!', 100, 'lunch_motivation_test', true),
('reminders', 'lunch', 'lunch_break', '🍽️ Lunch Break Plank', 'Perfect time for a quick core workout!', 100, 'lunch_motivation_test', true),

-- Evening reminders
('reminders', 'evening', 'evening_routine', '🌆 Evening Core Time', 'End your day with a strengthening plank session.', 100, 'evening_approach_test', true),
('reminders', 'evening', 'wind_down', '🌙 Wind Down Workout', 'A calming plank to finish your day right.', 100, 'evening_approach_test', true),

-- Last chance reminders
('reminders', 'last_chance', 'dont_miss_out', '⏰ Don''t Miss Out!', 'Last chance to keep your streak alive today!', 100, 'urgency_test', true),
('reminders', 'last_chance', 'streak_saver', '🔥 Streak Saver Alert!', 'Quick plank needed to maintain your progress!', 100, 'urgency_test', true),

-- Streak milestones
('streaks', null, 'celebration', '🎉 Streak Milestone!', 'Amazing! You''ve reached {{streak_days}} days in a row!', 100, 'milestone_celebration', true),
('streaks', null, 'motivation', '💪 Streak Power!', '{{streak_days}} days strong! Your consistency is inspiring!', 100, 'milestone_celebration', true),

-- Weekly progress
('milestones', null, 'progress_summary', '📊 Weekly Progress', 'This week: {{sessions}} sessions, {{minutes}} minutes of training!', 100, 'weekly_format', true),
('milestones', null, 'achievement_focus', '🏆 Weekly Achievements', 'Great week! {{sessions}} workouts completed, keep it up!', 100, 'weekly_format', true);