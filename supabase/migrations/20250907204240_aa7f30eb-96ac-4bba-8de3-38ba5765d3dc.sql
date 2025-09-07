-- Phase 2: Social Investment Amplification Tables
-- Victory Partners (Accountability Partnership System)
CREATE TABLE public.victory_partnerships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partner1_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partner2_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  partnership_status TEXT NOT NULL DEFAULT 'pending' CHECK (partnership_status IN ('pending', 'active', 'paused', 'completed')),
  shared_goals JSONB DEFAULT '{}',
  partnership_start_date DATE,
  partnership_end_date DATE,
  check_in_frequency TEXT DEFAULT 'daily' CHECK (check_in_frequency IN ('daily', 'weekly', 'bi-weekly')),
  motivation_style TEXT DEFAULT 'encouraging' CHECK (motivation_style IN ('encouraging', 'competitive', 'casual')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(partner1_id, partner2_id)
);

-- Victory Partner Check-ins
CREATE TABLE public.victory_partner_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  partnership_id UUID NOT NULL REFERENCES public.victory_partnerships(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_type TEXT NOT NULL DEFAULT 'encouragement' CHECK (checkin_type IN ('encouragement', 'progress_share', 'goal_update', 'celebration')),
  message TEXT NOT NULL,
  workout_data JSONB,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Success Stories (Community Content Creation)
CREATE TABLE public.user_success_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_title TEXT NOT NULL,
  story_content TEXT NOT NULL,
  story_type TEXT NOT NULL DEFAULT 'transformation' CHECK (story_type IN ('transformation', 'breakthrough', 'milestone', 'inspiration', 'tip')),
  transformation_data JSONB DEFAULT '{}',
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  shares_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Success Story Reactions
CREATE TABLE public.success_story_reactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.user_success_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'inspiration' CHECK (reaction_type IN ('inspiration', 'motivation', 'amazing', 'goals', 'strength')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(story_id, user_id)
);

-- Success Story Comments
CREATE TABLE public.success_story_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  story_id UUID NOT NULL REFERENCES public.user_success_stories(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  comment_text TEXT NOT NULL,
  is_encouragement BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Community Success Challenges (User-Generated)
CREATE TABLE public.community_success_challenges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_title TEXT NOT NULL,
  challenge_description TEXT NOT NULL,
  challenge_type TEXT NOT NULL DEFAULT 'personal_growth' CHECK (challenge_type IN ('personal_growth', 'consistency', 'breakthrough', 'community', 'fun')),
  challenge_rules JSONB NOT NULL DEFAULT '{}',
  success_criteria JSONB NOT NULL DEFAULT '{}',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  max_participants INTEGER DEFAULT 50,
  current_participants INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT true,
  reward_type TEXT DEFAULT 'recognition' CHECK (reward_type IN ('recognition', 'badge', 'feature', 'community_spotlight')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Challenge Participants
CREATE TABLE public.challenge_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challenge_id UUID NOT NULL REFERENCES public.community_success_challenges(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  participation_status TEXT NOT NULL DEFAULT 'active' CHECK (participation_status IN ('active', 'completed', 'withdrew')),
  progress_data JSONB DEFAULT '{}',
  completion_percentage INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(challenge_id, user_id)
);

-- Enable RLS
ALTER TABLE public.victory_partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victory_partner_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_success_stories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_story_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.success_story_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_success_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Victory Partnerships
CREATE POLICY "Users can view partnerships they are part of" 
ON public.victory_partnerships 
FOR SELECT 
USING (auth.uid() = partner1_id OR auth.uid() = partner2_id);

CREATE POLICY "Users can create partnerships they are part of" 
ON public.victory_partnerships 
FOR INSERT 
WITH CHECK (auth.uid() = partner1_id OR auth.uid() = partner2_id);

CREATE POLICY "Partners can update their partnerships" 
ON public.victory_partnerships 
FOR UPDATE 
USING (auth.uid() = partner1_id OR auth.uid() = partner2_id);

-- RLS Policies for Partner Check-ins
CREATE POLICY "Partners can view their check-ins" 
ON public.victory_partner_checkins 
FOR SELECT 
USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

CREATE POLICY "Users can create check-ins" 
ON public.victory_partner_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Receivers can update read status" 
ON public.victory_partner_checkins 
FOR UPDATE 
USING (auth.uid() = receiver_id);

-- RLS Policies for Success Stories
CREATE POLICY "Users can view public success stories and own stories" 
ON public.user_success_stories 
FOR SELECT 
USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can create own success stories" 
ON public.user_success_stories 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own success stories" 
ON public.user_success_stories 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for Story Reactions
CREATE POLICY "Users can view reactions on public stories" 
ON public.success_story_reactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_success_stories uss 
  WHERE uss.id = success_story_reactions.story_id 
  AND (uss.is_public = true OR uss.user_id = auth.uid())
));

CREATE POLICY "Users can create reactions" 
ON public.success_story_reactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reactions" 
ON public.success_story_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for Story Comments
CREATE POLICY "Users can view comments on accessible stories" 
ON public.success_story_comments 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.user_success_stories uss 
  WHERE uss.id = success_story_comments.story_id 
  AND (uss.is_public = true OR uss.user_id = auth.uid())
));

CREATE POLICY "Users can create comments" 
ON public.success_story_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for Community Challenges
CREATE POLICY "Users can view public challenges and own challenges" 
ON public.community_success_challenges 
FOR SELECT 
USING (is_public = true OR auth.uid() = creator_id);

CREATE POLICY "Users can create challenges" 
ON public.community_success_challenges 
FOR INSERT 
WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update own challenges" 
ON public.community_success_challenges 
FOR UPDATE 
USING (auth.uid() = creator_id);

-- RLS Policies for Challenge Participants
CREATE POLICY "Users can view participants of accessible challenges" 
ON public.challenge_participants 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.community_success_challenges csc 
  WHERE csc.id = challenge_participants.challenge_id 
  AND (csc.is_public = true OR csc.creator_id = auth.uid())
));

CREATE POLICY "Users can participate in challenges" 
ON public.challenge_participants 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" 
ON public.challenge_participants 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_victory_partnerships_updated_at
BEFORE UPDATE ON public.victory_partnerships
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_success_stories_updated_at
BEFORE UPDATE ON public.user_success_stories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_challenges_updated_at
BEFORE UPDATE ON public.community_success_challenges
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();