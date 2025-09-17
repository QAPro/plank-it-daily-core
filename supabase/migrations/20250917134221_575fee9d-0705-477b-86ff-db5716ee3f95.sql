-- Fix Phase 2: Move non-plank exercises back to appropriate categories

-- Move wall sit exercises to strength category
UPDATE plank_exercises 
SET category = 'strength'
WHERE LOWER(name) LIKE '%wall sit%';

-- Move leg lift exercises to leg_lift category  
UPDATE plank_exercises 
SET category = 'leg_lift'
WHERE LOWER(name) LIKE '%leg lift%' AND LOWER(name) NOT LIKE '%plank%';

-- Move other non-plank exercises back to appropriate categories
UPDATE plank_exercises 
SET category = 'core'
WHERE name IN (
  'Double Leg Lifts',
  'Hanging Knee Raises', 
  'Leg Lift Holds',
  'Leg Lifts with Twist',
  'Single Leg Lift Holds'
) AND LOWER(name) NOT LIKE '%plank%';

-- Move lying exercises to leg_lift category
UPDATE plank_exercises 
SET category = 'leg_lift'
WHERE (LOWER(name) LIKE '%lying%' OR LOWER(name) LIKE '%side-lying%') 
  AND LOWER(name) NOT LIKE '%plank%';

-- Move standing exercises to appropriate category
UPDATE plank_exercises 
SET category = 'leg_lift' 
WHERE LOWER(name) LIKE 'standing leg lifts';

-- Move reverse leg lifts to leg_lift category
UPDATE plank_exercises 
SET category = 'leg_lift'
WHERE LOWER(name) LIKE '%reverse leg%';