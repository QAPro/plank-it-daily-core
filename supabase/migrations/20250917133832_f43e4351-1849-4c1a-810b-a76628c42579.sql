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

-- Phase 3: Add missing exercises from JSON
INSERT INTO plank_exercises (name, category, difficulty_level, target_duration_seconds, instructions, primary_muscles, secondary_muscles, equipment_needed, calorie_burn_per_minute, is_beginner_friendly, tags) VALUES 
('Bear Crawl Hold', 'planking', 4, 30, 'Start in a tabletop position with hands under shoulders and knees under hips. Lift knees 1-2 inches off the ground. Keep your back flat and core engaged. Hold this position maintaining the hover. Keep your weight evenly distributed between hands and toes. Breathe steadily throughout the hold.', ARRAY['Core', 'Shoulders', 'Glutes'], ARRAY['Arms', 'Legs'], ARRAY['None'], 8.5, false, ARRAY['strength', 'stability', 'full-body']),
('Reverse Plank', 'planking', 3, 30, 'Sit with legs extended and hands placed behind you, fingers pointing toward your feet. Press into your hands to lift your hips up, creating a straight line from head to heels. Keep your chest open and shoulders directly over your wrists. Engage your glutes and core to maintain the position. Look up toward the ceiling while breathing steadily.', ARRAY['Core', 'Glutes', 'Shoulders'], ARRAY['Hamstrings', 'Triceps'], ARRAY['None'], 6.0, false, ARRAY['strength', 'posterior-chain', 'flexibility']);

-- Phase 4: Enhance existing exercises with professional metadata and instructions
UPDATE plank_exercises SET
  instructions = 'Place forearms on the ground with elbows directly under shoulders. Extend legs behind you, balancing on toes. Create a straight line from head to heels, engaging your core muscles. Keep your neck neutral by looking down at the floor. Hold this position while breathing steadily, avoiding any sagging or hiking of hips.',
  primary_muscles = ARRAY['Core', 'Shoulders'],
  secondary_muscles = ARRAY['Glutes', 'Back'],
  equipment_needed = ARRAY['None'],
  calorie_burn_per_minute = 4.5,
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'core', 'stability', 'beginner-friendly']
WHERE name = 'Forearm Plank';

UPDATE plank_exercises SET
  instructions = 'Start in a push-up position with hands directly under shoulders. Keep your body in a straight line from head to heels. Engage your core and avoid letting your hips sag or pike up. Keep your legs straight and weight evenly distributed. Maintain neutral neck position by looking slightly ahead.',
  primary_muscles = ARRAY['Core', 'Shoulders', 'Arms'],
  secondary_muscles = ARRAY['Glutes', 'Back'],
  equipment_needed = ARRAY['None'],
  calorie_burn_per_minute = 5.5,
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'core', 'upper-body', 'beginner-friendly']
WHERE name = 'High Plank';

UPDATE plank_exercises SET
  instructions = 'Lie on your right side, then prop yourself up on your right forearm with elbow under shoulder. Stack your left foot on top of your right foot. Lift your hips to create a straight line from head to feet. Keep your core engaged and avoid letting hips drop. Hold the position while breathing steadily.',
  primary_muscles = ARRAY['Core', 'Obliques'],
  secondary_muscles = ARRAY['Shoulders', 'Glutes'],
  equipment_needed = ARRAY['None'],
  calorie_burn_per_minute = 5.0,
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'core', 'lateral', 'beginner-friendly']
WHERE name = 'Side Plank' AND id != '397e6a0f-68fb-40b7-a70c-f301bd99a44c';

UPDATE plank_exercises SET
  instructions = 'Start in a forearm plank position. Slowly rock your body forward, bringing your shoulders past your elbows. Rock back to starting position, then continue the controlled movement. Keep your core tight and maintain the plank line throughout. Focus on controlled, deliberate movements rather than speed.',
  primary_muscles = ARRAY['Core', 'Shoulders'],
  secondary_muscles = ARRAY['Arms', 'Back'],
  equipment_needed = ARRAY['None'],
  calorie_burn_per_minute = 6.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'dynamic', 'stability']
WHERE name = 'Plank Rocks';

UPDATE plank_exercises SET
  instructions = 'Start in a high plank position. Bring your right knee toward your right elbow, then return to plank. Bring your left knee toward your left elbow, then return to plank. Continue alternating sides in a controlled manner. Keep your core engaged and minimize hip movement during the knee drives.',
  primary_muscles = ARRAY['Core', 'Shoulders'],
  secondary_muscles = ARRAY['Hip Flexors', 'Glutes'],
  equipment_needed = ARRAY['None'],
  calorie_burn_per_minute = 8.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'dynamic', 'cardio'],
  difficulty_level = 4
WHERE name = 'Mountain Climbers';

UPDATE plank_exercises SET
  instructions = 'Start in a high plank position. Lower down to your right forearm, then your left forearm. Push back up to your right hand, then your left hand, returning to high plank. Continue this sequence, leading with the same arm for the set duration, then switch. Keep your core engaged and minimize hip rotation.',
  primary_muscles = ARRAY['Core', 'Shoulders', 'Arms'],
  secondary_muscles = ARRAY['Triceps', 'Chest'],
  equipment_needed = ARRAY['None'],
  calorie_burn_per_minute = 9.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'dynamic', 'upper-body'],
  difficulty_level = 5
WHERE name = 'Plank Up-Downs';

UPDATE plank_exercises SET
  instructions = 'Start in a forearm plank position. Lift your right arm straight out in front of you, parallel to the ground. Hold briefly, then return to plank. Lift your left arm straight out in front of you, hold briefly, then return. Continue alternating arms while maintaining plank position and minimizing hip movement.',
  primary_muscles = ARRAY['Core', 'Shoulders'],
  secondary_muscles = ARRAY['Back', 'Glutes'],
  equipment_needed = ARRAY['None'],
  calorie_burn_per_minute = 7.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'stability', 'unilateral'],
  difficulty_level = 4
WHERE name = 'Single-Arm Plank';

UPDATE plank_exercises SET
  instructions = 'Start in a side plank position on your right side. While maintaining the side plank, lift your top (left) leg up toward the ceiling. Lower it back down with control. Continue lifting and lowering while holding the side plank position. Keep your core engaged and avoid rolling forward or backward.',
  primary_muscles = ARRAY['Core', 'Obliques', 'Glutes'],
  secondary_muscles = ARRAY['Hip Abductors', 'Shoulders'],
  equipment_needed = ARRAY['None'],
  calorie_burn_per_minute = 6.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'glutes', 'lateral'],
  difficulty_level = 4
WHERE name = 'Side Plank Leg Lifts' AND id != '397e6a0f-68fb-40b7-a70c-f301bd99a44c';

-- Update remaining exercises with enhanced metadata
UPDATE plank_exercises SET
  calorie_burn_per_minute = 7.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'dynamic', 'coordination']
WHERE name = 'Plank Jacks';

UPDATE plank_exercises SET
  calorie_burn_per_minute = 6.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'unilateral', 'stability']
WHERE name = 'Single-Leg Plank';

UPDATE plank_exercises SET
  calorie_burn_per_minute = 8.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'dynamic', 'full-body']
WHERE name = 'Plank to Downward Dog';

UPDATE plank_exercises SET
  calorie_burn_per_minute = 9.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'shoulders', 'dynamic'],
  difficulty_level = 5
WHERE name = 'Plank Walkouts';

UPDATE plank_exercises SET
  calorie_burn_per_minute = 10.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'plyometric', 'explosive'],
  difficulty_level = 5
WHERE name = 'Plank Jump-Ins';

UPDATE plank_exercises SET
  calorie_burn_per_minute = 7.0,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'shoulders', 'stability'],
  difficulty_level = 4
WHERE name = 'Plank Shoulder Taps';

UPDATE plank_exercises SET
  calorie_burn_per_minute = 6.5,
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'lateral', 'unilateral'],
  difficulty_level = 4
WHERE name = 'Side Plank Rotations';