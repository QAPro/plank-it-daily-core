-- Populate unlock_criteria JSONB for all achievements
-- This migration converts human-readable criteria text into structured JSONB for the achievement checker

-- ============================================
-- SESSION COUNT ACHIEVEMENTS (type: "count")
-- ============================================

-- Pattern: "Complete 1 session" (ACH_001)
UPDATE achievements SET unlock_criteria = '{"type": "count", "value": 1}'::jsonb
WHERE criteria = 'Complete 1 session' AND unlock_criteria IS NULL;

-- Pattern: "Complete 5 sessions" (ACH_003)
UPDATE achievements SET unlock_criteria = '{"type": "count", "value": 5}'::jsonb
WHERE criteria = 'Complete 5 sessions' AND unlock_criteria IS NULL;

-- Pattern: "Complete 10 sessions" (ACH_004)
UPDATE achievements SET unlock_criteria = '{"type": "count", "value": 10}'::jsonb
WHERE criteria = 'Complete 10 sessions' AND unlock_criteria IS NULL;

-- Pattern: "Complete 25 sessions" (ACH_005)
UPDATE achievements SET unlock_criteria = '{"type": "count", "value": 25}'::jsonb
WHERE criteria = 'Complete 25 sessions' AND unlock_criteria IS NULL;

-- Pattern: "Complete 50 sessions" (ACH_006)
UPDATE achievements SET unlock_criteria = '{"type": "count", "value": 50}'::jsonb
WHERE criteria = 'Complete 50 sessions' AND unlock_criteria IS NULL;

-- Pattern: "Complete 100 sessions" (ACH_007)
UPDATE achievements SET unlock_criteria = '{"type": "count", "value": 100}'::jsonb
WHERE criteria = 'Complete 100 sessions' AND unlock_criteria IS NULL;

-- Pattern: "Complete 250 sessions"
UPDATE achievements SET unlock_criteria = '{"type": "count", "value": 250}'::jsonb
WHERE criteria = 'Complete 250 sessions' AND unlock_criteria IS NULL;

-- Pattern: "Complete 500 sessions"
UPDATE achievements SET unlock_criteria = '{"type": "count", "value": 500}'::jsonb
WHERE criteria = 'Complete 500 sessions' AND unlock_criteria IS NULL;

-- Pattern: "Complete 1000 sessions"
UPDATE achievements SET unlock_criteria = '{"type": "count", "value": 1000}'::jsonb
WHERE criteria = 'Complete 1000 sessions' AND unlock_criteria IS NULL;

-- ============================================
-- STREAK ACHIEVEMENTS (type: "streak")
-- ============================================

-- Pattern: "3-day streak" (ACH_002)
UPDATE achievements SET unlock_criteria = '{"type": "streak", "value": 3}'::jsonb
WHERE criteria = '3-day streak' AND unlock_criteria IS NULL;

-- Pattern: "7-day streak"
UPDATE achievements SET unlock_criteria = '{"type": "streak", "value": 7}'::jsonb
WHERE criteria = '7-day streak' AND unlock_criteria IS NULL;

-- Pattern: "14-day streak"
UPDATE achievements SET unlock_criteria = '{"type": "streak", "value": 14}'::jsonb
WHERE criteria = '14-day streak' AND unlock_criteria IS NULL;

-- Pattern: "30-day streak"
UPDATE achievements SET unlock_criteria = '{"type": "streak", "value": 30}'::jsonb
WHERE criteria = '30-day streak' AND unlock_criteria IS NULL;

-- Pattern: "60-day streak"
UPDATE achievements SET unlock_criteria = '{"type": "streak", "value": 60}'::jsonb
WHERE criteria = '60-day streak' AND unlock_criteria IS NULL;

-- Pattern: "90-day streak"
UPDATE achievements SET unlock_criteria = '{"type": "streak", "value": 90}'::jsonb
WHERE criteria = '90-day streak' AND unlock_criteria IS NULL;

-- Pattern: "100-day streak"
UPDATE achievements SET unlock_criteria = '{"type": "streak", "value": 100}'::jsonb
WHERE criteria = '100-day streak' AND unlock_criteria IS NULL;

-- Pattern: "180-day streak"
UPDATE achievements SET unlock_criteria = '{"type": "streak", "value": 180}'::jsonb
WHERE criteria = '180-day streak' AND unlock_criteria IS NULL;

-- Pattern: "365-day streak"
UPDATE achievements SET unlock_criteria = '{"type": "streak", "value": 365}'::jsonb
WHERE criteria = '365-day streak' AND unlock_criteria IS NULL;

-- ============================================
-- DURATION ACHIEVEMENTS (type: "duration")
-- ============================================

-- Pattern: "Complete session <= 60 seconds" (ACH_008)
UPDATE achievements SET unlock_criteria = '{"type": "duration", "value": 60}'::jsonb
WHERE criteria = 'Complete session <= 60 seconds' AND unlock_criteria IS NULL;

-- Pattern: "Complete session >= 300 seconds" (ACH_009)
UPDATE achievements SET unlock_criteria = '{"type": "duration", "value": 300, "min": true}'::jsonb
WHERE criteria = 'Complete session >= 300 seconds' AND unlock_criteria IS NULL;

-- Pattern: "Complete session >= 600 seconds"
UPDATE achievements SET unlock_criteria = '{"type": "duration", "value": 600, "min": true}'::jsonb
WHERE criteria = 'Complete session >= 600 seconds' AND unlock_criteria IS NULL;

-- ============================================
-- SESSION DURATION (Total Time Spent)
-- ============================================

-- Pattern: "Total session time >= X minutes"
UPDATE achievements SET unlock_criteria = '{"type": "session_duration", "value": 60}'::jsonb
WHERE criteria = 'Total session time >= 60 minutes' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "session_duration", "value": 300}'::jsonb
WHERE criteria = 'Total session time >= 300 minutes' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "session_duration", "value": 1000}'::jsonb
WHERE criteria = 'Total session time >= 1000 minutes' AND unlock_criteria IS NULL;

-- ============================================
-- TIME-BASED ACHIEVEMENTS (type: "time_based")
-- ============================================

-- Pattern: "Complete session at 5-7 AM" (ACH_010)
UPDATE achievements SET unlock_criteria = '{"type": "time_based", "time_of_day": "early_morning"}'::jsonb
WHERE criteria = 'Complete session at 5-7 AM' AND unlock_criteria IS NULL;

-- Pattern: "Complete session at 6-9 PM" (ACH_011)
UPDATE achievements SET unlock_criteria = '{"type": "time_based", "time_of_day": "evening"}'::jsonb
WHERE criteria = 'Complete session at 6-9 PM' AND unlock_criteria IS NULL;

-- Pattern: "Complete session at 10 PM-1 AM"
UPDATE achievements SET unlock_criteria = '{"type": "time_based", "time_of_day": "night"}'::jsonb
WHERE criteria = 'Complete session at 10 PM-1 AM' AND unlock_criteria IS NULL;

-- ============================================
-- CATEGORY-SPECIFIC ACHIEVEMENTS
-- ============================================

-- Core & Balance achievements
UPDATE achievements SET unlock_criteria = jsonb_build_object(
  'type', 'category_specific',
  'value', CASE 
    WHEN criteria LIKE '%1 %' THEN 1
    WHEN criteria LIKE '%5 %' THEN 5
    WHEN criteria LIKE '%10 %' THEN 10
    WHEN criteria LIKE '%25 %' THEN 25
    WHEN criteria LIKE '%50 %' THEN 50
    ELSE 1
  END,
  'category', 'Core & Balance'
)
WHERE 'Core & Balance' = ANY(related_exercise_categories) 
  AND unlock_criteria IS NULL
  AND criteria LIKE 'Complete % session%';

-- Cardio & Walking achievements
UPDATE achievements SET unlock_criteria = jsonb_build_object(
  'type', 'category_specific',
  'value', CASE 
    WHEN criteria LIKE '%1 %' THEN 1
    WHEN criteria LIKE '%5 %' THEN 5
    WHEN criteria LIKE '%10 %' THEN 10
    WHEN criteria LIKE '%25 %' THEN 25
    WHEN criteria LIKE '%50 %' THEN 50
    ELSE 1
  END,
  'category', 'Cardio & Walking'
)
WHERE 'Cardio & Walking' = ANY(related_exercise_categories) 
  AND unlock_criteria IS NULL
  AND criteria LIKE 'Complete % session%';

-- Strength & Power achievements
UPDATE achievements SET unlock_criteria = jsonb_build_object(
  'type', 'category_specific',
  'value', CASE 
    WHEN criteria LIKE '%1 %' THEN 1
    WHEN criteria LIKE '%5 %' THEN 5
    WHEN criteria LIKE '%10 %' THEN 10
    WHEN criteria LIKE '%25 %' THEN 25
    WHEN criteria LIKE '%50 %' THEN 50
    ELSE 1
  END,
  'category', 'Strength & Power'
)
WHERE 'Strength & Power' = ANY(related_exercise_categories) 
  AND unlock_criteria IS NULL
  AND criteria LIKE 'Complete % session%';

-- Flexibility & Mobility achievements
UPDATE achievements SET unlock_criteria = jsonb_build_object(
  'type', 'category_specific',
  'value', CASE 
    WHEN criteria LIKE '%1 %' THEN 1
    WHEN criteria LIKE '%5 %' THEN 5
    WHEN criteria LIKE '%10 %' THEN 10
    WHEN criteria LIKE '%25 %' THEN 25
    WHEN criteria LIKE '%50 %' THEN 50
    ELSE 1
  END,
  'category', 'Flexibility & Mobility'
)
WHERE 'Flexibility & Mobility' = ANY(related_exercise_categories) 
  AND unlock_criteria IS NULL
  AND criteria LIKE 'Complete % session%';

-- Mind & Breath achievements
UPDATE achievements SET unlock_criteria = jsonb_build_object(
  'type', 'category_specific',
  'value', CASE 
    WHEN criteria LIKE '%1 %' THEN 1
    WHEN criteria LIKE '%5 %' THEN 5
    WHEN criteria LIKE '%10 %' THEN 10
    WHEN criteria LIKE '%25 %' THEN 25
    WHEN criteria LIKE '%50 %' THEN 50
    ELSE 1
  END,
  'category', 'Mind & Breath'
)
WHERE 'Mind & Breath' = ANY(related_exercise_categories) 
  AND unlock_criteria IS NULL
  AND criteria LIKE 'Complete % session%';

-- ============================================
-- VARIETY ACHIEVEMENTS (type: "variety")
-- ============================================

-- Pattern: "Complete 3 different exercises in 7 days"
UPDATE achievements SET unlock_criteria = '{"type": "variety", "value": 3, "within_days": 7}'::jsonb
WHERE criteria = 'Complete 3 different exercises in 7 days' AND unlock_criteria IS NULL;

-- Pattern: "Complete 5 different exercises in 7 days"
UPDATE achievements SET unlock_criteria = '{"type": "variety", "value": 5, "within_days": 7}'::jsonb
WHERE criteria = 'Complete 5 different exercises in 7 days' AND unlock_criteria IS NULL;

-- Pattern: "Complete 10 different exercises in 30 days"
UPDATE achievements SET unlock_criteria = '{"type": "variety", "value": 10, "within_days": 30}'::jsonb
WHERE criteria = 'Complete 10 different exercises in 30 days' AND unlock_criteria IS NULL;

-- ============================================
-- IMPROVEMENT ACHIEVEMENTS (type: "improvement")
-- ============================================

-- Pattern: "Achieve personal best in any exercise"
UPDATE achievements SET unlock_criteria = '{"type": "improvement", "value": 1}'::jsonb
WHERE criteria = 'Achieve personal best in any exercise' AND unlock_criteria IS NULL;

-- Pattern: "Achieve 5 personal bests"
UPDATE achievements SET unlock_criteria = '{"type": "improvement", "value": 5}'::jsonb
WHERE criteria = 'Achieve 5 personal bests' AND unlock_criteria IS NULL;

-- Pattern: "Achieve 10 personal bests"
UPDATE achievements SET unlock_criteria = '{"type": "improvement", "value": 10}'::jsonb
WHERE criteria = 'Achieve 10 personal bests' AND unlock_criteria IS NULL;

-- ============================================
-- CONSECUTIVE ACHIEVEMENTS
-- ============================================

-- Pattern: "Complete sessions on consecutive days"
UPDATE achievements SET unlock_criteria = '{"type": "consecutive_daily_sessions", "value": 2}'::jsonb
WHERE criteria = 'Complete sessions on 2 consecutive days' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "consecutive_daily_sessions", "value": 5}'::jsonb
WHERE criteria = 'Complete sessions on 5 consecutive days' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "consecutive_daily_sessions", "value": 10}'::jsonb
WHERE criteria = 'Complete sessions on 10 consecutive days' AND unlock_criteria IS NULL;

-- ============================================
-- DIFFICULTY LEVEL ACHIEVEMENTS
-- ============================================

-- Pattern: "Complete X difficulty level 1 exercises"
UPDATE achievements SET unlock_criteria = '{"type": "difficulty_level", "value": 10, "difficulty": 1}'::jsonb
WHERE criteria = 'Complete 10 difficulty level 1 exercises' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "difficulty_level", "value": 25, "difficulty": 1}'::jsonb
WHERE criteria = 'Complete 25 difficulty level 1 exercises' AND unlock_criteria IS NULL;

-- Pattern: "Complete X difficulty level 2 exercises"
UPDATE achievements SET unlock_criteria = '{"type": "difficulty_level", "value": 10, "difficulty": 2}'::jsonb
WHERE criteria = 'Complete 10 difficulty level 2 exercises' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "difficulty_level", "value": 25, "difficulty": 2}'::jsonb
WHERE criteria = 'Complete 25 difficulty level 2 exercises' AND unlock_criteria IS NULL;

-- Pattern: "Complete X difficulty level 3 exercises"
UPDATE achievements SET unlock_criteria = '{"type": "difficulty_level", "value": 10, "difficulty": 3}'::jsonb
WHERE criteria = 'Complete 10 difficulty level 3 exercises' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "difficulty_level", "value": 25, "difficulty": 3}'::jsonb
WHERE criteria = 'Complete 25 difficulty level 3 exercises' AND unlock_criteria IS NULL;

-- ============================================
-- SEASONAL ACHIEVEMENTS
-- ============================================

-- Pattern: "Complete session in Spring"
UPDATE achievements SET unlock_criteria = '{"type": "seasonal_sessions", "season": "spring", "value": 1}'::jsonb
WHERE criteria = 'Complete session in Spring' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "seasonal_sessions", "season": "summer", "value": 1}'::jsonb
WHERE criteria = 'Complete session in Summer' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "seasonal_sessions", "season": "fall", "value": 1}'::jsonb
WHERE criteria = 'Complete session in Fall' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "seasonal_sessions", "season": "winter", "value": 1}'::jsonb
WHERE criteria = 'Complete session in Winter' AND unlock_criteria IS NULL;

-- ============================================
-- WEEK COMPLETION ACHIEVEMENTS
-- ============================================

-- Pattern: "Complete sessions every day for a week"
UPDATE achievements SET unlock_criteria = '{"type": "week_completion", "value": 7}'::jsonb
WHERE criteria = 'Complete sessions every day for a week' AND unlock_criteria IS NULL;

-- ============================================
-- MONTHLY ACHIEVEMENTS
-- ============================================

-- Pattern: "Complete 15 sessions in a month"
UPDATE achievements SET unlock_criteria = '{"type": "monthly_count", "value": 15}'::jsonb
WHERE criteria = 'Complete 15 sessions in a month' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "monthly_count", "value": 20}'::jsonb
WHERE criteria = 'Complete 20 sessions in a month' AND unlock_criteria IS NULL;

UPDATE achievements SET unlock_criteria = '{"type": "monthly_count", "value": 30}'::jsonb
WHERE criteria = 'Complete 30 sessions in a month' AND unlock_criteria IS NULL;

-- ============================================
-- SPECIAL/MANUAL ACHIEVEMENTS
-- ============================================

-- Achievements requiring manual logic or disabled features
UPDATE achievements SET unlock_criteria = '{"type": "special", "manual": true}'::jsonb
WHERE unlock_criteria IS NULL
  AND (
    criteria LIKE '%Share%'
    OR criteria LIKE '%friend%'
    OR criteria LIKE '%social%'
    OR criteria LIKE '%planned duration%'
    OR is_disabled = true
  );

-- ============================================
-- FALLBACK: Any remaining achievements
-- ============================================

-- Mark any remaining achievements as needing manual review
UPDATE achievements SET unlock_criteria = '{"type": "manual_review_required"}'::jsonb
WHERE unlock_criteria IS NULL;