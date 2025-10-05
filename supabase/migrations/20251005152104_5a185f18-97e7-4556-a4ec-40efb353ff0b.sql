-- Fix the handle_new_user trigger to create all required records
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Create user profile
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Initialize user streak record
  INSERT INTO public.user_streaks (user_id, current_streak, longest_streak)
  VALUES (NEW.id, 0, 0);
  
  -- Initialize user onboarding record
  INSERT INTO public.user_onboarding (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Backfill missing user_streaks for existing users
INSERT INTO user_streaks (user_id, current_streak, longest_streak, last_workout_date)
SELECT u.id, 0, 0, NULL
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_streaks WHERE user_id = u.id
);

-- Backfill missing user_onboarding records
-- Mark as complete if user has completed any workouts
INSERT INTO user_onboarding (user_id, completed_at)
SELECT 
  u.id, 
  CASE 
    WHEN EXISTS (SELECT 1 FROM user_sessions WHERE user_id = u.id) 
    THEN COALESCE((SELECT MIN(completed_at) FROM user_sessions WHERE user_id = u.id), NOW())
    ELSE NULL
  END as completed_at
FROM public.users u
WHERE NOT EXISTS (
  SELECT 1 FROM user_onboarding WHERE user_id = u.id
);