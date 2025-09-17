-- Update existing standing_movement exercises with rich metadata (correct array format)

-- Forward Fold
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Start in a standing position with feet hip-width apart', 'Slowly hinge forward at the hips, keeping knees slightly bent', 'Let your arms hang naturally toward the floor', 'Feel the stretch in your hamstrings and lower back', 'Hold the position and breathe deeply', 'To come up, slowly roll up one vertebra at a time'],
  calories_per_minute = 3,
  primary_muscle_groups = ARRAY['hamstrings', 'lower_back', 'calves'],
  equipment_needed = ARRAY[]::text[],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'hamstrings', 'back_stretch', 'stress_relief', 'beginner_friendly'],
  description = 'A gentle forward bending stretch that targets the hamstrings and lower back while promoting relaxation and stress relief.'
WHERE name = 'Forward Fold' AND category = 'standing_movement';

-- Side Stretch
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand with feet hip-width apart, arms at sides', 'Raise your right arm overhead', 'Gently lean to the left, creating a curve along your right side', 'Keep both feet planted and avoid twisting', 'Feel the stretch along your right side', 'Return to center and repeat on the other side'],
  calories_per_minute = 3,
  primary_muscle_groups = ARRAY['obliques', 'intercostals', 'latissimus_dorsi'],
  equipment_needed = ARRAY[]::text[],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'side_stretch', 'core', 'posture', 'beginner_friendly'],
  description = 'A standing lateral stretch that opens the side body, improves spinal mobility, and helps counteract slouched postures.'
WHERE name = 'Side Stretch' AND category = 'standing_movement';

-- Standing Backbend
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand with feet hip-width apart, hands on lower back', 'Engage your core muscles', 'Slowly arch backward, supporting your lower back with your hands', 'Look up gently, avoiding strain on the neck', 'Keep the movement controlled and within your range', 'Return to standing position slowly'],
  calories_per_minute = 4,
  primary_muscle_groups = ARRAY['erector_spinae', 'chest', 'hip_flexors'],
  equipment_needed = ARRAY[]::text[],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'back_extension', 'chest_opener', 'posture', 'beginner_friendly'],
  description = 'A gentle backbend that counteracts forward head posture, opens the chest, and strengthens the back extensors.'
WHERE name = 'Standing Backbend' AND category = 'standing_movement';

-- Chest Opener
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand tall with feet shoulder-width apart', 'Clasp your hands behind your back', 'Straighten your arms and lift them away from your body', 'Open your chest and squeeze your shoulder blades together', 'Keep your head in a neutral position', 'Hold and breathe deeply'],
  calories_per_minute = 2,
  primary_muscle_groups = ARRAY['chest', 'anterior_deltoids', 'biceps'],
  equipment_needed = ARRAY[]::text[],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'chest_stretch', 'posture', 'shoulder_mobility', 'beginner_friendly'],
  description = 'A standing chest stretch that opens tight pectoral muscles and improves posture by counteracting rounded shoulders.'
WHERE name = 'Chest Opener' AND category = 'standing_movement';

-- Hip Flexor Stretch
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand in a lunge position with right foot forward', 'Keep your back leg straight and heel lifted', 'Push your hips forward gently', 'Feel the stretch in the front of your back leg hip', 'Keep your torso upright', 'Switch legs and repeat on the other side'],
  calories_per_minute = 3,
  primary_muscle_groups = ARRAY['hip_flexors', 'psoas', 'quadriceps'],
  equipment_needed = ARRAY[]::text[],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'hip_stretch', 'posture', 'lower_body', 'beginner_friendly'],
  description = 'A standing lunge stretch that targets tight hip flexors, commonly shortened from prolonged sitting.'
WHERE name = 'Hip Flexor Stretch' AND category = 'standing_movement';

-- Standing Quad Stretch
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand on your left leg, holding onto a wall for balance', 'Bend your right knee and grab your right ankle behind you', 'Pull your heel toward your glutes', 'Keep your knees close together', 'Feel the stretch in the front of your thigh', 'Switch legs and repeat'],
  calories_per_minute = 3,
  primary_muscle_groups = ARRAY['quadriceps', 'hip_flexors'],
  equipment_needed = ARRAY['wall_support'],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'quad_stretch', 'balance', 'lower_body', 'beginner_friendly'],
  description = 'A classic standing stretch that targets the quadriceps muscles and helps improve leg flexibility and balance.'
WHERE name = 'Standing Quad Stretch' AND category = 'standing_movement';

-- Calf Stretch
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand facing a wall, arms length away', 'Place your hands on the wall', 'Step your right foot back about 3 feet', 'Keep your right heel on the ground and leg straight', 'Lean forward into the wall', 'Feel the stretch in your right calf, then switch legs'],
  calories_per_minute = 2,
  primary_muscle_groups = ARRAY['gastrocnemius', 'soleus', 'achilles'],
  equipment_needed = ARRAY['wall_support'],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'calf_stretch', 'lower_leg', 'ankle_mobility', 'beginner_friendly'],
  description = 'A wall-supported calf stretch that targets the gastrocnemius and soleus muscles, improving ankle flexibility.'
WHERE name = 'Calf Stretch' AND category = 'standing_movement';

-- Standing Spinal Twist
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand with feet hip-width apart, arms extended at shoulder height', 'Slowly rotate your torso to the right, keeping hips facing forward', 'Allow your arms to wrap around your body naturally', 'Feel the twist through your spine', 'Return to center and twist to the left', 'Keep the movement slow and controlled'],
  calories_per_minute = 3,
  primary_muscle_groups = ARRAY['obliques', 'erector_spinae', 'deep_spinal_rotators'],
  equipment_needed = ARRAY[]::text[],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'spinal_mobility', 'core', 'rotation', 'beginner_friendly'],
  description = 'A gentle twisting movement that promotes spinal mobility and helps release tension in the back and core.'
WHERE name = 'Standing Spinal Twist' AND category = 'standing_movement';

-- Shoulder Rolls
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand with arms at your sides', 'Lift your shoulders up toward your ears', 'Roll them back, squeezing shoulder blades together', 'Lower them down', 'Continue in a smooth, circular motion', 'Reverse direction after several repetitions'],
  calories_per_minute = 2,
  primary_muscle_groups = ARRAY['trapezius', 'rhomboids', 'deltoids'],
  equipment_needed = ARRAY[]::text[],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'shoulder_mobility', 'neck_relief', 'posture', 'beginner_friendly'],
  description = 'Simple shoulder movements that relieve tension in the upper back and neck while improving shoulder mobility.'
WHERE name = 'Shoulder Rolls' AND category = 'standing_movement';

-- Neck Stretch
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand or sit with spine straight', 'Slowly tilt your head to the right, bringing ear toward shoulder', 'Hold for a few breaths', 'Return head to center', 'Tilt to the left side', 'Avoid lifting your shoulder to meet your ear'],
  calories_per_minute = 1,
  primary_muscle_groups = ARRAY['sternocleidomastoid', 'upper_trapezius', 'levator_scapulae'],
  equipment_needed = ARRAY[]::text[],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'neck_stretch', 'tension_relief', 'posture', 'beginner_friendly'],
  description = 'Gentle neck stretches that relieve tension and stiffness in the neck and upper shoulder muscles.'
WHERE name = 'Neck Stretch' AND category = 'standing_movement';

-- Arm Circles
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand with feet shoulder-width apart', 'Extend your arms out to the sides at shoulder height', 'Make small circles forward with your arms', 'Gradually increase the size of the circles', 'Reverse direction and circle backward', 'Keep your core engaged throughout'],
  calories_per_minute = 3,
  primary_muscle_groups = ARRAY['deltoids', 'rotator_cuff', 'rhomboids'],
  equipment_needed = ARRAY[]::text[],
  is_beginner_friendly = true,
  tags = ARRAY['flexibility', 'shoulder_mobility', 'warm_up', 'circulation', 'beginner_friendly'],
  description = 'Dynamic arm movements that warm up the shoulder joints and improve circulation in the upper body.'
WHERE name = 'Arm Circles' AND category = 'standing_movement';

-- Standing Figure Four
UPDATE plank_exercises 
SET 
  instructions = ARRAY['Stand on your left leg, holding a wall for balance', 'Place your right ankle on your left thigh, just above the knee', 'Sit back slightly as if sitting in a chair', 'Feel the stretch in your right hip and glute', 'Keep your right foot flexed', 'Switch legs and repeat on the other side'],
  calories_per_minute = 3,
  primary_muscle_groups = ARRAY['piriformis', 'glutes', 'hip_external_rotators'],
  equipment_needed = ARRAY['wall_support'],
  is_beginner_friendly = false,
  tags = ARRAY['flexibility', 'hip_stretch', 'glute_stretch', 'balance', 'intermediate'],
  description = 'An intermediate hip stretch that targets the piriformis and glute muscles while challenging balance and stability.'
WHERE name = 'Standing Figure Four' AND category = 'standing_movement';