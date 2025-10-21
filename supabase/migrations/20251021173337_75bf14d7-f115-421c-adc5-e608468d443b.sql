-- Create cheers table
CREATE TABLE public.cheers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  to_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_id UUID NOT NULL REFERENCES public.friend_activities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_activity_cheer UNIQUE (from_user_id, activity_id)
);

-- Enable RLS on cheers
ALTER TABLE public.cheers ENABLE ROW LEVEL SECURITY;

-- Cheers RLS Policies
CREATE POLICY "Users can insert their own cheers"
ON public.cheers
FOR INSERT
WITH CHECK (auth.uid() = from_user_id);

CREATE POLICY "Users can view cheers on visible activities"
ON public.cheers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM friend_activities fa
    WHERE fa.id = cheers.activity_id
    AND (
      fa.visibility = 'public'
      OR fa.user_id = auth.uid()
      OR (
        fa.visibility = 'friends'
        AND EXISTS (
          SELECT 1 FROM friends f
          WHERE (
            (f.user_id = auth.uid() AND f.friend_id = fa.user_id AND f.status = 'accepted')
            OR (f.friend_id = auth.uid() AND f.user_id = fa.user_id AND f.status = 'accepted')
          )
        )
      )
    )
  )
);

CREATE POLICY "Users can delete their own cheers"
ON public.cheers
FOR DELETE
USING (auth.uid() = from_user_id);

-- Create user_social_stats table
CREATE TABLE public.user_social_stats (
  user_id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  cheers_given INTEGER NOT NULL DEFAULT 0,
  cheers_received INTEGER NOT NULL DEFAULT 0,
  friends_count INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_social_stats
ALTER TABLE public.user_social_stats ENABLE ROW LEVEL SECURITY;

-- User social stats RLS Policies
CREATE POLICY "Users can view own stats"
ON public.user_social_stats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can view stats of friends"
ON public.user_social_stats
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM friends f
    WHERE (
      (f.user_id = auth.uid() AND f.friend_id = user_social_stats.user_id AND f.status = 'accepted')
      OR (f.friend_id = auth.uid() AND f.user_id = user_social_stats.user_id AND f.status = 'accepted')
    )
  )
);

CREATE POLICY "Users can insert their own stats"
ON public.user_social_stats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats"
ON public.user_social_stats
FOR UPDATE
USING (auth.uid() = user_id);

-- Create referrals table
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Referrals RLS Policies
CREATE POLICY "Users can view own referrals"
ON public.referrals
FOR SELECT
USING (auth.uid() = referrer_user_id OR auth.uid() = referred_user_id);

CREATE POLICY "Users can create referrals"
ON public.referrals
FOR INSERT
WITH CHECK (auth.uid() = referrer_user_id);

CREATE POLICY "System can update referrals"
ON public.referrals
FOR UPDATE
USING (true);

-- Add cheer_count to friend_activities
ALTER TABLE public.friend_activities ADD COLUMN IF NOT EXISTS cheer_count INTEGER NOT NULL DEFAULT 0;

-- Function to update social stats when cheers change
CREATE OR REPLACE FUNCTION update_social_stats_on_cheer()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment cheers_given for the giver
    INSERT INTO user_social_stats (user_id, cheers_given, updated_at)
    VALUES (NEW.from_user_id, 1, now())
    ON CONFLICT (user_id)
    DO UPDATE SET 
      cheers_given = user_social_stats.cheers_given + 1,
      updated_at = now();
    
    -- Increment cheers_received for the receiver
    INSERT INTO user_social_stats (user_id, cheers_received, updated_at)
    VALUES (NEW.to_user_id, 1, now())
    ON CONFLICT (user_id)
    DO UPDATE SET 
      cheers_received = user_social_stats.cheers_received + 1,
      updated_at = now();
    
    -- Increment cheer_count on activity
    UPDATE friend_activities
    SET cheer_count = cheer_count + 1
    WHERE id = NEW.activity_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement cheers_given for the giver
    UPDATE user_social_stats
    SET cheers_given = GREATEST(0, cheers_given - 1),
        updated_at = now()
    WHERE user_id = OLD.from_user_id;
    
    -- Decrement cheers_received for the receiver
    UPDATE user_social_stats
    SET cheers_received = GREATEST(0, cheers_received - 1),
        updated_at = now()
    WHERE user_id = OLD.to_user_id;
    
    -- Decrement cheer_count on activity
    UPDATE friend_activities
    SET cheer_count = GREATEST(0, cheer_count - 1)
    WHERE id = OLD.activity_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for updating social stats on cheer changes
CREATE TRIGGER trigger_update_social_stats_on_cheer
AFTER INSERT OR DELETE ON public.cheers
FOR EACH ROW
EXECUTE FUNCTION update_social_stats_on_cheer();

-- Function to update friends_count in social stats
CREATE OR REPLACE FUNCTION update_friends_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    IF NEW.status = 'accepted' THEN
      -- Update friend count for user_id
      INSERT INTO user_social_stats (user_id, friends_count, updated_at)
      VALUES (NEW.user_id, 1, now())
      ON CONFLICT (user_id)
      DO UPDATE SET 
        friends_count = (
          SELECT COUNT(*) FROM friends 
          WHERE (user_id = NEW.user_id OR friend_id = NEW.user_id) 
          AND status = 'accepted'
        ),
        updated_at = now();
      
      -- Update friend count for friend_id
      INSERT INTO user_social_stats (user_id, friends_count, updated_at)
      VALUES (NEW.friend_id, 1, now())
      ON CONFLICT (user_id)
      DO UPDATE SET 
        friends_count = (
          SELECT COUNT(*) FROM friends 
          WHERE (user_id = NEW.friend_id OR friend_id = NEW.friend_id) 
          AND status = 'accepted'
        ),
        updated_at = now();
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Update friend count for user_id
    UPDATE user_social_stats
    SET friends_count = (
      SELECT COUNT(*) FROM friends 
      WHERE (user_id = OLD.user_id OR friend_id = OLD.user_id) 
      AND status = 'accepted'
    ),
    updated_at = now()
    WHERE user_id = OLD.user_id;
    
    -- Update friend count for friend_id
    UPDATE user_social_stats
    SET friends_count = (
      SELECT COUNT(*) FROM friends 
      WHERE (user_id = OLD.friend_id OR friend_id = OLD.friend_id) 
      AND status = 'accepted'
    ),
    updated_at = now()
    WHERE user_id = OLD.friend_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger for updating friends count
CREATE TRIGGER trigger_update_friends_count
AFTER INSERT OR UPDATE OR DELETE ON public.friends
FOR EACH ROW
EXECUTE FUNCTION update_friends_count();

-- Clean up old data
DELETE FROM activity_comments;
DELETE FROM friend_reactions;