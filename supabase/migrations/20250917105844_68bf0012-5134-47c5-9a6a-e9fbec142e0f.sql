-- Update all 12 wall sit exercises with enhanced metadata

UPDATE plank_exercises 
SET 
  description = 'A beginner-friendly wall sit performed at a 45-degree angle to reduce intensity while building leg strength',
  difficulty_level = 1,
  instructions = ARRAY[
    'Stand with back against wall, feet shoulder-width apart',
    'Slide down wall to 45-degree angle (less than full squat)',
    'Keep knees behind toes and weight in heels',
    'Hold position while breathing normally',
    'Start with 15-30 seconds'
  ],
  estimated_calories_per_minute = 4.0,
  primary_muscles = ARRAY['quadriceps', 'glutes'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'legs', 'beginner', 'wall', 'isometric'],
  category = 'strength'
WHERE name = 'Shallow Wall Sit (45-degree angle)';

UPDATE plank_exercises 
SET 
  description = 'Basic wall sit with back against wall',
  difficulty_level = 1,
  instructions = ARRAY[
    'Stand with back flat against wall',
    'Slide down until thighs are parallel to floor',
    'Keep knees at 90-degree angle over ankles',
    'Distribute weight evenly on both feet',
    'Build up from 20-60 seconds'
  ],
  estimated_calories_per_minute = 5.0,
  primary_muscles = ARRAY['quadriceps', 'glutes'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'legs', 'beginner', 'wall', 'isometric'],
  category = 'strength'
WHERE name = 'Standard Wall Sit';

UPDATE plank_exercises 
SET 
  description = 'Wall sit with arms crossed over chest',
  difficulty_level = 1,
  instructions = ARRAY[
    'Assume standard wall sit position',
    'Cross arms over chest to remove arm support',
    'Keep back pressed firmly against wall',
    'Maintain proper leg positioning',
    'Focus on core engagement'
  ],
  estimated_calories_per_minute = 5.5,
  primary_muscles = ARRAY['quadriceps', 'glutes', 'core'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'legs', 'core', 'beginner', 'wall', 'isometric'],
  category = 'strength'
WHERE name = 'Wall Sit with Arms Crossed';

UPDATE plank_exercises 
SET 
  description = 'Wall sit with wider stance',
  difficulty_level = 1,
  instructions = ARRAY[
    'Set up in wall sit with feet wider than shoulder-width',
    'Maintain same depth and back position',
    'Wide stance provides more stability',
    'Keep knees tracking over toes',
    'Good option for those with hip mobility issues'
  ],
  estimated_calories_per_minute = 4.5,
  primary_muscles = ARRAY['quadriceps', 'glutes', 'inner thighs'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'legs', 'beginner', 'wall', 'wide-stance', 'isometric'],
  category = 'strength'
WHERE name = 'Wall Sit with Feet Wide';

UPDATE plank_exercises 
SET 
  description = 'Wall sit with feet close together',
  difficulty_level = 2,
  instructions = ARRAY[
    'Perform wall sit with feet close together',
    'Increases demand on leg muscles and balance',
    'Keep knees parallel and tracking forward',
    'Maintain same depth as standard wall sit',
    'More challenging for stability'
  ],
  estimated_calories_per_minute = 6.0,
  primary_muscles = ARRAY['quadriceps', 'glutes'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'legs', 'balance', 'wall', 'narrow-stance', 'isometric'],
  category = 'strength'
WHERE name = 'Narrow Stance Wall Sit';

UPDATE plank_exercises 
SET 
  description = 'Basic wall sit while lifting arms overhead alternately',
  difficulty_level = 2,
  instructions = ARRAY[
    'Start in standard wall sit position',
    'Alternately raise arms overhead while holding position',
    'Keep back pressed against wall throughout',
    'Control arm movements without losing leg position',
    'Adds coordination challenge'
  ],
  estimated_calories_per_minute = 6.5,
  primary_muscles = ARRAY['quadriceps', 'glutes', 'shoulders'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'legs', 'shoulders', 'coordination', 'wall', 'dynamic'],
  category = 'strength'
WHERE name = 'Wall Sit with Arm Raises';

UPDATE plank_exercises 
SET 
  description = 'Wall sit combined with calf raise movements',
  difficulty_level = 2,
  instructions = ARRAY[
    'Assume wall sit position',
    'Rise up onto balls of feet, then lower heels',
    'Maintain wall sit depth throughout calf movement',
    'Keep back against wall and core engaged',
    'Perform 8-15 calf raises while holding sit'
  ],
  estimated_calories_per_minute = 7.0,
  primary_muscles = ARRAY['quadriceps', 'glutes', 'calves'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = true,
  tags = ARRAY['strength', 'legs', 'calves', 'wall', 'compound', 'dynamic'],
  category = 'strength'
WHERE name = 'Wall Sit with Calf Raises';

UPDATE plank_exercises 
SET 
  description = 'Wall sit on toes for added difficulty',
  difficulty_level = 3,
  instructions = ARRAY[
    'Perform entire wall sit on balls of feet',
    'Increases calf and ankle stability demands',
    'Maintain proper wall sit form throughout',
    'Keep weight distributed evenly on both feet',
    'Significantly more challenging than standard version'
  ],
  estimated_calories_per_minute = 8.0,
  primary_muscles = ARRAY['quadriceps', 'glutes', 'calves'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'legs', 'calves', 'balance', 'wall', 'advanced', 'isometric'],
  category = 'strength'
WHERE name = 'Wall Sit with Heels Raised';

UPDATE plank_exercises 
SET 
  description = 'Wall sit with marching motion',
  difficulty_level = 3,
  instructions = ARRAY[
    'Start in standard wall sit position',
    'Lift one knee up toward chest, then lower',
    'Alternate legs in marching motion',
    'Keep back pressed against wall throughout',
    'Maintain wall sit depth while marching'
  ],
  estimated_calories_per_minute = 8.5,
  primary_muscles = ARRAY['quadriceps', 'glutes', 'hip flexors'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'legs', 'hip-flexors', 'balance', 'wall', 'dynamic'],
  category = 'strength'
WHERE name = 'Wall Sit Marching';

UPDATE plank_exercises 
SET 
  description = 'Wall sit with alternating leg extensions',
  difficulty_level = 3,
  instructions = ARRAY[
    'Begin in wall sit position',
    'Extend one leg straight out in front',
    'Hold briefly, then lower and switch legs',
    'Keep supporting leg in proper wall sit position',
    'Requires significant single-leg strength'
  ],
  estimated_calories_per_minute = 9.0,
  primary_muscles = ARRAY['quadriceps', 'glutes', 'core'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'legs', 'balance', 'unilateral', 'wall', 'advanced'],
  category = 'strength'
WHERE name = 'Wall Sit with Leg Extensions';

UPDATE plank_exercises 
SET 
  description = 'Wall sit position while lifting one leg straight out',
  difficulty_level = 4,
  instructions = ARRAY[
    'Start in standard wall sit position',
    'Lift one leg straight out in front and hold',
    'Maintain wall sit depth on supporting leg only',
    'Keep extended leg parallel to ground',
    'Extremely challenging for leg strength and balance'
  ],
  estimated_calories_per_minute = 10.0,
  primary_muscles = ARRAY['quadriceps', 'glutes', 'core'],
  equipment_needed = ARRAY['wall'],
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'legs', 'balance', 'unilateral', 'wall', 'expert', 'isometric'],
  category = 'strength'
WHERE name = 'Single Leg Wall Sit';

UPDATE plank_exercises 
SET 
  description = 'Wall sit using resistance band',
  difficulty_level = 4,
  instructions = ARRAY[
    'Place resistance band around thighs or ankles',
    'Perform wall sit while maintaining band tension',
    'Push knees out against band resistance',
    'Adds significant glute and hip stabilizer challenge',
    'Combine with other wall sit variations for increased difficulty'
  ],
  estimated_calories_per_minute = 9.5,
  primary_muscles = ARRAY['quadriceps', 'glutes', 'hip abductors'],
  equipment_needed = ARRAY['wall', 'resistance band'],
  is_beginner_friendly = false,
  tags = ARRAY['strength', 'legs', 'glutes', 'resistance', 'wall', 'expert', 'hip-abductors'],
  category = 'strength'
WHERE name = 'Wall Sit with Resistance Band';