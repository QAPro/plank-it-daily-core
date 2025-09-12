-- Add remaining exercise families: Cardio, Standing Movement, Seated Exercise, and Expanded Plank

-- 3. WALKING/CARDIO FAMILY (Complete 12 exercises)
INSERT INTO plank_exercises (name, description, instructions, difficulty_level, category, primary_muscles, equipment_needed, tags, is_beginner_friendly, estimated_calories_per_minute)
VALUES 
-- Beginner Cardio
('Slow Indoor Walking', 'Gentle walking pace indoors', ARRAY['Walk at comfortable pace indoors', 'Focus on steady rhythm', 'Maintain proper posture throughout'], 1, 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'low_impact', 'beginner'], true, 3.5),
('Seated Marching', 'Marching motion while seated', ARRAY['Sit tall in chair', 'Lift knees alternately in marching motion', 'Swing arms naturally'], 1, 'cardio', ARRAY['hip_flexors', 'core'], ARRAY['chair'], ARRAY['cardio', 'seated', 'beginner'], true, 2.5),
('Standing Marching in Place', 'Marching without moving forward', ARRAY['Stand with good posture', 'March in place lifting knees', 'Swing arms naturally'], 1, 'cardio', ARRAY['legs', 'core', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'standing', 'beginner'], true, 3.0),
('Gentle Arm Swings While Walking', 'Walking with arm movements', ARRAY['Walk at slow pace', 'Add gentle arm swinging motions', 'Coordinate arms with walking rhythm'], 1, 'cardio', ARRAY['legs', 'arms', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'low_impact', 'beginner'], true, 4.0),

-- Intermediate Cardio
('Brisk Walking', 'Fast-paced walking', ARRAY['Walk at brisk pace', 'Maintain good posture', 'Keep steady breathing pattern'], 2, 'cardio', ARRAY['legs', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'moderate_impact', 'intermediate'], false, 5.5),
('Walking with High Knees', 'Walking with exaggerated knee lifts', ARRAY['Walk forward', 'Lift knees higher than normal', 'Engage core throughout movement'], 2, 'cardio', ARRAY['legs', 'hip_flexors', 'core'], ARRAY[]::text[], ARRAY['cardio', 'moderate_impact', 'intermediate'], false, 6.0),
('Walking with Arm Circles', 'Walking combined with arm circles', ARRAY['Walk at moderate pace', 'Perform forward and backward arm circles', 'Coordinate movement'], 2, 'cardio', ARRAY['legs', 'shoulders', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'moderate_impact', 'intermediate'], false, 5.8),
('Stair Step-Ups', 'Stepping up and down stairs', ARRAY['Step up onto stair or platform', 'Step down with control', 'Alternate lead leg'], 2, 'cardio', ARRAY['legs', 'glutes', 'cardiovascular'], ARRAY['stairs'], ARRAY['cardio', 'moderate_impact', 'intermediate'], false, 7.0),

-- Advanced Cardio
('Walking Lunges', 'Lunges while moving forward', ARRAY['Perform lunges while walking forward', 'Alternate legs with each step', 'Maintain proper form'], 3, 'cardio', ARRAY['legs', 'glutes', 'core'], ARRAY[]::text[], ARRAY['cardio', 'strength', 'advanced'], false, 8.5),
('Walking with Knee-to-Chest', 'Walking with high knee pulls', ARRAY['Walk forward', 'Pull knees to chest alternately', 'Engage core and hip flexors'], 3, 'cardio', ARRAY['legs', 'hip_flexors', 'core'], ARRAY[]::text[], ARRAY['cardio', 'moderate_impact', 'advanced'], false, 7.5),
('Fast-Paced Marching', 'High-intensity marching in place', ARRAY['March in place at fast pace', 'High knee lifts', 'Vigorous arm swings'], 3, 'cardio', ARRAY['legs', 'core', 'cardiovascular'], ARRAY[]::text[], ARRAY['cardio', 'high_impact', 'advanced'], false, 9.0),
('Walking with Resistance (backpack)', 'Walking with added weight', ARRAY['Wear weighted backpack', 'Walk at moderate to brisk pace', 'Maintain good posture'], 3, 'cardio', ARRAY['legs', 'core', 'cardiovascular'], ARRAY['backpack', 'weights'], ARRAY['cardio', 'resistance', 'advanced'], false, 8.0),

-- 4. STANDING MOVEMENT FAMILY (Complete 12 exercises)
-- Beginner Standing
('Calf Raises', 'Rising up on toes', ARRAY['Stand with feet hip-width apart', 'Rise up on toes', 'Lower slowly with control'], 1, 'standing_movement', ARRAY['calves'], ARRAY[]::text[], ARRAY['strength', 'standing', 'beginner'], true, 2.0),
('Arm Circles', 'Circular arm movements', ARRAY['Stand with arms extended to sides', 'Make small then large circles', 'Forward and backward'], 1, 'standing_movement', ARRAY['shoulders', 'arms'], ARRAY[]::text[], ARRAY['mobility', 'standing', 'beginner'], true, 1.8),
('Gentle Marching in Place', 'Light marching movement', ARRAY['Stand with good posture', 'Lift knees gently in place', 'Swing arms naturally'], 1, 'standing_movement', ARRAY['legs', 'core'], ARRAY[]::text[], ARRAY['cardio', 'standing', 'beginner'], true, 2.5),
('Standing Side Bends', 'Lateral torso stretches', ARRAY['Stand with feet hip-width apart', 'Bend gently to one side', 'Return to center and repeat other side'], 1, 'standing_movement', ARRAY['obliques', 'core'], ARRAY[]::text[], ARRAY['flexibility', 'standing', 'beginner'], true, 1.5),

-- Intermediate Standing
('Standing Knee Lifts', 'Alternating knee raises', ARRAY['Stand tall', 'Lift one knee toward chest', 'Alternate legs with control'], 2, 'standing_movement', ARRAY['hip_flexors', 'core', 'legs'], ARRAY[]::text[], ARRAY['strength', 'standing', 'intermediate'], false, 3.5),
('Standing Leg Swings', 'Dynamic leg swinging', ARRAY['Hold wall or chair for balance', 'Swing leg forward and back', 'Switch legs'], 2, 'standing_movement', ARRAY['hip_flexors', 'glutes', 'legs'], ARRAY['wall'], ARRAY['mobility', 'standing', 'intermediate'], false, 3.0),
('Standing Torso Twists', 'Rotational core movements', ARRAY['Stand with arms crossed or on hips', 'Rotate torso left and right', 'Keep hips facing forward'], 2, 'standing_movement', ARRAY['obliques', 'core'], ARRAY[]::text[], ARRAY['mobility', 'standing', 'intermediate'], false, 2.8),
('Standing Heel-to-Butt', 'Hamstring activation', ARRAY['Stand tall', 'Bring heel toward buttocks', 'Alternate legs'], 2, 'standing_movement', ARRAY['hamstrings', 'quadriceps'], ARRAY[]::text[], ARRAY['mobility', 'standing', 'intermediate'], false, 3.2),

-- Advanced Standing
('Single Leg Balance', 'Balance challenge on one leg', ARRAY['Stand on one leg', 'Maintain balance', 'Switch legs after hold time'], 3, 'standing_movement', ARRAY['core', 'stabilizers', 'legs'], ARRAY[]::text[], ARRAY['balance', 'standing', 'advanced'], false, 2.5),
('Standing Figure-4 Stretch', 'Hip flexibility in standing', ARRAY['Stand on one leg', 'Place ankle on opposite thigh', 'Gentle stretch hold'], 3, 'standing_movement', ARRAY['hips', 'glutes'], ARRAY[]::text[], ARRAY['flexibility', 'standing', 'advanced'], false, 2.0),
('Dynamic Standing Movements', 'Multi-planar movement patterns', ARRAY['Combine various standing movements', 'Flow between exercises', 'Maintain control throughout'], 3, 'standing_movement', ARRAY['full_body'], ARRAY[]::text[], ARRAY['functional', 'standing', 'advanced'], false, 4.5),
('Standing Balance with Eyes Closed', 'Advanced balance challenge', ARRAY['Stand on one leg', 'Close eyes', 'Maintain balance using proprioception'], 3, 'standing_movement', ARRAY['core', 'stabilizers'], ARRAY[]::text[], ARRAY['balance', 'standing', 'advanced'], false, 2.8);