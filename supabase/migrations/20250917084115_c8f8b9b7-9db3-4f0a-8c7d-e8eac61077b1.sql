-- Enhanced Seated Exercises: Update all 12 seated exercises with comprehensive metadata

-- Update Seated Ankle Circles
UPDATE plank_exercises 
SET 
  instructions = ARRAY[
    'Sit tall in chair with feet flat on floor',
    'Lift one foot slightly off ground', 
    'Make slow, controlled circles with ankle',
    'Perform 8-10 circles in each direction',
    'Switch feet and repeat'
  ],
  estimated_calories_per_minute = 1.5,
  primary_muscles = ARRAY['ankles', 'calves'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'mobility', 'seated', 'beginner', 'ankle'],
  category = 'flexibility'
WHERE name = 'Seated Ankle Circles';

-- Update Seated Arm Raises  
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Sit with back straight and feet flat on floor',
    'Start with arms at sides',
    'Raise arms forward, to sides, or overhead', 
    'Lower slowly with control',
    'Perform 10-15 repetitions per direction'
  ],
  estimated_calories_per_minute = 2.0,
  primary_muscles = ARRAY['shoulders', 'arms'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'shoulders', 'seated', 'beginner', 'mobility']
WHERE name = 'Seated Arm Raises';

-- Update Seated Shoulder Rolls
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Sit tall with shoulders relaxed',
    'Roll shoulders up, back, and down in circular motion',
    'Keep movement slow and controlled',
    'Perform 8-10 rolls forward, then backward', 
    'Focus on full range of motion'
  ],
  estimated_calories_per_minute = 1.5,
  primary_muscles = ARRAY['shoulders'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'mobility', 'seated', 'beginner', 'shoulders']
WHERE name = 'Seated Shoulder Rolls';

-- Update Seated Marching
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Sit tall with feet flat on floor',
    'Lift one knee up toward chest',
    'Lower foot back to floor, then lift other knee',
    'Keep core engaged and back straight',
    'Perform 10-20 alternating lifts'
  ],
  estimated_calories_per_minute = 3.0,
  primary_muscles = ARRAY['core', 'hip flexors'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = true,
  tags = ARRAY['cardio', 'core', 'seated', 'beginner', 'hip-flexors']
WHERE name = 'Seated Marching';

-- Update Seated Knee-to-Chest
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Sit tall with hands on sides of chair',
    'Pull one knee up toward chest',
    'Use hands to gently assist the stretch',
    'Hold briefly, then lower with control',
    'Perform 8-12 reps per leg'
  ],
  estimated_calories_per_minute = 3.5,
  primary_muscles = ARRAY['core', 'hip flexors'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'flexibility', 'seated', 'hip-flexors', 'core']
WHERE name = 'Seated Knee-to-Chest';

-- Update Seated Leg Extensions
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Sit tall with back against chair',
    'Extend one leg straight out in front',
    'Hold briefly at top, then lower slowly',
    'Keep thigh pressed against chair seat',
    'Perform 10-15 reps per leg'
  ],
  estimated_calories_per_minute = 4.0,
  primary_muscles = ARRAY['quadriceps', 'core'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'legs', 'seated', 'quadriceps']
WHERE name = 'Seated Leg Extensions';

-- Update Seated Punches
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Sit with feet flat and core engaged',
    'Make fists and punch forward alternately',
    'Keep shoulders back and core tight',
    'Add speed for increased intensity',
    'Perform 20-30 alternating punches'
  ],
  estimated_calories_per_minute = 5.0,
  primary_muscles = ARRAY['arms', 'shoulders', 'core'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = true,
  tags = ARRAY['cardio', 'boxing', 'seated', 'arms', 'shoulders']
WHERE name = 'Seated Punches';

-- Update Seated Torso Twists
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Sit tall with arms crossed over chest',
    'Rotate upper body left and right',
    'Keep hips facing forward',
    'Move slowly with control',
    'Perform 10-15 twists per side'
  ],
  estimated_calories_per_minute = 3.5,
  primary_muscles = ARRAY['core', 'obliques'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'core', 'seated', 'obliques', 'rotation']
WHERE name = 'Seated Torso Twists';

-- Update Seated Leg Lift Holds
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Sit tall with hands gripping sides of chair',
    'Lift one or both legs straight out',
    'Hold position without letting legs drop',
    'Keep core engaged and back straight',
    'Build up to 20-45 second holds'
  ],
  estimated_calories_per_minute = 5.5,
  primary_muscles = ARRAY['core', 'quadriceps', 'hip flexors'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'seated', 'isometric', 'legs']
WHERE name = 'Seated Leg Lift Holds';

-- Update Seated Balance Challenges
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Sit on edge of chair without back support',
    'Perform various movements while maintaining balance',
    'Lift arms, legs, or combine movements',
    'Focus on core stability throughout',
    'Progress to more complex combinations'
  ],
  estimated_calories_per_minute = 6.0,
  primary_muscles = ARRAY['core', 'stabilizers'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'balance', 'seated', 'core', 'stability']
WHERE name = 'Seated Balance Challenges';

-- Update Seated Russian Twists
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Sit on edge of chair, lean back slightly',
    'Lift feet off ground if possible',
    'Rotate torso side to side with arms extended',
    'Keep core engaged and chest up',
    'Perform 15-25 controlled twists per side'
  ],
  estimated_calories_per_minute = 7.0,
  primary_muscles = ARRAY['core', 'obliques'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'core', 'seated', 'obliques', 'advanced', 'rotation']
WHERE name = 'Seated Russian Twists';

-- Update Seated Dynamic Movements  
UPDATE plank_exercises
SET
  instructions = ARRAY[
    'Combine multiple seated exercises in sequence',
    'Flow between arm raises, leg lifts, and twists',
    'Maintain proper form throughout transitions',
    'Requires coordination and core strength',
    'Perform 45-90 second flowing sequences'
  ],
  estimated_calories_per_minute = 8.0,
  primary_muscles = ARRAY['core', 'arms', 'legs'],
  equipment_needed = ARRAY['chair'],
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'cardio', 'seated', 'dynamic', 'flow', 'coordination']
WHERE name = 'Seated Dynamic Movements';