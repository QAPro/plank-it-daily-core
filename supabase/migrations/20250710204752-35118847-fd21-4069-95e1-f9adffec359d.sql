
-- Add username column to users table
ALTER TABLE public.users ADD COLUMN username TEXT UNIQUE;

-- Create index for faster username lookups
CREATE INDEX idx_users_username ON public.users(username);

-- Add constraint to ensure username is not empty when provided
ALTER TABLE public.users ADD CONSTRAINT username_not_empty CHECK (username IS NULL OR length(trim(username)) > 0);

-- Update the handle_new_user function to handle username from metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
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
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to find user by username or email for authentication
CREATE OR REPLACE FUNCTION public.find_user_by_username_or_email(identifier TEXT)
RETURNS TABLE(user_id UUID, email TEXT, username TEXT, full_name TEXT) AS $$
BEGIN
  RETURN QUERY
  SELECT u.id, u.email, u.username, u.full_name
  FROM public.users u
  WHERE u.username = identifier OR u.email = identifier;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
