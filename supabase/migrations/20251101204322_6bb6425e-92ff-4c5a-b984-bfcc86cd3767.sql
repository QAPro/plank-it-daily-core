-- Create privacy_settings table
CREATE TABLE public.privacy_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_visibility TEXT DEFAULT 'public' CHECK (profile_visibility IN ('public', 'friends_only', 'private')),
  activity_visibility TEXT DEFAULT 'friends_only' CHECK (activity_visibility IN ('public', 'friends_only', 'private')),
  friend_request_privacy TEXT DEFAULT 'everyone' CHECK (friend_request_privacy IN ('everyone', 'friends_of_friends', 'no_one')),
  show_achievements BOOLEAN DEFAULT true,
  show_statistics BOOLEAN DEFAULT true,
  show_streak BOOLEAN DEFAULT true,
  allow_friend_suggestions BOOLEAN DEFAULT true,
  allow_tagging BOOLEAN DEFAULT true,
  data_collection_analytics BOOLEAN DEFAULT true,
  data_collection_personalization BOOLEAN DEFAULT true,
  marketing_emails BOOLEAN DEFAULT false,
  product_updates BOOLEAN DEFAULT true,
  privacy_consent_given BOOLEAN DEFAULT false,
  privacy_consent_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.privacy_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own privacy settings" 
  ON public.privacy_settings FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own privacy settings" 
  ON public.privacy_settings FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own privacy settings" 
  ON public.privacy_settings FOR UPDATE 
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_privacy_settings_user_id ON public.privacy_settings(user_id);
CREATE INDEX idx_privacy_settings_profile_visibility ON public.privacy_settings(profile_visibility);
CREATE INDEX idx_privacy_settings_activity_visibility ON public.privacy_settings(activity_visibility);

-- Trigger for updated_at
CREATE TRIGGER update_privacy_settings_updated_at
  BEFORE UPDATE ON public.privacy_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create privacy settings for new users
CREATE OR REPLACE FUNCTION public.create_default_privacy_settings()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.privacy_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_user_created_create_privacy_settings
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.create_default_privacy_settings();

-- Backfill privacy settings for existing users
INSERT INTO public.privacy_settings (user_id)
SELECT id FROM public.users
ON CONFLICT (user_id) DO NOTHING;

-- Security definer function: Get user privacy settings (respects visibility)
CREATE OR REPLACE FUNCTION public.get_user_privacy_settings(_user_id UUID)
RETURNS TABLE(
  profile_visibility TEXT,
  activity_visibility TEXT,
  friend_request_privacy TEXT,
  show_achievements BOOLEAN,
  show_statistics BOOLEAN,
  show_streak BOOLEAN,
  allow_friend_suggestions BOOLEAN,
  allow_tagging BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ps.profile_visibility,
    ps.activity_visibility,
    ps.friend_request_privacy,
    ps.show_achievements,
    ps.show_statistics,
    ps.show_streak,
    ps.allow_friend_suggestions,
    ps.allow_tagging
  FROM public.privacy_settings ps
  WHERE ps.user_id = _user_id;
END;
$$;

-- Security definer function: Check if viewer can see target user's profile
CREATE OR REPLACE FUNCTION public.can_view_user_profile(_viewer_id UUID, _target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_visibility TEXT;
  are_friends BOOLEAN;
BEGIN
  -- User can always view their own profile
  IF _viewer_id = _target_user_id THEN
    RETURN true;
  END IF;
  
  -- Get target user's profile visibility setting
  SELECT profile_visibility INTO target_visibility
  FROM public.privacy_settings
  WHERE user_id = _target_user_id;
  
  -- If no settings found, default to public
  IF target_visibility IS NULL THEN
    RETURN true;
  END IF;
  
  -- Public profiles are visible to everyone
  IF target_visibility = 'public' THEN
    RETURN true;
  END IF;
  
  -- Private profiles are only visible to the user themselves
  IF target_visibility = 'private' THEN
    RETURN false;
  END IF;
  
  -- Friends only: check if they are friends
  IF target_visibility = 'friends_only' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.friends
      WHERE ((user_id = _viewer_id AND friend_id = _target_user_id)
         OR (user_id = _target_user_id AND friend_id = _viewer_id))
        AND status = 'accepted'
    ) INTO are_friends;
    
    RETURN are_friends;
  END IF;
  
  RETURN false;
END;
$$;

-- Security definer function: Check if sender can send friend request to receiver
CREATE OR REPLACE FUNCTION public.can_send_friend_request(_sender_id UUID, _receiver_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  receiver_privacy TEXT;
  are_friends_of_friends BOOLEAN;
BEGIN
  -- Can't send request to yourself
  IF _sender_id = _receiver_id THEN
    RETURN false;
  END IF;
  
  -- Get receiver's friend request privacy setting
  SELECT friend_request_privacy INTO receiver_privacy
  FROM public.privacy_settings
  WHERE user_id = _receiver_id;
  
  -- If no settings found, default to everyone
  IF receiver_privacy IS NULL THEN
    RETURN true;
  END IF;
  
  -- No one can send requests
  IF receiver_privacy = 'no_one' THEN
    RETURN false;
  END IF;
  
  -- Everyone can send requests
  IF receiver_privacy = 'everyone' THEN
    RETURN true;
  END IF;
  
  -- Friends of friends: check if they have mutual friends
  IF receiver_privacy = 'friends_of_friends' THEN
    SELECT EXISTS(
      SELECT 1 
      FROM public.friends f1
      JOIN public.friends f2 ON (
        (f1.friend_id = f2.user_id OR f1.friend_id = f2.friend_id OR f1.user_id = f2.user_id OR f1.user_id = f2.friend_id)
      )
      WHERE f1.status = 'accepted' AND f2.status = 'accepted'
        AND ((f1.user_id = _sender_id OR f1.friend_id = _sender_id))
        AND ((f2.user_id = _receiver_id OR f2.friend_id = _receiver_id))
        AND f1.id != f2.id
    ) INTO are_friends_of_friends;
    
    RETURN are_friends_of_friends;
  END IF;
  
  RETURN false;
END;
$$;

-- Security definer function: Check if viewer can see target user's activity
CREATE OR REPLACE FUNCTION public.can_view_user_activity(_viewer_id UUID, _target_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_visibility TEXT;
  are_friends BOOLEAN;
BEGIN
  -- User can always view their own activity
  IF _viewer_id = _target_user_id THEN
    RETURN true;
  END IF;
  
  -- Get target user's activity visibility setting
  SELECT activity_visibility INTO target_visibility
  FROM public.privacy_settings
  WHERE user_id = _target_user_id;
  
  -- If no settings found, default to friends_only
  IF target_visibility IS NULL THEN
    target_visibility := 'friends_only';
  END IF;
  
  -- Public activities are visible to everyone
  IF target_visibility = 'public' THEN
    RETURN true;
  END IF;
  
  -- Private activities are only visible to the user themselves
  IF target_visibility = 'private' THEN
    RETURN false;
  END IF;
  
  -- Friends only: check if they are friends
  IF target_visibility = 'friends_only' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.friends
      WHERE ((user_id = _viewer_id AND friend_id = _target_user_id)
         OR (user_id = _target_user_id AND friend_id = _viewer_id))
        AND status = 'accepted'
    ) INTO are_friends;
    
    RETURN are_friends;
  END IF;
  
  RETURN false;
END;
$$;