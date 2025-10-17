-- Fix user_sessions foreign key to reference new exercises table

-- First, set orphaned exercise_id values to NULL (sessions from old plank_exercises table)
UPDATE public.user_sessions 
SET exercise_id = NULL 
WHERE exercise_id NOT IN (SELECT id FROM public.exercises);

-- Drop old foreign key to plank_exercises
ALTER TABLE public.user_sessions 
  DROP CONSTRAINT IF EXISTS user_sessions_exercise_id_fkey;

-- Add new foreign key to exercises table
ALTER TABLE public.user_sessions 
  ADD CONSTRAINT user_sessions_exercise_id_fkey 
  FOREIGN KEY (exercise_id) 
  REFERENCES public.exercises(id) 
  ON DELETE SET NULL;