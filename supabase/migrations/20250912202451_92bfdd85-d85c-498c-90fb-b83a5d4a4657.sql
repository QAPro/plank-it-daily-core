-- Simplified cleanup: Remove duplicates by keeping first occurrence of each name
-- First, update any user_sessions to point to exercises we're keeping
UPDATE user_sessions 
SET exercise_id = (
  SELECT MIN(id) 
  FROM plank_exercises 
  WHERE name = (
    SELECT name FROM plank_exercises WHERE id = user_sessions.exercise_id
  )
)
WHERE exercise_id IN (
  SELECT id FROM plank_exercises pe1
  WHERE EXISTS (
    SELECT 1 FROM plank_exercises pe2 
    WHERE pe2.name = pe1.name AND pe2.id < pe1.id
  )
);

-- Delete duplicate exercises (keep the one with lowest id for each name)
DELETE FROM plank_exercises 
WHERE id NOT IN (
  SELECT MIN(id) 
  FROM plank_exercises 
  GROUP BY name
);

-- Remove exercises not in the original 76 list (keep originals from 2025-07-10)
DELETE FROM plank_exercises 
WHERE created_at::date = '2025-09-12'
  AND name NOT IN (
    'Standard Wall Sit', 'Wall Sit with Arms Crossed', 'Shallow Wall Sit (45-degree angle)', 'Wall Sit with Feet Wide',
    'Wall Sit with Heels Raised', 'Narrow Stance Wall Sit', 'Wall Sit with Arm Raises', 'Wall Sit with Calf Raises',
    'Single Leg Wall Sit', 'Wall Sit with Leg Extensions', 'Wall Sit Marching', 'Wall Sit with Resistance Band',
    'Bent Knee Leg Lifts (lying)', 'Alternating Leg Lifts (lying)', 'Side-Lying Leg Lifts', 'Seated Leg Extensions',
    'Straight Leg Lifts (lying)', 'Double Leg Lifts', 'Side Plank Leg Lifts', 'Standing Leg Lifts',
    'Leg Lift Holds', 'Hanging Knee Raises', 'Single Leg Lift Holds', 'Leg Lifts with Twist',
    'Slow Indoor Walking', 'Seated Marching', 'Standing Marching in Place', 'Gentle Arm Swings While Walking',
    'Brisk Walking', 'Walking with High Knees', 'Walking with Arm Circles', 'Stair Step-Ups',
    'Walking Lunges', 'Walking with Knee-to-Chest', 'Fast-Paced Marching', 'Walking with Resistance (backpack)',
    'Calf Raises', 'Arm Circles', 'Gentle Marching in Place', 'Standing Side Bends',
    'Standing Knee Lifts', 'Standing Leg Swings', 'Standing Torso Twists', 'Standing Heel-to-Butt',
    'Single Leg Balance', 'Standing Figure-4 Stretch', 'Dynamic Standing Movements', 'Standing Balance with Eyes Closed',
    'Seated Arm Raises', 'Seated Ankle Circles', 'Seated Shoulder Rolls',
    'Seated Punches', 'Seated Torso Twists', 'Seated Knee-to-Chest',
    'Seated Balance Challenges', 'Seated Russian Twists', 'Seated Leg Lift Holds', 'Seated Dynamic Movements',
    'Wall Plank', 'Incline Plank (hands on couch/chair)', 'Knee Plank', 'Modified Side Plank (knees down)',
    'Standard Plank', 'Side Plank', 'Plank with Leg Lifts', 'Forearm Plank',
    'Single-Arm Plank', 'Plank with Arm Reaches', 'Plank Up-Downs', 'Push-Up Hold (top position)',
    'Single-Arm Single-Leg Plank', 'Push-Up Hold (bottom position)', 'Plank to Pike', 'Dynamic Plank Variations'
  );