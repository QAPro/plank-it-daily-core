-- Update all 'core' exercises to 'leg_lift' category since they're all leg lift variations
UPDATE plank_exercises 
SET category = 'leg_lift' 
WHERE category = 'core';

-- Update exercise families table to reflect new structure
UPDATE exercise_families 
SET family_key = 'basic_leg_lifts',
    family_name = 'Basic Leg Lifts',
    description = 'Foundational leg lift exercises for beginners to intermediate level'
WHERE family_key = 'core';

UPDATE exercise_families 
SET family_key = 'advanced_leg_lifts',
    family_name = 'Advanced Leg Lifts', 
    description = 'Advanced leg lift variations for experienced practitioners'
WHERE family_key = 'leg_lift';

-- Update the get_exercise_family function to handle new leg lift split logic
CREATE OR REPLACE FUNCTION public.get_exercise_family(exercise_category text, difficulty_level integer)
 RETURNS text
 LANGUAGE sql
 IMMUTABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT CASE 
    WHEN exercise_category = 'planking' AND difficulty_level <= 2 THEN 'basic_planking'
    WHEN exercise_category = 'planking' AND difficulty_level >= 3 THEN 'advanced_planking'
    WHEN exercise_category = 'leg_lift' AND difficulty_level <= 2 THEN 'basic_leg_lifts'
    WHEN exercise_category = 'leg_lift' AND difficulty_level >= 3 THEN 'advanced_leg_lifts'
    WHEN exercise_category = 'seated_exercise' THEN 'seated_exercise'
    WHEN exercise_category = 'standing_movement' THEN 'standing_movement'
    WHEN exercise_category IN ('cardio', 'strength') THEN 'cardio_strength'
    ELSE exercise_category
  END;
$function$