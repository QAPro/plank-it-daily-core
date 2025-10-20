-- Bulk insert all 346 achievements from Achievement Matrix
INSERT INTO public.achievements (id, name, description, category, rarity, points, criteria, is_premium, is_secret, related_exercise_categories, badge_file_name, icon, unlock_criteria) VALUES
('ACH_001', 'First Steps', 'Log your very first workout', 'Milestones', 'Common', 10, 'Complete 1 session', false, false, '{}', 'badge_milestones_first_steps_common.png', 'Trophy', NULL),
('ACH_002', 'Streak Starter', 'Complete 3 workouts in a row', 'Consistency', 'Common', 25, '3-day streak', false, false, '{}', 'badge_consistency_streak_starter_common.png', 'Flame', NULL),
('ACH_003', 'Week Warrior', 'Complete 7 workouts in a row', 'Milestones', 'Uncommon', 50, '7-day streak', false, false, '{}', 'badge_milestones_week_warrior_uncommon.png', 'Calendar', NULL),
('ACH_004', 'Dedication', 'Complete 14 workouts in a row', 'Milestones', 'Uncommon', 100, '14-day streak', false, false, '{}', 'badge_milestones_dedication_uncommon.png', 'Medal', NULL),
('ACH_005', 'Consistency King', 'Complete 30 workouts in a row', 'Milestones', 'Rare', 200, '30-day streak', false, false, '{}', 'badge_milestones_consistency_king_rare.png', 'Crown', NULL),
('ACH_006', 'Marathon Runner', 'Complete 60 workouts in a row', 'Milestones', 'Epic', 500, '60-day streak', false, false, '{}', 'badge_milestones_marathon_runner_epic.png', 'Star', NULL),
('ACH_007', 'Legend Status', 'Complete 100 workouts in a row', 'Milestones', 'Epic', 1000, '100-day streak', false, false, '{"Leg Strength"}', 'badge_milestones_legend_status_epic.png', 'Crown', NULL),
('ACH_008', 'Speed Demon', 'Complete a 1-minute workout', 'Momentum', 'Common', 15, 'Complete session <= 60 seconds', false, false, '{}', 'badge_momentum_speed_demon_common.png', 'Zap', NULL),
('ACH_009', 'Quick Session', 'Complete a 5-minute workout', 'Momentum', 'Common', 25, 'Complete session <= 300 seconds', false, false, '{}', 'badge_momentum_quick_session_common.png', 'Clock', NULL),
('ACH_010', 'Standard Session', 'Complete a 10-minute workout', 'Momentum', 'Common', 50, 'Complete session <= 600 seconds', false, false, '{}', 'badge_momentum_standard_session_common.png', 'Timer', NULL)