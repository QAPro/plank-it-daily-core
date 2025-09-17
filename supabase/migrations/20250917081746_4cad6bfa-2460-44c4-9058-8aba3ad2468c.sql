-- Update cardio exercises with detailed instructions and metadata from walking_exercises.json
-- First, add the missing "Step Touch with Arms" exercise
INSERT INTO plank_exercises (
  name, 
  description, 
  difficulty_level, 
  category, 
  instructions, 
  image_url, 
  tags, 
  estimated_calories_per_minute, 
  primary_muscles, 
  equipment_needed, 
  is_beginner_friendly
)
SELECT 
  'Step Touch with Arms',
  'Simple side-to-side stepping motion with coordinated arm movements',
  3,
  'cardio',
  ARRAY[
    'Step right foot to the side, bring left foot to meet it',
    'Step left foot to the side, bring right foot to meet it',
    'Coordinate arm movements (raise arms overhead or out to sides)',
    'Maintain rhythm and controlled movements',
    'Keep knees slightly bent and core engaged'
  ],
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=400&q=80',
  ARRAY['cardio', 'coordination', 'lateral-movement', 'dance'],
  5.5,
  ARRAY['legs', 'core', 'shoulders'],
  ARRAY[]::text[],
  false
WHERE NOT EXISTS (
  SELECT 1 FROM plank_exercises WHERE name = 'Step Touch with Arms'
);

-- Update existing cardio exercises with detailed instructions and metadata
UPDATE plank_exercises 
SET 
  instructions = CASE name
    WHEN 'Gentle Arm Swings While Walking' THEN ARRAY[
      'Start walking at a comfortable, slow pace',
      'Let your arms swing naturally at your sides',
      'Gradually increase the range of motion of your arm swings',
      'Keep movements controlled and gentle',
      'Maintain steady breathing throughout'
    ]
    WHEN 'Slow Indoor Walking' THEN ARRAY[
      'Walk at a leisurely pace indoors',
      'Focus on proper posture with shoulders back',
      'Take normal-sized steps',
      'Breathe naturally and comfortably',
      'Can be done in hallways, around rooms, or on a treadmill'
    ]
    WHEN 'Standing Marching in Place' THEN ARRAY[
      'Stand with feet hip-width apart',
      'Lift one knee up toward your chest, then lower',
      'Alternate lifting each knee in a marching motion',
      'Keep your core engaged and back straight',
      'Swing arms naturally as you march'
    ]
    WHEN 'Brisk Walking' THEN ARRAY[
      'Walk at a faster pace than normal walking',
      'Maintain a pace where you can still hold a conversation',
      'Pump your arms to increase intensity',
      'Take slightly longer strides',
      'Aim for 3-4 mph pace'
    ]
    WHEN 'Stair Step-Ups' THEN ARRAY[
      'Stand facing a sturdy step or platform',
      'Step up with your right foot, bringing left foot up to meet it',
      'Step back down with right foot, then left foot',
      'Alternate leading leg every set',
      'Use handrail for balance if needed'
    ]
    WHEN 'Walking with Arm Circles' THEN ARRAY[
      'Begin walking at a moderate pace',
      'Extend arms out to sides at shoulder height',
      'Make small circles with your arms while walking',
      'Gradually increase circle size',
      'Alternate forward and backward circles'
    ]
    WHEN 'Walking with High Knees' THEN ARRAY[
      'Walk forward while lifting knees higher than normal',
      'Aim to bring knees up to hip level or higher',
      'Maintain good posture and core engagement',
      'Pump arms in opposition to legs',
      'Take shorter, quicker steps'
    ]
    WHEN 'Fast-Paced Marching' THEN ARRAY[
      'March in place at a rapid tempo',
      'Lift knees high toward chest with each step',
      'Pump arms vigorously in opposition',
      'Maintain quick, controlled movements',
      'Keep core tight and breathing steady'
    ]
    WHEN 'Walking Lunges' THEN ARRAY[
      'Step forward into a lunge position with right leg',
      'Lower back knee toward ground while keeping front knee over ankle',
      'Push off front foot to step forward into next lunge with left leg',
      'Continue alternating legs while moving forward',
      'Keep torso upright and core engaged'
    ]
    WHEN 'Walking with Knee-to-Chest' THEN ARRAY[
      'Walk forward while pulling alternating knees up to chest',
      'Use hands to gently pull knee toward chest',
      'Hold briefly, then step forward and repeat with other leg',
      'Maintain balance and controlled movement',
      'Engage core throughout the movement'
    ]
    WHEN 'Walking with Resistance (backpack)' THEN ARRAY[
      'Put on a weighted backpack (start with 10-15% of body weight)',
      'Walk at normal to brisk pace',
      'Maintain proper posture despite added weight',
      'Keep core engaged to support spine',
      'Adjust weight as fitness improves'
    ]
    ELSE instructions
  END,
  description = CASE name
    WHEN 'Gentle Arm Swings While Walking' THEN 'Walking with arm movements'
    WHEN 'Slow Indoor Walking' THEN 'Gentle walking pace indoors'
    WHEN 'Standing Marching in Place' THEN 'Marching without moving forward' 
    WHEN 'Brisk Walking' THEN 'Fast-paced walking'
    WHEN 'Stair Step-Ups' THEN 'Stepping up and down stairs'
    WHEN 'Walking with Arm Circles' THEN 'Walking combined with arm circles'
    WHEN 'Walking with High Knees' THEN 'Walking with exaggerated knee lifts'
    WHEN 'Fast-Paced Marching' THEN 'High-intensity marching in place'
    WHEN 'Walking Lunges' THEN 'Lunges while moving forward'
    WHEN 'Walking with Knee-to-Chest' THEN 'Walking with high knee pulls'
    WHEN 'Walking with Resistance (backpack)' THEN 'Walking with added weight'
    ELSE description
  END,
  estimated_calories_per_minute = CASE name
    WHEN 'Gentle Arm Swings While Walking' THEN 3.0
    WHEN 'Slow Indoor Walking' THEN 2.5
    WHEN 'Standing Marching in Place' THEN 3.5
    WHEN 'Brisk Walking' THEN 5.0
    WHEN 'Stair Step-Ups' THEN 6.0
    WHEN 'Walking with Arm Circles' THEN 4.5
    WHEN 'Walking with High Knees' THEN 5.5
    WHEN 'Fast-Paced Marching' THEN 7.0
    WHEN 'Walking Lunges' THEN 6.5
    WHEN 'Walking with Knee-to-Chest' THEN 5.0
    WHEN 'Walking with Resistance (backpack)' THEN 7.5
    ELSE estimated_calories_per_minute
  END,
  primary_muscles = CASE name
    WHEN 'Gentle Arm Swings While Walking' THEN ARRAY['legs', 'core']
    WHEN 'Slow Indoor Walking' THEN ARRAY['legs']
    WHEN 'Standing Marching in Place' THEN ARRAY['legs', 'core']
    WHEN 'Brisk Walking' THEN ARRAY['legs', 'core']
    WHEN 'Stair Step-Ups' THEN ARRAY['legs', 'glutes']
    WHEN 'Walking with Arm Circles' THEN ARRAY['legs', 'shoulders', 'core']
    WHEN 'Walking with High Knees' THEN ARRAY['legs', 'core', 'hip flexors']
    WHEN 'Fast-Paced Marching' THEN ARRAY['legs', 'core', 'arms']
    WHEN 'Walking Lunges' THEN ARRAY['legs', 'glutes', 'core']
    WHEN 'Walking with Knee-to-Chest' THEN ARRAY['legs', 'core', 'hip flexors']
    WHEN 'Walking with Resistance (backpack)' THEN ARRAY['legs', 'core', 'back']
    ELSE primary_muscles
  END,
  equipment_needed = CASE name
    WHEN 'Stair Step-Ups' THEN ARRAY['step', 'platform']
    WHEN 'Walking with Resistance (backpack)' THEN ARRAY['weighted backpack']
    ELSE ARRAY[]::text[]
  END,
  tags = CASE name
    WHEN 'Gentle Arm Swings While Walking' THEN ARRAY['cardio', 'low-impact', 'walking', 'beginner']
    WHEN 'Slow Indoor Walking' THEN ARRAY['cardio', 'low-impact', 'walking', 'beginner', 'indoor']
    WHEN 'Standing Marching in Place' THEN ARRAY['cardio', 'low-impact', 'stationary', 'beginner']
    WHEN 'Brisk Walking' THEN ARRAY['cardio', 'moderate-impact', 'walking']
    WHEN 'Stair Step-Ups' THEN ARRAY['cardio', 'strength', 'step-up']
    WHEN 'Walking with Arm Circles' THEN ARRAY['cardio', 'coordination', 'walking']
    WHEN 'Walking with High Knees' THEN ARRAY['cardio', 'coordination', 'walking', 'high-intensity']
    WHEN 'Fast-Paced Marching' THEN ARRAY['cardio', 'high-intensity', 'stationary']
    WHEN 'Walking Lunges' THEN ARRAY['strength', 'cardio', 'lunges', 'functional']
    WHEN 'Walking with Knee-to-Chest' THEN ARRAY['cardio', 'flexibility', 'walking', 'dynamic-stretch']
    WHEN 'Walking with Resistance (backpack)' THEN ARRAY['cardio', 'strength', 'weighted', 'walking']
    ELSE tags
  END,
  is_beginner_friendly = CASE name
    WHEN 'Gentle Arm Swings While Walking' THEN true
    WHEN 'Slow Indoor Walking' THEN true
    WHEN 'Standing Marching in Place' THEN true
    WHEN 'Brisk Walking' THEN true
    WHEN 'Stair Step-Ups' THEN true
    WHEN 'Walking with Arm Circles' THEN true
    WHEN 'Walking with High Knees' THEN true
    WHEN 'Fast-Paced Marching' THEN false
    WHEN 'Walking Lunges' THEN false
    WHEN 'Walking with Knee-to-Chest' THEN false
    WHEN 'Walking with Resistance (backpack)' THEN false
    ELSE is_beginner_friendly
  END,
  updated_at = now()
WHERE category = 'cardio' AND name IN (
  'Gentle Arm Swings While Walking',
  'Slow Indoor Walking', 
  'Standing Marching in Place',
  'Brisk Walking',
  'Stair Step-Ups',
  'Walking with Arm Circles',
  'Walking with High Knees',
  'Fast-Paced Marching',
  'Walking Lunges',
  'Walking with Knee-to-Chest',
  'Walking with Resistance (backpack)'
);