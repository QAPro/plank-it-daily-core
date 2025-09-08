-- Create mentor relationships table
CREATE TABLE public.mentor_relationships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL,
  mentee_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  mentor_track TEXT NOT NULL,
  mentee_goals TEXT[] DEFAULT '{}',
  matched_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  rating INTEGER,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(mentor_id, mentee_id)
);

-- Enable RLS
ALTER TABLE public.mentor_relationships ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view relationships they're part of"
ON public.mentor_relationships
FOR SELECT
USING (auth.uid() = mentor_id OR auth.uid() = mentee_id);

CREATE POLICY "Users can create mentee requests"
ON public.mentor_relationships
FOR INSERT
WITH CHECK (auth.uid() = mentee_id);

CREATE POLICY "Mentors can update their relationships"
ON public.mentor_relationships
FOR UPDATE
USING (auth.uid() = mentor_id);

CREATE POLICY "Participants can update completed relationships"
ON public.mentor_relationships
FOR UPDATE
USING ((auth.uid() = mentor_id OR auth.uid() = mentee_id) AND status = 'completed');

-- Create mentor profiles table
CREATE TABLE public.mentor_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  specialization_tracks TEXT[] NOT NULL DEFAULT '{}',
  min_mentee_level INTEGER DEFAULT 1,
  max_mentees INTEGER DEFAULT 3,
  current_mentees INTEGER DEFAULT 0,
  is_accepting_mentees BOOLEAN DEFAULT true,
  mentor_since TIMESTAMP WITH TIME ZONE DEFAULT now(),
  total_mentees INTEGER DEFAULT 0,
  average_rating DECIMAL DEFAULT 0.0,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.mentor_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Anyone can view mentor profiles"
ON public.mentor_profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can create own mentor profile"
ON public.mentor_profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mentor profile"
ON public.mentor_profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Create mentor achievements table
CREATE TABLE public.mentor_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  mentor_id UUID NOT NULL,
  achievement_type TEXT NOT NULL,
  achievement_data JSONB DEFAULT '{}',
  earned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentor_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own mentor achievements"
ON public.mentor_achievements
FOR SELECT
USING (auth.uid() = mentor_id);

CREATE POLICY "System can create mentor achievements"
ON public.mentor_achievements
FOR INSERT
WITH CHECK (true);

-- Create trigger to update mentor stats
CREATE OR REPLACE FUNCTION update_mentor_stats()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'accepted' AND OLD.status = 'pending' THEN
    UPDATE mentor_profiles 
    SET current_mentees = current_mentees + 1
    WHERE user_id = NEW.mentor_id;
  ELSIF NEW.status = 'completed' AND OLD.status = 'active' THEN
    UPDATE mentor_profiles 
    SET 
      current_mentees = current_mentees - 1,
      total_mentees = total_mentees + 1,
      average_rating = CASE 
        WHEN NEW.rating IS NOT NULL THEN 
          (COALESCE(average_rating * (total_mentees - 1), 0) + NEW.rating) / total_mentees
        ELSE average_rating
      END
    WHERE user_id = NEW.mentor_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger
CREATE TRIGGER update_mentor_stats_trigger
  AFTER UPDATE ON mentor_relationships
  FOR EACH ROW
  EXECUTE FUNCTION update_mentor_stats();