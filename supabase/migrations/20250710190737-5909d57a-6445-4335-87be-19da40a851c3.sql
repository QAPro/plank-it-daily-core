
-- Update the existing "Basic Plank" exercise to "Forearm Plank"
UPDATE public.plank_exercises 
SET name = 'Forearm Plank'
WHERE name = 'Basic Plank';

-- Add Knee Plank exercise
INSERT INTO public.plank_exercises (name, description, difficulty_level, instructions, image_url) VALUES
('Knee Plank', 'A beginner-friendly plank variation that reduces load while building core strength.', 1, 
 ARRAY['Start on hands and knees', 'Lower onto your forearms', 'Keep knees on the ground', 'Maintain straight line from head to knees', 'Hold the position'], null);

-- Add High Plank exercise  
INSERT INTO public.plank_exercises (name, description, difficulty_level, instructions, image_url) VALUES
('High Plank', 'A push-up position plank that engages arms and shoulders more intensively.', 2,
 ARRAY['Start in push-up position', 'Keep arms straight and hands under shoulders', 'Maintain straight line from head to heels', 'Engage core muscles', 'Hold the position'], null);
