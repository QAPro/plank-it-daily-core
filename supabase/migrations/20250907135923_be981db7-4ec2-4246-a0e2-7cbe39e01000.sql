-- Create function to update updated_at timestamp first
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create friends table 
CREATE TABLE IF NOT EXISTS public.friends (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  friend_id uuid NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, friend_id)
);

-- Enable RLS for friends table
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- Create policies for friends table
CREATE POLICY "Users can create friend requests" 
ON public.friends 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND user_id != friend_id);

CREATE POLICY "Users can view own friend relationships" 
ON public.friends 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can update friend requests to/from them" 
ON public.friends 
FOR UPDATE 
USING (auth.uid() = user_id OR auth.uid() = friend_id);

CREATE POLICY "Users can delete own friend requests" 
ON public.friends 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create friend_activities table to support in-app social posting
CREATE TABLE IF NOT EXISTS public.friend_activities (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  activity_type text NOT NULL CHECK (activity_type IN ('workout', 'achievement', 'level_up', 'streak_milestone', 'personal_best', 'challenge_complete')),
  activity_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  visibility text NOT NULL DEFAULT 'friends'::text CHECK (visibility IN ('public', 'friends', 'private')),
  shares_count integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.friend_activities ENABLE ROW LEVEL SECURITY;

-- Create policies for friend_activities
CREATE POLICY "Users can create own activities" 
ON public.friend_activities 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view public activities" 
ON public.friend_activities 
FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Users can view friends' activities" 
ON public.friend_activities 
FOR SELECT 
USING (
  visibility = 'friends' AND 
  (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM public.friends 
      WHERE (user_id = auth.uid() AND friend_id = friend_activities.user_id AND status = 'accepted')
      OR (friend_id = auth.uid() AND user_id = friend_activities.user_id AND status = 'accepted')
    )
  )
);

CREATE POLICY "Users can view own activities" 
ON public.friend_activities 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own activities" 
ON public.friend_activities 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own activities" 
ON public.friend_activities 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create friend_reactions table for activity reactions
CREATE TABLE IF NOT EXISTS public.friend_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid NOT NULL REFERENCES public.friend_activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  reaction_type text NOT NULL CHECK (reaction_type IN ('like', 'love', 'fire', 'strong', 'clap')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

-- Enable RLS for friend_reactions
ALTER TABLE public.friend_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for friend_reactions
CREATE POLICY "Users can create reactions" 
ON public.friend_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view reactions on visible activities" 
ON public.friend_reactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.friend_activities fa 
    WHERE fa.id = activity_id AND (
      fa.visibility = 'public' OR
      fa.user_id = auth.uid() OR
      (fa.visibility = 'friends' AND EXISTS (
        SELECT 1 FROM public.friends f
        WHERE (f.user_id = auth.uid() AND f.friend_id = fa.user_id AND f.status = 'accepted')
        OR (f.friend_id = auth.uid() AND f.user_id = fa.user_id AND f.status = 'accepted')
      ))
    )
  )
);

CREATE POLICY "Users can delete own reactions" 
ON public.friend_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create activity_comments table for activity comments  
CREATE TABLE IF NOT EXISTS public.activity_comments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id uuid NOT NULL REFERENCES public.friend_activities(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  content text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for activity_comments
ALTER TABLE public.activity_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for activity_comments
CREATE POLICY "Users can create comments on visible activities" 
ON public.activity_comments 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.friend_activities fa 
    WHERE fa.id = activity_id AND (
      fa.visibility = 'public' OR
      fa.user_id = auth.uid() OR
      (fa.visibility = 'friends' AND EXISTS (
        SELECT 1 FROM public.friends f
        WHERE (f.user_id = auth.uid() AND f.friend_id = fa.user_id AND f.status = 'accepted')
        OR (f.friend_id = auth.uid() AND f.user_id = fa.user_id AND f.status = 'accepted')
      ))
    )
  )
);

CREATE POLICY "Users can view comments on visible activities" 
ON public.activity_comments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.friend_activities fa 
    WHERE fa.id = activity_id AND (
      fa.visibility = 'public' OR
      fa.user_id = auth.uid() OR
      (fa.visibility = 'friends' AND EXISTS (
        SELECT 1 FROM public.friends f
        WHERE (f.user_id = auth.uid() AND f.friend_id = fa.user_id AND f.status = 'accepted')
        OR (f.friend_id = auth.uid() AND f.user_id = fa.user_id AND f.status = 'accepted')
      ))
    )
  )
);

CREATE POLICY "Users can update own comments" 
ON public.activity_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments" 
ON public.activity_comments 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_friends_user_id ON public.friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend_id ON public.friends(friend_id);
CREATE INDEX IF NOT EXISTS idx_friends_status ON public.friends(status);
CREATE INDEX IF NOT EXISTS idx_friend_activities_user_id ON public.friend_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_friend_activities_created_at ON public.friend_activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_friend_activities_visibility ON public.friend_activities(visibility);
CREATE INDEX IF NOT EXISTS idx_friend_reactions_activity_id ON public.friend_reactions(activity_id);
CREATE INDEX IF NOT EXISTS idx_activity_comments_activity_id ON public.activity_comments(activity_id);

-- Create triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_friends_updated_at ON public.friends;
CREATE TRIGGER update_friends_updated_at
BEFORE UPDATE ON public.friends
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_friend_activities_updated_at ON public.friend_activities;
CREATE TRIGGER update_friend_activities_updated_at
BEFORE UPDATE ON public.friend_activities
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_activity_comments_updated_at ON public.activity_comments;
CREATE TRIGGER update_activity_comments_updated_at
BEFORE UPDATE ON public.activity_comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();