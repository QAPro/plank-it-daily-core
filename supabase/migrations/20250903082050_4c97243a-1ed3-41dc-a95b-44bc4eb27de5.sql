-- Final security hardening - ensure all public functions have search_path set
-- Update any remaining functions that might be missing search_path

-- Fix handle_new_user function
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, username)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'username'
  );
  
  -- Initialize user streak record
  INSERT INTO public.user_streaks (user_id)
  VALUES (new.id);
  
  -- Initialize user onboarding record
  INSERT INTO public.user_onboarding (user_id)
  VALUES (new.id);
  
  -- Initialize user preferences record
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$;

-- Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fix set_updated_at function 
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NEW is distinct from OLD THEN
    NEW.updated_at := now();
  END IF;
  RETURN NEW;
END;
$$;