
-- Add Wall Plank exercise as difficulty level 1
INSERT INTO public.plank_exercises (name, description, difficulty_level, instructions, image_url) VALUES
('Wall Plank', 'A beginner-friendly plank variation performed against a wall to build initial core strength and proper form.', 1, 
 ARRAY['Stand arm''s length from a wall', 'Place your forearms flat against the wall', 'Step your feet back to create an angle', 'Keep your body straight from head to heels', 'Hold the position while breathing normally'], null);

-- Update Forearm Plank to difficulty level 2 
UPDATE public.plank_exercises 
SET difficulty_level = 2
WHERE name = 'Forearm Plank';

-- Update other exercises to maintain proper ordering
UPDATE public.plank_exercises 
SET difficulty_level = 3
WHERE name = 'High Plank';

-- Update Knee Plank to be level 1 as well (keep as beginner option)
UPDATE public.plank_exercises 
SET difficulty_level = 1
WHERE name = 'Knee Plank';
