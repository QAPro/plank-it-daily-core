-- Complete Exercise Database Migration: Add All Missing Exercises
-- Using correct column names from plank_exercises table

-- Phase 1: Clean up duplicates and standardize categories
UPDATE plank_exercises 
SET category = 'expanded_plank'
WHERE category = 'core_strength';

-- Phase 2: Insert all missing exercises by family

-- 1. WALL SIT FAMILY (Complete 12 exercises)
INSERT INTO plank_exercises (name, description, instructions, difficulty_level, category, primary_muscles, equipment_needed, tags, is_beginner_friendly, estimated_calories_per_minute)
VALUES 
-- Beginner Wall Sits
('Standard Wall Sit', 'Basic wall sit with back against wall', ARRAY['Stand with back against wall', 'Slide down until thighs are parallel to floor', 'Hold position with proper form'], 1, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'beginner'], true, 3.0),
('Wall Sit with Arms Crossed', 'Wall sit with arms crossed over chest', ARRAY['Perform standard wall sit', 'Cross arms over chest', 'Maintain position for stability challenge'], 1, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'beginner'], true, 3.2),
('Shallow Wall Sit (45-degree)', 'Easier wall sit at 45-degree angle', ARRAY['Stand against wall', 'Slide down to 45-degree angle', 'Less than full squat position'], 1, 'wall_sit', ARRAY['quadriceps', 'glutes'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'beginner'], true, 2.8),
('Wall Sit with Feet Wide', 'Wall sit with wider stance', ARRAY['Position feet wider than shoulder-width', 'Perform wall sit', 'Maintain wide stance throughout'], 1, 'wall_sit', ARRAY['quadriceps', 'glutes', 'adductors'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'beginner'], true, 3.1),

-- Intermediate Wall Sits  
('Wall Sit with Heels Raised', 'Wall sit on toes for added difficulty', ARRAY['Perform wall sit', 'Lift heels off ground', 'Balance on toes throughout hold'], 2, 'wall_sit', ARRAY['quadriceps', 'glutes', 'calves', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'intermediate'], false, 4.2),
('Narrow Stance Wall Sit', 'Wall sit with feet close together', ARRAY['Position feet close together', 'Perform wall sit', 'Maintain narrow stance for increased challenge'], 2, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'intermediate'], false, 3.8),
('Wall Sit with Arm Raises', 'Wall sit while raising arms overhead', ARRAY['Hold wall sit position', 'Alternate raising arms overhead', 'Maintain wall sit throughout'], 2, 'wall_sit', ARRAY['quadriceps', 'glutes', 'shoulders', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'intermediate'], false, 4.5),
('Wall Sit with Calf Raises', 'Wall sit combined with calf raise movements', ARRAY['Hold wall sit position', 'Perform calf raises by lifting heels', 'Lower heels and repeat'], 2, 'wall_sit', ARRAY['quadriceps', 'glutes', 'calves', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'intermediate'], false, 4.3),

-- Advanced Wall Sits
('Single Leg Wall Sit', 'Wall sit on one leg', ARRAY['Perform wall sit', 'Lift one leg off ground', 'Alternate legs periodically'], 3, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core', 'hip_flexors'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced'], false, 5.5),
('Wall Sit with Leg Extensions', 'Wall sit with alternating leg extensions', ARRAY['Hold wall sit position', 'Extend one leg straight out', 'Alternate legs while maintaining wall sit'], 3, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core', 'hip_flexors'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced'], false, 5.8),
('Wall Sit Marching', 'Wall sit with marching motion', ARRAY['Hold wall sit position', 'Lift knees in alternating marching motion', 'Keep core engaged throughout'], 3, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core', 'hip_flexors'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced'], false, 6.0),
('Wall Sit with Resistance Band', 'Wall sit using resistance band', ARRAY['Perform wall sit with resistance band', 'Use band for upper body exercises', 'Maintain wall sit throughout'], 3, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core', 'shoulders'], ARRAY['resistance_band'], ARRAY['strength', 'isometric', 'advanced'], false, 6.5),

-- 2. LEG LIFT FAMILY (Complete 12 exercises)
-- Beginner Leg Lifts
('Bent Knee Leg Lifts (lying)', 'Lying leg lifts with bent knees', ARRAY['Lie on back with knees bent', 'Lift knees toward chest', 'Lower slowly with control'], 1, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'core', 'beginner'], true, 2.5),
('Alternating Leg Lifts (lying)', 'Lying alternating leg lifts', ARRAY['Lie on back', 'Alternate lifting one leg at a time', 'Lift toward ceiling with control'], 1, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'core', 'beginner'], true, 2.8),
('Side-Lying Leg Lifts', 'Leg lifts while lying on side', ARRAY['Lie on side', 'Lift top leg up and down', 'Control the movement throughout'], 1, 'leg_lift', ARRAY['abductors', 'glutes', 'core'], ARRAY[]::text[], ARRAY['strength', 'core', 'beginner'], true, 2.3),
('Seated Leg Extensions', 'Leg extensions from seated position', ARRAY['Sit in chair with back straight', 'Extend one leg straight out', 'Hold then lower, alternate legs'], 1, 'leg_lift', ARRAY['quadriceps', 'hip_flexors'], ARRAY['chair'], ARRAY['strength', 'seated', 'beginner'], true, 2.0),

-- Intermediate Leg Lifts
('Straight Leg Lifts (lying)', 'Lying leg lifts with straight legs', ARRAY['Lie on back with legs straight', 'Lift legs toward ceiling', 'Lower slowly without touching ground'], 2, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'core', 'intermediate'], false, 3.5),
('Double Leg Lifts', 'Both legs lifted together', ARRAY['Lie on back', 'Lift both straight legs together', 'Lower with control'], 2, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'core', 'intermediate'], false, 4.0),
('Side Plank Leg Lifts', 'Leg lifts in side plank position', ARRAY['Hold side plank position', 'Lift top leg up and down', 'Maintain plank throughout'], 2, 'leg_lift', ARRAY['abductors', 'glutes', 'core', 'obliques'], ARRAY[]::text[], ARRAY['strength', 'core', 'intermediate'], false, 4.2),
('Standing Leg Lifts', 'Leg lifts from standing position', ARRAY['Stand tall with good posture', 'Lift one leg to side or back', 'Hold then lower, alternate legs'], 2, 'leg_lift', ARRAY['abductors', 'glutes', 'hip_flexors'], ARRAY[]::text[], ARRAY['strength', 'standing', 'intermediate'], false, 3.0),

-- Advanced Leg Lifts
('Leg Lift Holds', 'Static leg lift holds', ARRAY['Lift legs to target position', 'Hold position for extended time', 'Focus on core stability'], 3, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced'], false, 4.5),
('Hanging Knee Raises', 'Knee raises while hanging', ARRAY['Hang from pull-up bar', 'Lift knees toward chest', 'Lower with control'], 3, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals', 'forearms'], ARRAY['pull_up_bar'], ARRAY['strength', 'core', 'advanced'], false, 6.0),
('Single Leg Lift Holds', 'Single leg static holds', ARRAY['Lift one leg to target position', 'Hold position focusing on stability', 'Switch legs'], 3, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced'], false, 4.8),
('Leg Lifts with Twist', 'Leg lifts with rotational movement', ARRAY['Perform leg lifts', 'Add rotational twist', 'Engage obliques throughout'], 3, 'leg_lift', ARRAY['hip_flexors', 'core', 'obliques'], ARRAY[]::text[], ARRAY['strength', 'core', 'advanced'], false, 5.0);