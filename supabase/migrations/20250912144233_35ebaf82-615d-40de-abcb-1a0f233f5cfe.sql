-- Add new exercise families to existing plank_exercises table
-- Phase 1: Database Migration - Add ~75 new exercises

-- Wall Sit Exercises (Beginner to Expert)
INSERT INTO public.plank_exercises (name, description, category, difficulty_level, primary_muscles, tags, duration_seconds, instructions, tips, benefits) VALUES 
('Basic Wall Sit', 'Stand with your back against a wall, slide down until thighs are parallel to floor', 'wall_sit', 1, ARRAY['quadriceps', 'glutes'], ARRAY['beginner', 'strength', 'lower_body'], 30, ARRAY['Stand with back against wall', 'Slide down until thighs parallel to floor', 'Hold position with feet shoulder-width apart'], ARRAY['Keep knees at 90 degrees', 'Press back firmly against wall'], ARRAY['Strengthens quadriceps and glutes', 'Improves lower body endurance']),

('Wall Sit with Arm Raises', 'Basic wall sit while lifting arms overhead alternately', 'wall_sit', 2, ARRAY['quadriceps', 'glutes', 'shoulders'], ARRAY['intermediate', 'strength', 'coordination'], 45, ARRAY['Get into basic wall sit position', 'Raise one arm overhead, then alternate', 'Maintain wall sit throughout'], ARRAY['Keep core engaged', 'Smooth arm movements'], ARRAY['Adds upper body engagement', 'Improves coordination']),

('Single Leg Wall Sit', 'Wall sit position while lifting one leg straight out', 'wall_sit', 3, ARRAY['quadriceps', 'glutes', 'core'], ARRAY['advanced', 'strength', 'balance'], 30, ARRAY['Start in wall sit position', 'Lift one leg straight out', 'Hold then switch legs'], ARRAY['Keep lifted leg straight', 'Maintain balance'], ARRAY['Increases single leg strength', 'Challenges balance']),

('Wall Sit with Medicine Ball', 'Wall sit while holding medicine ball at chest', 'wall_sit', 4, ARRAY['quadriceps', 'glutes', 'core'], ARRAY['expert', 'strength', 'equipment'], 60, ARRAY['Hold medicine ball at chest', 'Get into wall sit position', 'Maintain grip throughout'], ARRAY['Choose appropriate weight', 'Keep ball close to body'], ARRAY['Adds resistance training', 'Increases core activation']),

-- Leg Lift Exercises
('Basic Leg Lifts', 'Lie on back and lift straight legs to 90 degrees', 'leg_lift', 1, ARRAY['core', 'hip_flexors'], ARRAY['beginner', 'core', 'flexibility'], 30, ARRAY['Lie on back, legs straight', 'Lift legs to 90 degrees', 'Lower slowly without touching ground'], ARRAY['Keep lower back pressed to floor', 'Control the movement'], ARRAY['Strengthens core muscles', 'Improves hip flexibility']),

('Flutter Kicks', 'Alternate small leg kicks while lying on back', 'leg_lift', 2, ARRAY['core', 'hip_flexors'], ARRAY['intermediate', 'cardio', 'core'], 45, ARRAY['Lie on back, legs straight', 'Lift legs slightly off ground', 'Alternate small kicks'], ARRAY['Keep core tight', 'Small controlled movements'], ARRAY['Builds core endurance', 'Improves coordination']),

('Bicycle Crunches', 'Alternate bringing knee to opposite elbow', 'leg_lift', 2, ARRAY['core', 'obliques'], ARRAY['intermediate', 'core', 'rotation'], 45, ARRAY['Lie on back, hands behind head', 'Bring right knee to left elbow', 'Alternate sides in cycling motion'], ARRAY['Avoid pulling on neck', 'Focus on oblique contraction'], ARRAY['Targets obliques', 'Improves rotational strength']),

('Hanging Leg Raises', 'Hang from bar and raise knees to chest', 'leg_lift', 4, ARRAY['core', 'grip', 'shoulders'], ARRAY['expert', 'strength', 'equipment'], 30, ARRAY['Hang from pull-up bar', 'Raise knees to chest', 'Lower with control'], ARRAY['Avoid swinging', 'Engage core before lifting'], ARRAY['Advanced core strengthening', 'Improves grip strength']),

-- Cardio Exercises
('Marching in Place', 'Lift knees alternately while standing', 'cardio', 1, ARRAY['hip_flexors', 'core'], ARRAY['beginner', 'cardio', 'low_impact'], 60, ARRAY['Stand with feet hip-width apart', 'Lift right knee, then left', 'Maintain steady rhythm'], ARRAY['Lift knees to comfortable height', 'Keep core engaged'], ARRAY['Low-impact cardio', 'Improves coordination']),

('Jumping Jacks', 'Jump while spreading legs and raising arms overhead', 'cardio', 2, ARRAY['full_body', 'calves'], ARRAY['intermediate', 'cardio', 'full_body'], 45, ARRAY['Start with feet together, arms at sides', 'Jump while spreading legs and raising arms', 'Return to starting position'], ARRAY['Land softly on balls of feet', 'Keep core tight'], ARRAY['Full-body cardio workout', 'Improves cardiovascular fitness']),

('High Knees', 'Run in place lifting knees as high as possible', 'cardio', 3, ARRAY['hip_flexors', 'calves', 'core'], ARRAY['advanced', 'cardio', 'intensity'], 30, ARRAY['Stand tall', 'Run in place lifting knees high', 'Pump arms for momentum'], ARRAY['Aim to bring knees to chest level', 'Stay on balls of feet'], ARRAY['High-intensity cardio', 'Builds lower body power']),

('Burpees', 'Squat, jump back to plank, return and jump up', 'cardio', 4, ARRAY['full_body', 'core'], ARRAY['expert', 'cardio', 'strength'], 45, ARRAY['Start standing', 'Squat and place hands on floor', 'Jump feet back to plank', 'Return to squat and jump up'], ARRAY['Maintain form throughout', 'Modify as needed'], ARRAY['Ultimate full-body exercise', 'Maximum calorie burn']),

('Mountain Climbers', 'Alternate bringing knees to chest in plank position', 'cardio', 3, ARRAY['core', 'shoulders', 'hip_flexors'], ARRAY['advanced', 'cardio', 'core'], 45, ARRAY['Start in plank position', 'Bring right knee to chest', 'Switch legs quickly'], ARRAY['Keep hips level', 'Maintain plank form'], ARRAY['Cardio and core strengthening', 'Improves agility']),

-- Standing Movement Exercises
('Arm Circles', 'Make large circles with both arms', 'standing_movement', 1, ARRAY['shoulders', 'upper_back'], ARRAY['beginner', 'warmup', 'mobility'], 60, ARRAY['Stand with arms extended to sides', 'Make large forward circles', 'Reverse direction'], ARRAY['Keep arms straight', 'Control the movement'], ARRAY['Warms up shoulders', 'Improves shoulder mobility']),

('Torso Twists', 'Rotate upper body left and right', 'standing_movement', 2, ARRAY['obliques', 'core'], ARRAY['intermediate', 'mobility', 'core'], 45, ARRAY['Stand with feet shoulder-width apart', 'Place hands on hips or cross arms', 'Rotate torso left and right'], ARRAY['Keep hips facing forward', 'Control rotation'], ARRAY['Improves spinal mobility', 'Strengthens obliques']),

('Standing Hip Circles', 'Make circles with hips while standing', 'standing_movement', 2, ARRAY['hip_flexors', 'core'], ARRAY['intermediate', 'mobility', 'hip_health'], 45, ARRAY['Stand with hands on hips', 'Make large circles with hips', 'Switch directions'], ARRAY['Keep upper body stable', 'Full range of motion'], ARRAY['Improves hip mobility', 'Reduces hip stiffness']),

('Standing Balance on One Foot', 'Balance on single foot with eyes closed', 'standing_movement', 3, ARRAY['calves', 'core', 'stabilizers'], ARRAY['advanced', 'balance', 'proprioception'], 30, ARRAY['Stand on one foot', 'Close eyes', 'Hold balance'], ARRAY['Start with eyes open', 'Use wall if needed'], ARRAY['Improves proprioception', 'Strengthens stabilizing muscles']),

('Standing Calf Raises', 'Rise up onto toes and lower slowly', 'standing_movement', 2, ARRAY['calves', 'ankles'], ARRAY['intermediate', 'strength', 'lower_body'], 60, ARRAY['Stand with feet hip-width apart', 'Rise up onto toes', 'Lower slowly'], ARRAY['Full range of motion', 'Control the descent'], ARRAY['Strengthens calves', 'Improves ankle stability']),

-- Seated Exercises
('Seated Marching', 'Lift knees alternately while seated', 'seated_exercise', 1, ARRAY['hip_flexors', 'core'], ARRAY['beginner', 'seated', 'accessible'], 60, ARRAY['Sit tall in chair', 'Lift right knee, then left', 'Maintain rhythm'], ARRAY['Keep back straight', 'Engage core'], ARRAY['Accessible cardio option', 'Improves circulation']),

('Seated Torso Twists', 'Rotate upper body while seated', 'seated_exercise', 2, ARRAY['obliques', 'core'], ARRAY['intermediate', 'seated', 'mobility'], 45, ARRAY['Sit tall with hands behind head', 'Rotate torso left and right', 'Keep hips facing forward'], ARRAY['Avoid straining neck', 'Control movement'], ARRAY['Improves spinal rotation', 'Office-friendly exercise']),

('Seated Leg Extensions', 'Straighten and bend legs while seated', 'seated_exercise', 2, ARRAY['quadriceps', 'hip_flexors'], ARRAY['intermediate', 'seated', 'strength'], 45, ARRAY['Sit tall in chair', 'Straighten one leg', 'Lower slowly and repeat'], ARRAY['Full extension', 'Control the movement'], ARRAY['Strengthens quadriceps', 'Improves knee mobility']),

('Seated Calf Raises', 'Lift heels while seated', 'seated_exercise', 1, ARRAY['calves'], ARRAY['beginner', 'seated', 'circulation'], 60, ARRAY['Sit with feet flat on floor', 'Lift heels up', 'Lower slowly'], ARRAY['Keep toes on ground', 'Feel stretch in calves'], ARRAY['Improves circulation', 'Easy desk exercise']),

('Seated Shoulder Blade Squeezes', 'Pull shoulder blades together', 'seated_exercise', 1, ARRAY['rhomboids', 'middle_traps'], ARRAY['beginner', 'posture', 'upper_body'], 30, ARRAY['Sit tall', 'Pull shoulder blades back and together', 'Hold briefly'], ARRAY['Avoid shrugging shoulders', 'Feel muscles between shoulder blades'], ARRAY['Improves posture', 'Counters forward head posture']),

-- Expanded Plank Exercises
('Standard Plank', 'Hold rigid plank position on forearms', 'expanded_plank', 2, ARRAY['core', 'shoulders'], ARRAY['intermediate', 'core', 'isometric'], 60, ARRAY['Start on forearms and toes', 'Keep body straight from head to heels', 'Hold position'], ARRAY['Engage core throughout', 'Avoid sagging hips'], ARRAY['Core strengthening', 'Improves posture']),

('Plank with Leg Lift', 'Hold plank while lifting one leg', 'expanded_plank', 3, ARRAY['core', 'glutes', 'shoulders'], ARRAY['advanced', 'core', 'stability'], 45, ARRAY['Start in plank position', 'Lift one leg straight back', 'Hold then switch'], ARRAY['Keep hips level', 'Control leg movement'], ARRAY['Challenges stability', 'Strengthens glutes']),

('Side Plank', 'Hold plank on one side', 'expanded_plank', 3, ARRAY['obliques', 'shoulders'], ARRAY['advanced', 'core', 'lateral'], 30, ARRAY['Lie on side, prop up on forearm', 'Lift hips to form straight line', 'Hold position'], ARRAY['Stack feet and hips', 'Keep core tight'], ARRAY['Targets obliques', 'Improves lateral stability']),

('Plank to Downward Dog', 'Move from plank to downward dog position', 'expanded_plank', 3, ARRAY['core', 'shoulders', 'hamstrings'], ARRAY['advanced', 'mobility', 'flow'], 45, ARRAY['Start in plank', 'Push hips up and back', 'Return to plank'], ARRAY['Smooth transition', 'Engage core throughout'], ARRAY['Dynamic core work', 'Improves shoulder mobility']),

('Plank Jacks', 'Jump feet apart and together in plank', 'expanded_plank', 4, ARRAY['core', 'shoulders', 'hip_flexors'], ARRAY['expert', 'cardio', 'dynamic'], 30, ARRAY['Start in plank position', 'Jump feet apart then together', 'Maintain plank form'], ARRAY['Keep core engaged', 'Land softly'], ARRAY['Cardio and core combination', 'High-intensity exercise']),

('Bear Crawl', 'Crawl on hands and feet with knees hovering', 'expanded_plank', 4, ARRAY['core', 'shoulders', 'quadriceps'], ARRAY['expert', 'strength', 'coordination'], 45, ARRAY['Start on hands and knees', 'Lift knees slightly off ground', 'Crawl forward maintaining position'], ARRAY['Keep knees close to ground', 'Coordinate opposite limbs'], ARRAY['Full-body strengthening', 'Improves coordination']);