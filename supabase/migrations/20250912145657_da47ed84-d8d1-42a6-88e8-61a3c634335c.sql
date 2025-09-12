-- Complete Exercise Database Migration: Add All Missing Exercises
-- Phase 1: Clean up duplicates and standardize categories

-- First, update any existing exercises to use proper categories
UPDATE plank_exercises 
SET category = 'expanded_plank'
WHERE category = 'core_strength';

-- Phase 2: Insert all missing exercises by family

-- 1. WALL SIT FAMILY (Complete 12 exercises)
INSERT INTO plank_exercises (name, description, instructions, difficulty_level, category, muscles_targeted, equipment_needed, tags)
VALUES 
-- Beginner Wall Sits
('Standard Wall Sit', 'Basic wall sit with back against wall', 'Stand with back against wall, slide down until thighs are parallel to floor. Hold position.', 1, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'beginner']),
('Wall Sit with Arms Crossed', 'Wall sit with arms crossed over chest', 'Perform standard wall sit with arms crossed over chest for added stability challenge.', 1, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'beginner']),
('Shallow Wall Sit (45-degree angle)', 'Easier wall sit at 45-degree angle', 'Stand against wall and slide down to 45-degree angle, less than full squat position.', 1, 'wall_sit', ARRAY['quadriceps', 'glutes'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'beginner']),
('Wall Sit with Feet Wide', 'Wall sit with wider stance', 'Perform wall sit with feet positioned wider than shoulder-width apart.', 1, 'wall_sit', ARRAY['quadriceps', 'glutes', 'adductors'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'beginner']),

-- Intermediate Wall Sits  
('Wall Sit with Heels Raised', 'Wall sit on toes for added difficulty', 'Perform wall sit while lifting heels off ground, balancing on toes.', 2, 'wall_sit', ARRAY['quadriceps', 'glutes', 'calves', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'intermediate']),
('Narrow Stance Wall Sit', 'Wall sit with feet close together', 'Perform wall sit with feet positioned close together for increased challenge.', 2, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'intermediate']),
('Wall Sit with Arm Raises', 'Wall sit while raising arms overhead', 'Hold wall sit position while alternating arm raises overhead.', 2, 'wall_sit', ARRAY['quadriceps', 'glutes', 'shoulders', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'intermediate']),
('Wall Sit with Calf Raises', 'Wall sit combined with calf raise movements', 'Hold wall sit while performing calf raises by lifting heels up and down.', 2, 'wall_sit', ARRAY['quadriceps', 'glutes', 'calves', 'core'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'intermediate']),

-- Advanced Wall Sits
('Single Leg Wall Sit', 'Wall sit on one leg', 'Perform wall sit while lifting one leg off ground, alternating legs.', 3, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core', 'hip_flexors'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced']),
('Wall Sit with Leg Extensions', 'Wall sit with alternating leg extensions', 'Hold wall sit while extending one leg straight out, alternating legs.', 3, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core', 'hip_flexors'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced']),
('Wall Sit Marching', 'Wall sit with marching motion', 'Hold wall sit while lifting knees in alternating marching motion.', 3, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core', 'hip_flexors'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced']),
('Wall Sit with Resistance Band', 'Wall sit using resistance band', 'Perform wall sit while using resistance band for upper body exercises.', 3, 'wall_sit', ARRAY['quadriceps', 'glutes', 'core', 'shoulders'], ARRAY['resistance_band'], ARRAY['strength', 'isometric', 'advanced']),

-- 2. LEG LIFT FAMILY (Complete 12 exercises)
-- Beginner Leg Lifts
('Bent Knee Leg Lifts (lying)', 'Lying leg lifts with bent knees', 'Lie on back, lift bent knees toward chest, lower slowly with control.', 1, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'core', 'beginner']),
('Alternating Leg Lifts (lying)', 'Lying alternating leg lifts', 'Lie on back, alternate lifting one leg at a time toward ceiling.', 1, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'core', 'beginner']),
('Side-Lying Leg Lifts', 'Leg lifts while lying on side', 'Lie on side, lift top leg up and down with control.', 1, 'leg_lift', ARRAY['abductors', 'glutes', 'core'], ARRAY[]::text[], ARRAY['strength', 'core', 'beginner']),
('Seated Leg Extensions', 'Leg extensions from seated position', 'Sit in chair, extend one leg straight out, hold, then lower. Alternate legs.', 1, 'leg_lift', ARRAY['quadriceps', 'hip_flexors'], ARRAY['chair'], ARRAY['strength', 'seated', 'beginner']),

-- Intermediate Leg Lifts
('Straight Leg Lifts (lying)', 'Lying leg lifts with straight legs', 'Lie on back, lift straight legs toward ceiling, lower slowly without touching ground.', 2, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'core', 'intermediate']),
('Double Leg Lifts', 'Both legs lifted together', 'Lie on back, lift both straight legs together toward ceiling, lower with control.', 2, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'core', 'intermediate']),
('Side Plank Leg Lifts', 'Leg lifts in side plank position', 'Hold side plank while lifting top leg up and down.', 2, 'leg_lift', ARRAY['abductors', 'glutes', 'core', 'obliques'], ARRAY[]::text[], ARRAY['strength', 'core', 'intermediate']),
('Standing Leg Lifts', 'Leg lifts from standing position', 'Stand tall, lift one leg to side or back, hold, then lower. Alternate legs.', 2, 'leg_lift', ARRAY['abductors', 'glutes', 'hip_flexors'], ARRAY[]::text[], ARRAY['strength', 'standing', 'intermediate']),

-- Advanced Leg Lifts
('Leg Lift Holds', 'Static leg lift holds', 'Lift legs and hold position for extended time before lowering.', 3, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced']),
('Hanging Knee Raises', 'Knee raises while hanging', 'Hang from bar, lift knees toward chest, lower with control.', 3, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals', 'forearms'], ARRAY['pull_up_bar'], ARRAY['strength', 'core', 'advanced']),
('Single Leg Lift Holds', 'Single leg static holds', 'Lift one leg and hold position, focusing on core stability.', 3, 'leg_lift', ARRAY['hip_flexors', 'core', 'abdominals'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced']),
('Leg Lifts with Twist', 'Leg lifts with rotational movement', 'Perform leg lifts while adding rotational twist to engage obliques.', 3, 'leg_lift', ARRAY['hip_flexors', 'core', 'obliques'], ARRAY[]::text[], ARRAY['strength', 'core', 'advanced']),

-- 3. WALKING/CARDIO FAMILY (Complete 12 exercises)
-- Beginner Cardio
('Slow Indoor Walking', 'Gentle walking pace indoors', 'Walk at comfortable pace indoors, focusing on steady rhythm and proper posture.', 1, 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'low_impact', 'beginner']),
('Seated Marching', 'Marching motion while seated', 'Sit tall, lift knees alternately in marching motion while seated.', 1, 'cardio', ARRAY['hip_flexors', 'core'], ARRAY['chair'], ARRAY['cardio', 'seated', 'beginner']),
('Standing Marching in Place', 'Marching without moving forward', 'Stand and march in place, lifting knees and swinging arms naturally.', 1, 'cardio', ARRAY['legs', 'core', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'standing', 'beginner']),
('Gentle Arm Swings While Walking', 'Walking with arm movements', 'Walk slowly while adding gentle arm swinging motions.', 1, 'cardio', ARRAY['legs', 'arms', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'low_impact', 'beginner']),

-- Intermediate Cardio
('Brisk Walking', 'Fast-paced walking', 'Walk at brisk pace, maintaining good posture and steady breathing.', 2, 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'moderate_impact', 'intermediate']),
('Walking with High Knees', 'Walking with exaggerated knee lifts', 'Walk while lifting knees higher than normal, engaging core.', 2, 'cardio', ARRAY['legs', 'hip_flexors', 'core'], ARRAY[]::text[], ARRAY['cardio', 'moderate_impact', 'intermediate']),
('Walking with Arm Circles', 'Walking combined with arm circles', 'Walk while performing forward and backward arm circles.', 2, 'cardio', ARRAY['legs', 'shoulders', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'moderate_impact', 'intermediate']),
('Stair Step-Ups', 'Stepping up and down stairs', 'Step up onto stair or platform, step down, repeat with alternating lead leg.', 2, 'cardio', ARRAY['legs', 'glutes', 'cardiovascular'], ARRAY['stairs'], ARRAY['cardio', 'moderate_impact', 'intermediate']),

-- Advanced Cardio
('Walking Lunges', 'Lunges while moving forward', 'Perform lunges while walking forward, alternating legs with each step.', 3, 'cardio', ARRAY['legs', 'glutes', 'core'], ARRAY[]::text[], ARRAY['cardio', 'strength', 'advanced']),
('Walking with Knee-to-Chest', 'Walking with high knee pulls', 'Walk while pulling knees to chest alternately, engaging core and hip flexors.', 3, 'cardio', ARRAY['legs', 'hip_flexors', 'core'], ARRAY[]::text[], ARRAY['cardio', 'moderate_impact', 'advanced']),
('Fast-Paced Marching', 'High-intensity marching in place', 'March in place at fast pace with high knee lifts and arm swings.', 3, 'cardio', ARRAY['legs', 'core', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'high_impact', 'advanced']),
('Walking with Resistance (backpack)', 'Walking with added weight', 'Walk with weighted backpack to increase intensity and resistance.', 3, 'cardio', ARRAY['legs', 'core', 'cardiovascular'], ARRAY['backpack', 'weights'], ARRAY['cardio', 'resistance', 'advanced']);

-- Continue with remaining families in next part due to character limit