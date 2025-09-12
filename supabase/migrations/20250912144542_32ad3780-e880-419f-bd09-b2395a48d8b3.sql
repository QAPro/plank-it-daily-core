-- Add new exercise families to existing plank_exercises table
-- Phase 1: Database Migration - Add ~30 new exercises using existing table structure

-- Wall Sit Exercises (Beginner to Expert)
INSERT INTO public.plank_exercises (name, description, category, difficulty_level, primary_muscles, tags, instructions, estimated_calories_per_minute, equipment_needed, is_beginner_friendly) VALUES 
('Basic Wall Sit', 'Stand with your back against a wall, slide down until thighs are parallel to floor', 'wall_sit', 1, ARRAY['quadriceps', 'glutes'], ARRAY['beginner', 'strength', 'lower_body'], ARRAY['Stand with back against wall', 'Slide down until thighs parallel to floor', 'Hold position with feet shoulder-width apart'], 3.0, ARRAY[], true),

('Wall Sit with Arm Raises', 'Basic wall sit while lifting arms overhead alternately', 'wall_sit', 2, ARRAY['quadriceps', 'glutes', 'shoulders'], ARRAY['intermediate', 'strength', 'coordination'], ARRAY['Get into basic wall sit position', 'Raise one arm overhead, then alternate', 'Maintain wall sit throughout'], 3.5, ARRAY[], false),

('Single Leg Wall Sit', 'Wall sit position while lifting one leg straight out', 'wall_sit', 3, ARRAY['quadriceps', 'glutes', 'core'], ARRAY['advanced', 'strength', 'balance'], ARRAY['Start in wall sit position', 'Lift one leg straight out', 'Hold then switch legs'], 4.0, ARRAY[], false),

('Wall Sit with Medicine Ball', 'Wall sit while holding medicine ball at chest', 'wall_sit', 4, ARRAY['quadriceps', 'glutes', 'core'], ARRAY['expert', 'strength', 'equipment'], ARRAY['Hold medicine ball at chest', 'Get into wall sit position', 'Maintain grip throughout'], 4.5, ARRAY['medicine_ball'], false),

-- Leg Lift Exercises
('Basic Leg Lifts', 'Lie on back and lift straight legs to 90 degrees', 'leg_lift', 1, ARRAY['core', 'hip_flexors'], ARRAY['beginner', 'core', 'flexibility'], ARRAY['Lie on back, legs straight', 'Lift legs to 90 degrees', 'Lower slowly without touching ground'], 2.5, ARRAY[], true),

('Flutter Kicks', 'Alternate small leg kicks while lying on back', 'leg_lift', 2, ARRAY['core', 'hip_flexors'], ARRAY['intermediate', 'cardio', 'core'], ARRAY['Lie on back, legs straight', 'Lift legs slightly off ground', 'Alternate small kicks'], 3.0, ARRAY[], false),

('Bicycle Crunches', 'Alternate bringing knee to opposite elbow', 'leg_lift', 2, ARRAY['core', 'obliques'], ARRAY['intermediate', 'core', 'rotation'], ARRAY['Lie on back, hands behind head', 'Bring right knee to left elbow', 'Alternate sides in cycling motion'], 3.5, ARRAY[], false),

('Hanging Leg Raises', 'Hang from bar and raise knees to chest', 'leg_lift', 4, ARRAY['core', 'grip', 'shoulders'], ARRAY['expert', 'strength', 'equipment'], ARRAY['Hang from pull-up bar', 'Raise knees to chest', 'Lower with control'], 5.0, ARRAY['pull_up_bar'], false),

-- Cardio Exercises
('Marching in Place', 'Lift knees alternately while standing', 'cardio', 1, ARRAY['hip_flexors', 'core'], ARRAY['beginner', 'cardio', 'low_impact'], ARRAY['Stand with feet hip-width apart', 'Lift right knee, then left', 'Maintain steady rhythm'], 2.0, ARRAY[], true),

('Jumping Jacks', 'Jump while spreading legs and raising arms overhead', 'cardio', 2, ARRAY['full_body', 'calves'], ARRAY['intermediate', 'cardio', 'full_body'], ARRAY['Start with feet together, arms at sides', 'Jump while spreading legs and raising arms', 'Return to starting position'], 4.0, ARRAY[], false),

('High Knees', 'Run in place lifting knees as high as possible', 'cardio', 3, ARRAY['hip_flexors', 'calves', 'core'], ARRAY['advanced', 'cardio', 'intensity'], ARRAY['Stand tall', 'Run in place lifting knees high', 'Pump arms for momentum'], 6.0, ARRAY[], false),

('Burpees', 'Squat, jump back to plank, return and jump up', 'cardio', 4, ARRAY['full_body', 'core'], ARRAY['expert', 'cardio', 'strength'], ARRAY['Start standing', 'Squat and place hands on floor', 'Jump feet back to plank', 'Return to squat and jump up'], 7.0, ARRAY[], false),

('Mountain Climbers', 'Alternate bringing knees to chest in plank position', 'cardio', 3, ARRAY['core', 'shoulders', 'hip_flexors'], ARRAY['advanced', 'cardio', 'core'], ARRAY['Start in plank position', 'Bring right knee to chest', 'Switch legs quickly'], 5.5, ARRAY[], false),

-- Standing Movement Exercises
('Arm Circles', 'Make large circles with both arms', 'standing_movement', 1, ARRAY['shoulders', 'upper_back'], ARRAY['beginner', 'warmup', 'mobility'], ARRAY['Stand with arms extended to sides', 'Make large forward circles', 'Reverse direction'], 1.5, ARRAY[], true),

('Torso Twists', 'Rotate upper body left and right', 'standing_movement', 2, ARRAY['obliques', 'core'], ARRAY['intermediate', 'mobility', 'core'], ARRAY['Stand with feet shoulder-width apart', 'Place hands on hips or cross arms', 'Rotate torso left and right'], 2.0, ARRAY[], false),

('Standing Hip Circles', 'Make circles with hips while standing', 'standing_movement', 2, ARRAY['hip_flexors', 'core'], ARRAY['intermediate', 'mobility', 'hip_health'], ARRAY['Stand with hands on hips', 'Make large circles with hips', 'Switch directions'], 1.8, ARRAY[], false),

('Standing Balance on One Foot', 'Balance on single foot with eyes closed', 'standing_movement', 3, ARRAY['calves', 'core', 'stabilizers'], ARRAY['advanced', 'balance', 'proprioception'], ARRAY['Stand on one foot', 'Close eyes', 'Hold balance'], 1.2, ARRAY[], false),

('Standing Calf Raises', 'Rise up onto toes and lower slowly', 'standing_movement', 2, ARRAY['calves', 'ankles'], ARRAY['intermediate', 'strength', 'lower_body'], ARRAY['Stand with feet hip-width apart', 'Rise up onto toes', 'Lower slowly'], 2.2, ARRAY[], false),

-- Seated Exercises
('Seated Marching', 'Lift knees alternately while seated', 'seated_exercise', 1, ARRAY['hip_flexors', 'core'], ARRAY['beginner', 'seated', 'accessible'], ARRAY['Sit tall in chair', 'Lift right knee, then left', 'Maintain rhythm'], 1.5, ARRAY['chair'], true),

('Seated Torso Twists', 'Rotate upper body while seated', 'seated_exercise', 2, ARRAY['obliques', 'core'], ARRAY['intermediate', 'seated', 'mobility'], ARRAY['Sit tall with hands behind head', 'Rotate torso left and right', 'Keep hips facing forward'], 1.8, ARRAY['chair'], false),

('Seated Leg Extensions', 'Straighten and bend legs while seated', 'seated_exercise', 2, ARRAY['quadriceps', 'hip_flexors'], ARRAY['intermediate', 'seated', 'strength'], ARRAY['Sit tall in chair', 'Straighten one leg', 'Lower slowly and repeat'], 2.0, ARRAY['chair'], false),

('Seated Calf Raises', 'Lift heels while seated', 'seated_exercise', 1, ARRAY['calves'], ARRAY['beginner', 'seated', 'circulation'], ARRAY['Sit with feet flat on floor', 'Lift heels up', 'Lower slowly'], 1.2, ARRAY['chair'], true),

('Seated Shoulder Blade Squeezes', 'Pull shoulder blades together', 'seated_exercise', 1, ARRAY['rhomboids', 'middle_traps'], ARRAY['beginner', 'posture', 'upper_body'], ARRAY['Sit tall', 'Pull shoulder blades back and together', 'Hold briefly'], 1.0, ARRAY['chair'], true),

-- Expanded Plank Exercises
('Standard Plank', 'Hold rigid plank position on forearms', 'expanded_plank', 2, ARRAY['core', 'shoulders'], ARRAY['intermediate', 'core', 'isometric'], ARRAY['Start on forearms and toes', 'Keep body straight from head to heels', 'Hold position'], 3.0, ARRAY[], false),

('Plank with Leg Lift', 'Hold plank while lifting one leg', 'expanded_plank', 3, ARRAY['core', 'glutes', 'shoulders'], ARRAY['advanced', 'core', 'stability'], ARRAY['Start in plank position', 'Lift one leg straight back', 'Hold then switch'], 3.5, ARRAY[], false),

('Side Plank', 'Hold plank on one side', 'expanded_plank', 3, ARRAY['obliques', 'shoulders'], ARRAY['advanced', 'core', 'lateral'], ARRAY['Lie on side, prop up on forearm', 'Lift hips to form straight line', 'Hold position'], 3.2, ARRAY[], false),

('Plank to Downward Dog', 'Move from plank to downward dog position', 'expanded_plank', 3, ARRAY['core', 'shoulders', 'hamstrings'], ARRAY['advanced', 'mobility', 'flow'], ARRAY['Start in plank', 'Push hips up and back', 'Return to plank'], 4.0, ARRAY[], false),

('Plank Jacks', 'Jump feet apart and together in plank', 'expanded_plank', 4, ARRAY['core', 'shoulders', 'hip_flexors'], ARRAY['expert', 'cardio', 'dynamic'], ARRAY['Start in plank position', 'Jump feet apart then together', 'Maintain plank form'], 5.0, ARRAY[], false),

('Bear Crawl', 'Crawl on hands and feet with knees hovering', 'expanded_plank', 4, ARRAY['core', 'shoulders', 'quadriceps'], ARRAY['expert', 'strength', 'coordination'], ARRAY['Start on hands and knees', 'Lift knees slightly off ground', 'Crawl forward maintaining position'], 4.5, ARRAY[], false);