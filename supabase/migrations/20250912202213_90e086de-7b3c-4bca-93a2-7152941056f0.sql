-- Phase 1: Create a temporary table to track what we want to keep
CREATE TEMP TABLE exercises_to_keep AS
-- Keep all 8 original exercises (from 2025-07-10)
SELECT id, name, 'original' as reason
FROM plank_exercises 
WHERE created_at::date = '2025-07-10'

UNION ALL

-- For duplicates, keep the best version of each exercise name
-- Priority: better category fit, then earliest created
SELECT DISTINCT ON (name) 
  id, 
  name,
  'best_duplicate' as reason
FROM plank_exercises 
WHERE created_at::date = '2025-09-12'
  AND name IN (
    -- These are the 76 exercises from the user's list
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
  )
ORDER BY name, 
  -- Prioritize by better category fit
  CASE 
    WHEN name LIKE '%Wall Sit%' AND category = 'wall_sit' THEN 1
    WHEN name LIKE '%Leg Lift%' AND category = 'leg_lift' THEN 1
    WHEN name LIKE '%Walking%' AND category = 'cardio' THEN 1
    WHEN name LIKE '%Standing%' AND category = 'standing_movement' THEN 1
    WHEN name LIKE '%Seated%' AND category = 'seated_exercise' THEN 1
    WHEN name LIKE '%Plank%' AND category = 'plank' THEN 1
    WHEN name LIKE '%Marching%' AND category = 'standing_movement' THEN 1
    ELSE 2
  END,
  created_at;

-- Phase 2: Update any user_sessions that reference exercises we're about to delete
-- Point them to the exercise we're keeping with the same name
UPDATE user_sessions 
SET exercise_id = (
  SELECT etk.id 
  FROM exercises_to_keep etk 
  JOIN plank_exercises pe ON etk.id = pe.id 
  WHERE pe.name = (
    SELECT name FROM plank_exercises WHERE id = user_sessions.exercise_id
  )
  LIMIT 1
)
WHERE exercise_id NOT IN (SELECT id FROM exercises_to_keep)
  AND exercise_id IN (
    SELECT id FROM plank_exercises 
    WHERE name IN (
      SELECT pe2.name FROM plank_exercises pe2 
      JOIN exercises_to_keep etk2 ON pe2.name = (
        SELECT pe3.name FROM plank_exercises pe3 WHERE pe3.id = etk2.id
      )
    )
  );

-- Phase 3: Delete exercises that are not in our keep list
DELETE FROM plank_exercises 
WHERE id NOT IN (SELECT id FROM exercises_to_keep);

-- Phase 4: Verification - this should show exactly 84 exercises
-- (This is just for logging, the actual count will be verified after migration)