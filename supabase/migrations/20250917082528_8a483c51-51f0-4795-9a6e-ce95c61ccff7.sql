-- Insert leg lift strength exercises
INSERT INTO public.plank_exercises (
  name, 
  description, 
  instructions, 
  difficulty_level, 
  category, 
  estimated_calories_per_minute, 
  primary_muscles, 
  equipment_needed, 
  is_beginner_friendly, 
  tags
) VALUES 
-- Difficulty Level 1 (Beginner)
(
  'Bent Knee Leg Lifts (lying)', 
  'Lying leg lifts with bent knees', 
  ARRAY['Lie on back with knees bent at 90 degrees', 'Keep lower back pressed to floor', 'Lift knees toward chest, then lower with control', 'Keep core engaged throughout movement', 'Start with 8-12 repetitions'], 
  1, 
  'strength', 
  3.5, 
  ARRAY['core', 'hip flexors'], 
  ARRAY[]::text[], 
  true, 
  ARRAY['strength', 'core', 'beginner', 'lying', 'hip-flexors']
),
(
  'Side-Lying Leg Lifts', 
  'Leg lifts while lying on side', 
  ARRAY['Lie on side with bottom arm supporting head', 'Keep body in straight line', 'Lift top leg up 12-18 inches, then lower slowly', 'Keep hips stacked and avoid rolling forward/back', 'Perform 10-15 reps per side'], 
  1, 
  'strength', 
  3.0, 
  ARRAY['glutes', 'hip abductors'], 
  ARRAY[]::text[], 
  true, 
  ARRAY['strength', 'glutes', 'beginner', 'side-lying', 'hip-abductors']
),
(
  'Standing Leg Lifts', 
  'Leg lifts from standing position', 
  ARRAY['Stand tall with hands on hips or holding support', 'Lift one leg forward, to side, or behind', 'Keep standing leg slightly bent', 'Control the movement both up and down', 'Perform 8-12 reps per leg per direction'], 
  1, 
  'strength', 
  4.0, 
  ARRAY['glutes', 'hip flexors', 'legs'], 
  ARRAY[]::text[], 
  true, 
  ARRAY['strength', 'glutes', 'beginner', 'standing', 'balance']
),

-- Difficulty Level 2 (Intermediate)
(
  'Alternating Leg Lifts (lying)', 
  'Lying alternating leg lifts', 
  ARRAY['Lie on back with legs extended', 'Keep lower back pressed to floor', 'Lift one leg to 45-90 degrees, lower, then lift other leg', 'Maintain steady rhythm and core engagement', 'Perform 10-16 alternating lifts'], 
  2, 
  'strength', 
  4.5, 
  ARRAY['core', 'hip flexors'], 
  ARRAY[]::text[], 
  true, 
  ARRAY['strength', 'core', 'alternating', 'lying', 'hip-flexors']
),
(
  'Straight Leg Lifts (lying)', 
  'Lying leg lifts with straight legs', 
  ARRAY['Lie on back with legs straight', 'Press lower back into floor', 'Lift both legs together to 45-90 degrees', 'Lower slowly without touching ground', 'Keep legs straight throughout movement'], 
  2, 
  'strength', 
  5.0, 
  ARRAY['core', 'hip flexors'], 
  ARRAY[]::text[], 
  true, 
  ARRAY['strength', 'core', 'lying', 'hip-flexors', 'straight-leg']
),
(
  'Reverse Leg Lifts (prone)', 
  'Lying face down and lifting legs behind you, targets glutes and hamstrings differently than the current lying/standing variations', 
  ARRAY['Lie face down with forehead on hands', 'Keep hips pressed to floor', 'Lift one or both legs behind you', 'Squeeze glutes and engage hamstrings', 'Hold briefly at top, then lower slowly'], 
  2, 
  'strength', 
  4.0, 
  ARRAY['glutes', 'hamstrings'], 
  ARRAY[]::text[], 
  true, 
  ARRAY['strength', 'glutes', 'hamstrings', 'prone', 'posterior-chain']
),

-- Difficulty Level 3 (Advanced)
(
  'Double Leg Lifts', 
  'Both legs lifted together', 
  ARRAY['Lie on back with legs straight and together', 'Keep lower back pressed to floor', 'Lift both legs simultaneously to vertical', 'Lower slowly with complete control', 'Stop just before feet touch ground'], 
  3, 
  'strength', 
  6.0, 
  ARRAY['core', 'hip flexors'], 
  ARRAY[]::text[], 
  false, 
  ARRAY['strength', 'core', 'advanced', 'double-leg', 'hip-flexors']
),
(
  'Side Plank Leg Lifts', 
  'Leg lifts in side plank position', 
  ARRAY['Start in side plank position', 'Maintain plank while lifting top leg', 'Keep hips elevated and body aligned', 'Control both the lift and lower phases', 'Perform 8-12 reps per side'], 
  3, 
  'strength', 
  7.0, 
  ARRAY['core', 'glutes', 'obliques'], 
  ARRAY[]::text[], 
  false, 
  ARRAY['strength', 'core', 'glutes', 'side-plank', 'obliques', 'compound']
),
(
  'Leg Lift Holds', 
  'Static leg lift holds', 
  ARRAY['Lie on back and lift legs to 45-degree angle', 'Hold position without letting legs drop', 'Keep core engaged and lower back pressed down', 'Breathe normally while holding', 'Build up to 30-60 second holds'], 
  3, 
  'strength', 
  5.5, 
  ARRAY['core', 'hip flexors'], 
  ARRAY[]::text[], 
  false, 
  ARRAY['strength', 'core', 'isometric', 'hold', 'hip-flexors']
),
(
  'Single Leg Lift Holds', 
  'Single leg static holds', 
  ARRAY['Lie on back and lift one leg to vertical', 'Hold position while keeping other leg extended on ground', 'Maintain core engagement throughout hold', 'Keep pelvis stable and avoid tilting', 'Hold 20-45 seconds per leg'], 
  3, 
  'strength', 
  5.0, 
  ARRAY['core', 'hip flexors'], 
  ARRAY[]::text[], 
  false, 
  ARRAY['strength', 'core', 'isometric', 'unilateral', 'hip-flexors']
),

-- Difficulty Level 4 (Expert)
(
  'Leg Lifts with Twist', 
  'Leg lifts with rotational movement', 
  ARRAY['Lie on back with legs straight', 'Lift legs to vertical position', 'Lower legs to one side in controlled motion', 'Return to center, then lower to opposite side', 'Keep shoulders pressed to ground throughout'], 
  4, 
  'strength', 
  7.0, 
  ARRAY['core', 'obliques', 'hip flexors'], 
  ARRAY[]::text[], 
  false, 
  ARRAY['strength', 'core', 'obliques', 'rotation', 'advanced', 'dynamic']
),
(
  'Hanging Knee Raises', 
  'Knee raises while hanging', 
  ARRAY['Hang from pull-up bar with arms extended', 'Keep shoulders engaged and avoid swinging', 'Lift knees toward chest by contracting abs', 'Lower legs slowly with complete control', 'Avoid using momentum or swinging motion'], 
  4, 
  'strength', 
  8.0, 
  ARRAY['core', 'hip flexors', 'arms'], 
  ARRAY['pull-up bar'], 
  false, 
  ARRAY['strength', 'core', 'hanging', 'pull-up-bar', 'advanced', 'grip-strength']
);