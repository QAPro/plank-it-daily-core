-- Database cleanup: Remove duplicates and fix categorization

-- Step 1: Remove the 5 true duplicate exercises
-- These are exercises with identical names that appear multiple times
DELETE FROM plank_exercises 
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY name ORDER BY created_at) as rn
    FROM plank_exercises
  ) t WHERE rn > 1
);

-- Step 2: Move "Seated Ankle Circles" from flexibility to seated_exercise category
UPDATE plank_exercises 
SET category = 'seated_exercise'
WHERE name = 'Seated Ankle Circles' AND category = 'flexibility';

-- Step 3: Create exercise families mapping table
CREATE TABLE IF NOT EXISTS exercise_families (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_name text NOT NULL,
  family_key text NOT NULL UNIQUE,
  display_order integer NOT NULL DEFAULT 0,
  description text,
  icon_name text,
  created_at timestamp with time zone DEFAULT now()
);

-- Insert the 7 exercise families
INSERT INTO exercise_families (family_name, family_key, display_order, description, icon_name) VALUES
('Basic Planking', 'basic_planking', 1, 'Foundational plank exercises for beginners', 'Activity'),
('Advanced Planking', 'advanced_planking', 2, 'Challenging plank variations for advanced practitioners', 'Zap'),
('Core Strength', 'core', 3, 'Core strengthening and stability exercises', 'Target'),
('Leg Lifts', 'leg_lift', 4, 'Leg lifting exercises for lower body strength', 'MoveUp'),
('Seated Movement', 'seated_exercise', 5, 'Exercise variations you can do while seated', 'Armchair'),
('Standing Movement', 'standing_movement', 6, 'Dynamic exercises performed while standing', 'User'),
('Cardio & Strength', 'cardio_strength', 7, 'High-intensity cardio and strength training', 'Heart');

-- Step 4: Create function to get exercise family for an exercise
CREATE OR REPLACE FUNCTION get_exercise_family(exercise_category text, difficulty_level integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE 
    WHEN exercise_category = 'planking' AND difficulty_level <= 2 THEN 'basic_planking'
    WHEN exercise_category = 'planking' AND difficulty_level >= 3 THEN 'advanced_planking'
    WHEN exercise_category = 'core' THEN 'core'
    WHEN exercise_category = 'leg_lift' THEN 'leg_lift'
    WHEN exercise_category = 'seated_exercise' THEN 'seated_exercise'
    WHEN exercise_category = 'standing_movement' THEN 'standing_movement'
    WHEN exercise_category IN ('cardio', 'strength') THEN 'cardio_strength'
    ELSE exercise_category
  END;
$$;