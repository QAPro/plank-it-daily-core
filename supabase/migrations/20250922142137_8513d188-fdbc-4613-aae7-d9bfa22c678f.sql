-- Fix security issues from previous migration (handle existing policies)

-- 1. Fix function search path mutable issue
CREATE OR REPLACE FUNCTION get_exercise_family(exercise_category text, difficulty_level integer)
RETURNS text
LANGUAGE sql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE 
    WHEN exercise_category = 'planking' AND difficulty_level <= 2 THEN 'basic_planking'
    WHEN exercise_category = 'planking' AND difficulty_level >= 3 THEN 'advanced_planking'
    WHEN exercise_category = 'core' THEN 'core'
    WHEN exercise_category = 'leg_lift' THEN 'leg_lift'
    WHEN exercise_category = 'seated_exercise' THEN 'seated_exercise'
    WHEN exercise_category = 'standing_movement' THEN 'standing_movement'
    WHEN exercise_category IN ('cardio', 'strength') THEN 'cardio_strength'
    ELSE exercise_category
  END;
$$;

-- 2. Enable RLS on exercise_families table (if not already enabled)
ALTER TABLE exercise_families ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Anyone can view exercise families" ON exercise_families;
DROP POLICY IF EXISTS "Admins can manage exercise families" ON exercise_families;

-- Allow everyone to read exercise families (they are reference data)
CREATE POLICY "Anyone can view exercise families" 
ON exercise_families 
FOR SELECT 
USING (true);

-- Only admins can modify exercise families
CREATE POLICY "Admins can manage exercise families" 
ON exercise_families 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
))
WITH CHECK (EXISTS (
  SELECT 1 FROM user_roles 
  WHERE user_id = auth.uid() 
  AND role = 'admin'::app_role
));