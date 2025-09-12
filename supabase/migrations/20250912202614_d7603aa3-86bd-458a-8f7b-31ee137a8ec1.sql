-- Step 1: Get a count before cleanup
SELECT COUNT(*) as current_count FROM plank_exercises;

-- Step 2: Create a list of exercise names that have duplicates
CREATE TEMP TABLE duplicate_names AS
SELECT name, COUNT(*) as count
FROM plank_exercises 
GROUP BY name 
HAVING COUNT(*) > 1;

-- Step 3: For each duplicate name, keep only the first one (by creation order)
-- and delete the rest
DELETE FROM plank_exercises 
WHERE id IN (
  SELECT pe.id 
  FROM plank_exercises pe
  JOIN duplicate_names dn ON pe.name = dn.name
  WHERE pe.id != (
    SELECT pe2.id 
    FROM plank_exercises pe2 
    WHERE pe2.name = pe.name 
    ORDER BY pe2.created_at 
    LIMIT 1
  )
);

-- Step 4: Remove any exercises that are not in the original 8 + 76 list
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