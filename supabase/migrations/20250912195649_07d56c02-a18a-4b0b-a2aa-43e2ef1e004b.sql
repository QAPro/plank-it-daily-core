-- Add final exercise families: Seated Exercise and Expanded Plank

-- 5. SEATED EXERCISE FAMILY (Complete 12 exercises)
INSERT INTO plank_exercises (name, description, instructions, difficulty_level, category, primary_muscles, equipment_needed, tags, is_beginner_friendly, estimated_calories_per_minute)
VALUES 
-- Beginner Seated
('Seated Arm Raises', 'Arm lifting while seated', ARRAY['Sit tall in chair', 'Raise arms overhead', 'Lower with control'], 1, 'seated_exercise', ARRAY['shoulders', 'arms'], ARRAY['chair'], ARRAY['strength', 'seated', 'beginner'], true, 1.5),
('Seated Marching', 'Leg marching while seated', ARRAY['Sit tall in chair', 'Lift knees alternately', 'Swing arms naturally'], 1, 'seated_exercise', ARRAY['hip_flexors', 'core'], ARRAY['chair'], ARRAY['cardio', 'seated', 'beginner'], true, 2.5),
('Seated Ankle Circles', 'Ankle mobility while seated', ARRAY['Sit in chair', 'Lift one foot off ground', 'Make circles with ankle'], 1, 'seated_exercise', ARRAY['ankles', 'calves'], ARRAY['chair'], ARRAY['mobility', 'seated', 'beginner'], true, 1.2),
('Seated Shoulder Rolls', 'Shoulder mobility exercise', ARRAY['Sit tall in chair', 'Roll shoulders backward', 'Then forward in circles'], 1, 'seated_exercise', ARRAY['shoulders', 'upper_back'], ARRAY['chair'], ARRAY['mobility', 'seated', 'beginner'], true, 1.0),

-- Intermediate Seated
('Seated Leg Extensions', 'Leg strengthening while seated', ARRAY['Sit in chair', 'Extend one leg straight out', 'Hold then lower, alternate legs'], 2, 'seated_exercise', ARRAY['quadriceps', 'hip_flexors'], ARRAY['chair'], ARRAY['strength', 'seated', 'intermediate'], false, 2.0),
('Seated Punches', 'Boxing movements while seated', ARRAY['Sit tall in chair', 'Perform alternating punches', 'Engage core throughout'], 2, 'seated_exercise', ARRAY['arms', 'shoulders', 'core'], ARRAY['chair'], ARRAY['cardio', 'seated', 'intermediate'], false, 3.0),
('Seated Torso Twists', 'Rotational core work seated', ARRAY['Sit tall in chair', 'Rotate torso left and right', 'Keep hips facing forward'], 2, 'seated_exercise', ARRAY['obliques', 'core'], ARRAY['chair'], ARRAY['core', 'seated', 'intermediate'], false, 2.5),
('Seated Knee-to-Chest', 'Hip flexor strengthening', ARRAY['Sit in chair', 'Bring one knee toward chest', 'Hold then lower, alternate'], 2, 'seated_exercise', ARRAY['hip_flexors', 'core'], ARRAY['chair'], ARRAY['flexibility', 'seated', 'intermediate'], false, 2.2),

-- Advanced Seated
('Seated Balance Challenges', 'Core stability while seated', ARRAY['Sit on edge of chair', 'Lift feet off ground', 'Balance using core'], 3, 'seated_exercise', ARRAY['core', 'stabilizers'], ARRAY['chair'], ARRAY['balance', 'seated', 'advanced'], false, 3.5),
('Seated Russian Twists', 'Advanced rotational core', ARRAY['Sit on edge of chair', 'Lean back slightly', 'Rotate side to side with control'], 3, 'seated_exercise', ARRAY['obliques', 'core'], ARRAY['chair'], ARRAY['core', 'seated', 'advanced'], false, 4.0),
('Seated Leg Lift Holds', 'Isometric leg strengthening', ARRAY['Sit in chair', 'Lift legs and hold position', 'Focus on core engagement'], 3, 'seated_exercise', ARRAY['hip_flexors', 'core', 'quadriceps'], ARRAY['chair'], ARRAY['strength', 'seated', 'advanced'], false, 3.8),
('Seated Dynamic Movements', 'Multi-exercise seated flow', ARRAY['Combine various seated exercises', 'Flow between movements', 'Maintain seated position'], 3, 'seated_exercise', ARRAY['full_body'], ARRAY['chair'], ARRAY['functional', 'seated', 'advanced'], false, 4.2),

-- 6. EXPANDED PLANK FAMILY (Complete 16 exercises including existing)
-- Beginner Planks
('Wall Plank', 'Plank against wall', ARRAY['Stand arm-length from wall', 'Place hands on wall', 'Hold plank position against wall'], 1, 'expanded_plank', ARRAY['core', 'shoulders'], ARRAY['wall'], ARRAY['core', 'isometric', 'beginner'], true, 2.0),
('Incline Plank (hands on couch/chair)', 'Elevated hands plank', ARRAY['Place hands on couch or chair', 'Step feet back into plank', 'Hold position'], 1, 'expanded_plank', ARRAY['core', 'shoulders', 'arms'], ARRAY['couch', 'chair'], ARRAY['core', 'isometric', 'beginner'], true, 2.5),
('Knee Plank', 'Plank on knees', ARRAY['Start on hands and knees', 'Lower to forearms if desired', 'Hold plank position'], 1, 'expanded_plank', ARRAY['core', 'shoulders'], ARRAY[]::text[], ARRAY['core', 'isometric', 'beginner'], true, 2.2),
('Modified Side Plank (knees down)', 'Side plank on knees', ARRAY['Lie on side', 'Support on forearm', 'Lift hips with knees down'], 1, 'expanded_plank', ARRAY['core', 'obliques', 'shoulders'], ARRAY[]::text[], ARRAY['core', 'isometric', 'beginner'], true, 2.8),

-- Intermediate Planks
('Standard Plank', 'Classic plank hold', ARRAY['Start in push-up position', 'Hold body in straight line', 'Engage core throughout'], 2, 'expanded_plank', ARRAY['core', 'shoulders', 'arms'], ARRAY[]::text[], ARRAY['core', 'isometric', 'intermediate'], false, 3.5),
('Side Plank', 'Lateral core strengthening', ARRAY['Lie on side', 'Support on forearm', 'Lift hips creating straight line'], 2, 'expanded_plank', ARRAY['obliques', 'core', 'shoulders'], ARRAY[]::text[], ARRAY['core', 'isometric', 'intermediate'], false, 3.8),
('Plank with Leg Lifts', 'Plank with dynamic movement', ARRAY['Hold plank position', 'Lift one leg off ground', 'Lower and alternate legs'], 2, 'expanded_plank', ARRAY['core', 'glutes', 'shoulders'], ARRAY[]::text[], ARRAY['core', 'dynamic', 'intermediate'], false, 4.2),
('Forearm Plank', 'Plank on forearms', ARRAY['Start on forearms and toes', 'Hold body in straight line', 'Engage core and glutes'], 2, 'expanded_plank', ARRAY['core', 'shoulders'], ARRAY[]::text[], ARRAY['core', 'isometric', 'intermediate'], false, 3.6),

-- Advanced Planks
('Single-Arm Plank', 'Plank with arm removed', ARRAY['Hold plank position', 'Lift one arm off ground', 'Maintain balance and form'], 3, 'expanded_plank', ARRAY['core', 'shoulders', 'stabilizers'], ARRAY[]::text[], ARRAY['core', 'balance', 'advanced'], false, 5.0),
('Plank with Arm Reaches', 'Plank with arm extensions', ARRAY['Hold plank position', 'Reach one arm forward', 'Return and alternate arms'], 3, 'expanded_plank', ARRAY['core', 'shoulders', 'stabilizers'], ARRAY[]::text[], ARRAY['core', 'dynamic', 'advanced'], false, 5.2),
('Plank Up-Downs', 'Transitioning plank movement', ARRAY['Start in plank', 'Lower to forearms one arm at a time', 'Return to plank position'], 3, 'expanded_plank', ARRAY['core', 'shoulders', 'arms'], ARRAY[]::text[], ARRAY['core', 'dynamic', 'advanced'], false, 6.5),
('Push-Up Hold (top position)', 'Static push-up position hold', ARRAY['Get into push-up position', 'Hold at top of push-up', 'Maintain straight line'], 3, 'expanded_plank', ARRAY['chest', 'shoulders', 'core', 'arms'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'advanced'], false, 4.8),

-- Expert Planks  
('Single-Arm Single-Leg Plank', 'Ultimate plank challenge', ARRAY['Hold plank position', 'Lift opposite arm and leg', 'Hold then switch sides'], 4, 'expanded_plank', ARRAY['core', 'stabilizers', 'full_body'], ARRAY[]::text[], ARRAY['core', 'balance', 'expert'], false, 7.0),
('Push-Up Hold (bottom position)', 'Bottom push-up position hold', ARRAY['Lower to bottom of push-up', 'Hold position just above ground', 'Maintain proper form'], 4, 'expanded_plank', ARRAY['chest', 'shoulders', 'core', 'arms'], ARRAY[]::text[], ARRAY['strength', 'isometric', 'expert'], false, 6.8),
('Plank to Pike', 'Dynamic plank to pike movement', ARRAY['Start in plank position', 'Pike hips up toward ceiling', 'Return to plank'], 4, 'expanded_plank', ARRAY['core', 'shoulders', 'hamstrings'], ARRAY[]::text[], ARRAY['core', 'dynamic', 'expert'], false, 7.5),
('Dynamic Plank Variations', 'Advanced plank flow', ARRAY['Combine various plank movements', 'Flow between positions', 'Maintain core engagement'], 4, 'expanded_plank', ARRAY['full_body', 'core'], ARRAY[]::text[], ARRAY['functional', 'dynamic', 'expert'], false, 8.0);