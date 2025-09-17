-- Phase 1: Remove duplicate/redundant exercises
DELETE FROM plank_exercises WHERE id IN (
  '64ee8fa7-d171-45b1-850b-0b8aa6bd5a26', -- Standard Plank (duplicate of Forearm Plank)
  '525fb20d-5309-44c9-a3ab-d5399c8af5be', -- Push-Up Hold (duplicate of High Plank)
  '397e6a0f-68fb-40b7-a70c-f301bd99a44c'  -- Duplicate Side Plank Leg Lifts
);

-- Phase 2: Standardize all plank exercises to "planking" category
UPDATE plank_exercises 
SET category = 'planking'
WHERE category IN ('expanded_plank', 'leg_lift', 'strength', 'core');

-- Phase 3: Add missing exercises
INSERT INTO plank_exercises (name, category, difficulty_level, instructions, primary_muscles, equipment_needed, estimated_calories_per_minute, is_beginner_friendly, tags) VALUES 
('Bear Crawl Hold', 'planking', 4, ARRAY['Start in a tabletop position with hands under shoulders and knees under hips.', 'Lift knees 1-2 inches off the ground.', 'Keep your back flat and core engaged.', 'Hold this position maintaining the hover.', 'Breathe steadily throughout the hold.'], ARRAY['Core', 'Shoulders', 'Glutes'], ARRAY['None'], 8.5, false, ARRAY['strength', 'stability', 'full-body']),
('Reverse Plank', 'planking', 3, ARRAY['Sit with legs extended and hands placed behind you.', 'Press into your hands to lift your hips up.', 'Create a straight line from head to heels.', 'Keep your chest open and shoulders over wrists.', 'Look up toward the ceiling while breathing steadily.'], ARRAY['Core', 'Glutes', 'Shoulders'], ARRAY['None'], 6.0, false, ARRAY['strength', 'posterior-chain', 'flexibility']);

-- Phase 4: Enhance existing exercises with professional metadata and instructions
UPDATE plank_exercises SET
  instructions = ARRAY['Place forearms on the ground with elbows under shoulders.', 'Extend legs behind you, balancing on toes.', 'Create a straight line from head to heels.', 'Keep your neck neutral by looking down.', 'Hold while breathing steadily, avoiding sagging.'],
  primary_muscles = ARRAY['Core', 'Shoulders'],
  equipment_needed = ARRAY['None'],
  estimated_calories_per_minute = 4.5,
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'core', 'stability', 'beginner-friendly']
WHERE name = 'Forearm Plank';

UPDATE plank_exercises SET
  instructions = ARRAY['Start in a push-up position with hands under shoulders.', 'Keep your body in a straight line from head to heels.', 'Engage your core and avoid letting hips sag.', 'Keep legs straight and weight evenly distributed.', 'Maintain neutral neck position looking ahead.'],
  primary_muscles = ARRAY['Core', 'Shoulders', 'Arms'],
  equipment_needed = ARRAY['None'],
  estimated_calories_per_minute = 5.5,
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'core', 'upper-body', 'beginner-friendly']
WHERE name = 'High Plank';

UPDATE plank_exercises SET
  instructions = ARRAY['Lie on your right side, prop up on right forearm.', 'Stack your left foot on top of your right foot.', 'Lift your hips to create a straight line.', 'Keep your core engaged and avoid hip dropping.', 'Hold the position while breathing steadily.'],
  primary_muscles = ARRAY['Core', 'Obliques'],
  equipment_needed = ARRAY['None'],
  estimated_calories_per_minute = 5.0,
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'core', 'lateral', 'beginner-friendly']
WHERE name = 'Side Plank';

UPDATE plank_exercises SET
  instructions = ARRAY['Start in a forearm plank position.', 'Slowly rock your body forward past your elbows.', 'Rock back to starting position.', 'Keep your core tight throughout the movement.', 'Focus on controlled, deliberate movements.'],
  primary_muscles = ARRAY['Core', 'Shoulders'],
  equipment_needed = ARRAY['None'],
  estimated_calories_per_minute = 6.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'dynamic', 'stability']
WHERE name = 'Plank Rocks';

UPDATE plank_exercises SET
  instructions = ARRAY['Start in a high plank position.', 'Bring right knee toward right elbow, return to plank.', 'Bring left knee toward left elbow, return to plank.', 'Continue alternating sides in controlled manner.', 'Keep core engaged and minimize hip movement.'],
  primary_muscles = ARRAY['Core', 'Shoulders'],
  equipment_needed = ARRAY['None'],
  estimated_calories_per_minute = 8.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'dynamic', 'cardio'],
  difficulty_level = 4
WHERE name = 'Mountain Climbers';

UPDATE plank_exercises SET
  instructions = ARRAY['Start in a high plank position.', 'Lower down to right forearm, then left forearm.', 'Push back up to right hand, then left hand.', 'Continue this sequence, leading with same arm.', 'Keep core engaged and minimize hip rotation.'],
  primary_muscles = ARRAY['Core', 'Shoulders', 'Arms'],
  equipment_needed = ARRAY['None'],
  estimated_calories_per_minute = 9.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'dynamic', 'upper-body'],
  difficulty_level = 5
WHERE name = 'Plank Up-Downs';

-- Update remaining exercises with enhanced metadata
UPDATE plank_exercises SET
  estimated_calories_per_minute = 7.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'dynamic', 'coordination']
WHERE name = 'Plank Jacks';

UPDATE plank_exercises SET
  estimated_calories_per_minute = 6.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'unilateral', 'stability']
WHERE name = 'Single-Leg Plank';

UPDATE plank_exercises SET
  estimated_calories_per_minute = 8.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'dynamic', 'full-body']
WHERE name = 'Plank to Downward Dog';

UPDATE plank_exercises SET
  estimated_calories_per_minute = 9.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'shoulders', 'dynamic'],
  difficulty_level = 5
WHERE name = 'Plank Walkouts';

UPDATE plank_exercises SET
  estimated_calories_per_minute = 10.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'plyometric', 'explosive'],
  difficulty_level = 5
WHERE name = 'Plank Jump-Ins';

UPDATE plank_exercises SET
  estimated_calories_per_minute = 7.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'shoulders', 'stability'],
  difficulty_level = 4
WHERE name = 'Plank Shoulder Taps';

UPDATE plank_exercises SET
  estimated_calories_per_minute = 6.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'lateral', 'unilateral'],
  difficulty_level = 4
WHERE name = 'Side Plank Rotations';