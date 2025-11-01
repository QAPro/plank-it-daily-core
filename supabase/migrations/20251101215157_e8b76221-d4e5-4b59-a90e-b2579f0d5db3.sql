-- Create function to enforce privacy hierarchy
CREATE OR REPLACE FUNCTION enforce_privacy_hierarchy()
RETURNS TRIGGER AS $$
BEGIN
  -- If profile is set to private, enforce strictest settings
  IF NEW.profile_visibility = 'private' THEN
    NEW.activity_visibility := 'private';
    NEW.friend_request_privacy := 'no_one';
    NEW.show_achievements := false;
    NEW.show_statistics := false;
    NEW.show_streak := false;
  END IF;
  
  -- If profile is friends_only, activity can't be more permissive
  IF NEW.profile_visibility = 'friends_only' AND NEW.activity_visibility = 'public' THEN
    NEW.activity_visibility := 'friends_only';
  END IF;
  
  -- If profile is private, friend requests must be no_one
  IF NEW.profile_visibility = 'private' AND NEW.friend_request_privacy != 'no_one' THEN
    NEW.friend_request_privacy := 'no_one';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach trigger to privacy_settings table
DROP TRIGGER IF EXISTS enforce_privacy_hierarchy_trigger ON privacy_settings;
CREATE TRIGGER enforce_privacy_hierarchy_trigger
  BEFORE INSERT OR UPDATE ON privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION enforce_privacy_hierarchy();

-- Update existing records to comply with hierarchy
UPDATE privacy_settings
SET 
  activity_visibility = 'private',
  friend_request_privacy = 'no_one',
  show_achievements = false,
  show_statistics = false,
  show_streak = false
WHERE profile_visibility = 'private';

UPDATE privacy_settings
SET activity_visibility = 'friends_only'
WHERE profile_visibility = 'friends_only' AND activity_visibility = 'public';