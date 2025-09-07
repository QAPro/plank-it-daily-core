-- Add missing A/B testing columns to notification_message_variants
ALTER TABLE notification_message_variants 
ADD COLUMN weight INTEGER DEFAULT 1,
ADD COLUMN experiment_key TEXT,
ADD COLUMN title_template TEXT,
ADD COLUMN body_template TEXT;

-- Update existing variants to have title/body templates
UPDATE notification_message_variants 
SET title_template = content->>'title',
    body_template = content->>'body'
WHERE title_template IS NULL;

-- Add missing columns to notification_logs for A/B tracking
ALTER TABLE notification_logs 
ADD COLUMN variant_key TEXT,
ADD COLUMN experiment_key TEXT,
ADD COLUMN slot TEXT;

-- Create index for efficient variant lookups
CREATE INDEX IF NOT EXISTS idx_notification_variants_lookup 
ON notification_message_variants(category, COALESCE(slot,''), is_active, weight);

-- Seed essential message variants for all slots and event types
-- Morning slot variants (70% standard, 30% experimental)
INSERT INTO notification_message_variants (category, slot, variant_key, weight, experiment_key, title_template, body_template, content, is_active) VALUES
-- Morning reminders (standard)
('reminder', 'morning', 'morning_standard_1', 70, 'morning_tone_test', 'Good morning! 🌅', 'Start your day strong with a quick plank session', '{"title": "Good morning! 🌅", "body": "Start your day strong with a quick plank session", "icon": "/icons/notification-workout.png"}', true),
('reminder', 'morning', 'morning_standard_2', 70, 'morning_tone_test', 'Rise and shine! ☀️', 'Ready to energize your morning with some planks?', '{"title": "Rise and shine! ☀️", "body": "Ready to energize your morning with some planks?", "icon": "/icons/notification-workout.png"}', true),
-- Morning reminders (experimental - more urgent)
('reminder', 'morning', 'morning_urgent_1', 30, 'morning_tone_test', 'Don''t skip today! 💪', 'Your morning plank is waiting - just 30 seconds!', '{"title": "Don''t skip today! 💪", "body": "Your morning plank is waiting - just 30 seconds!", "icon": "/icons/notification-workout.png"}', true),

-- Lunch slot variants
('reminder', 'lunch', 'lunch_standard_1', 70, 'lunch_energy_test', 'Midday boost time! ⚡', 'Take a quick break and plank away the afternoon slump', '{"title": "Midday boost time! ⚡", "body": "Take a quick break and plank away the afternoon slump", "icon": "/icons/notification-workout.png"}', true),
('reminder', 'lunch', 'lunch_standard_2', 70, 'lunch_energy_test', 'Lunch break planks? 🥗', 'Perfect timing for a core-strengthening session!', '{"title": "Lunch break planks? 🥗", "body": "Perfect timing for a core-strengthening session!", "icon": "/icons/notification-workout.png"}', true),
-- Lunch experimental (productivity focused)
('reminder', 'lunch', 'lunch_productivity_1', 30, 'lunch_energy_test', 'Boost your afternoon! 🚀', 'A quick plank now = more energy for the rest of your day', '{"title": "Boost your afternoon! 🚀", "body": "A quick plank now = more energy for the rest of your day", "icon": "/icons/notification-workout.png"}', true),

-- Evening slot variants  
('reminder', 'evening', 'evening_standard_1', 70, 'evening_wind_down_test', 'Evening plank time! 🌆', 'Wind down your day with a strengthening session', '{"title": "Evening plank time! 🌆", "body": "Wind down your day with a strengthening session", "icon": "/icons/notification-workout.png"}', true),
('reminder', 'evening', 'evening_standard_2', 70, 'evening_wind_down_test', 'Ready to plank? 🏃‍♀️', 'End your day strong with some core work', '{"title": "Ready to plank? 🏃‍♀️", "body": "End your day strong with some core work", "icon": "/icons/notification-workout.png"}', true),
-- Evening experimental (habit formation)
('reminder', 'evening', 'evening_habit_1', 30, 'evening_wind_down_test', 'Keep the streak alive! 🔥', 'Your evening plank ritual is calling', '{"title": "Keep the streak alive! 🔥", "body": "Your evening plank ritual is calling", "icon": "/icons/notification-workout.png"}', true),

-- Last chance slot variants
('reminder', 'last_chance', 'last_chance_standard_1', 70, 'urgency_test', 'Last call for today! ⏰', 'Don''t let today slip by - quick plank session?', '{"title": "Last call for today! ⏰", "body": "Don''t let today slip by - quick plank session?", "icon": "/icons/notification-workout.png"}', true),
('reminder', 'last_chance', 'last_chance_standard_2', 70, 'urgency_test', 'Still time left! ⌛', 'End your day with a win - just one quick plank', '{"title": "Still time left! ⌛", "body": "End your day with a win - just one quick plank", "icon": "/icons/notification-workout.png"}', true),
-- Last chance experimental (FOMO)
('reminder', 'last_chance', 'last_chance_fomo_1', 30, 'urgency_test', 'Don''t break your streak! 😰', 'Only a few hours left to keep your momentum going', '{"title": "Don''t break your streak! 😰", "body": "Only a few hours left to keep your momentum going", "icon": "/icons/notification-workout.png"}', true),

-- Achievement variants
('achievement', NULL, 'achievement_standard_1', 70, 'celebration_tone_test', '🎉 Achievement Unlocked!', 'You''ve earned: {achievement_name}', '{"title": "🎉 Achievement Unlocked!", "body": "You''ve earned: {achievement_name}", "icon": "/icons/notification-achievement.png"}', true),
('achievement', NULL, 'achievement_exciting_1', 30, 'celebration_tone_test', '🚀 BOOM! New Achievement!', 'You just crushed it: {achievement_name}!', '{"title": "🚀 BOOM! New Achievement!", "body": "You just crushed it: {achievement_name}!", "icon": "/icons/notification-achievement.png"}', true),

-- Streak risk variants
('streak_risk', NULL, 'streak_risk_standard_1', 70, 'streak_urgency_test', 'Your streak needs you! 🔥', 'Don''t lose your {streak_days}-day streak - quick session?', '{"title": "Your streak needs you! 🔥", "body": "Don''t lose your {streak_days}-day streak - quick session?", "icon": "/icons/notification-streak.png"}', true),
('streak_risk', NULL, 'streak_risk_urgent_1', 30, 'streak_urgency_test', 'STREAK ALERT! 🚨', '{streak_days} days on the line - don''t let it slip away!', '{"title": "STREAK ALERT! 🚨", "body": "{streak_days} days on the line - don''t let it slip away!", "icon": "/icons/notification-streak.png"}', true),

-- Social activity variants
('social', NULL, 'social_standard_1', 70, 'social_motivation_test', 'Friend activity! 👥', '{friend_name} just completed a workout - your turn?', '{"title": "Friend activity! 👥", "body": "{friend_name} just completed a workout - your turn?", "icon": "/icons/notification-workout.png"}', true),
('social', NULL, 'social_competitive_1', 30, 'social_motivation_test', 'Don''t get left behind! 🏃‍♂️', '{friend_name} is crushing it - time to catch up!', '{"title": "Don''t get left behind! 🏃‍♂️", "body": "{friend_name} is crushing it - time to catch up!", "icon": "/icons/notification-workout.png"}', true)

ON CONFLICT (category, COALESCE(slot, ''), variant_key) DO NOTHING;