-- Create exercise masteries table for tracking user skill levels per exercise
CREATE TABLE public.exercise_masteries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  mastery_level INTEGER NOT NULL DEFAULT 1 CHECK (mastery_level BETWEEN 1 AND 10),
  technique_score NUMERIC DEFAULT 0 CHECK (technique_score BETWEEN 0 AND 100),
  consistency_score NUMERIC DEFAULT 0 CHECK (consistency_score BETWEEN 0 AND 100),
  progression_score NUMERIC DEFAULT 0 CHECK (progression_score BETWEEN 0 AND 100),
  total_sessions INTEGER NOT NULL DEFAULT 0,
  best_performance JSONB DEFAULT '{}',
  validation_data JSONB DEFAULT '{}',
  last_practice_at TIMESTAMP WITH TIME ZONE,
  mastery_unlocked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Create certifications table for validated achievements
CREATE TABLE public.certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  certification_level TEXT NOT NULL DEFAULT 'bronze',
  certification_data JSONB DEFAULT '{}',
  validator_id UUID,
  validation_type TEXT NOT NULL DEFAULT 'peer_review',
  evidence_urls TEXT[],
  approved_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'expired'))
);

-- Create skill requirements table linking exercises to unlock conditions
CREATE TABLE public.skill_requirements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  exercise_id UUID NOT NULL,
  required_exercise_id UUID NOT NULL,
  required_mastery_level INTEGER NOT NULL DEFAULT 3,
  requirement_type TEXT NOT NULL DEFAULT 'prerequisite',
  unlock_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create technique validations table for peer review system
CREATE TABLE public.technique_validations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  validator_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  technique_rating INTEGER NOT NULL CHECK (technique_rating BETWEEN 1 AND 5),
  form_feedback TEXT,
  improvement_suggestions TEXT,
  validation_video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.exercise_masteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_requirements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technique_validations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercise_masteries
CREATE POLICY "Users can view own exercise masteries" 
ON public.exercise_masteries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exercise masteries" 
ON public.exercise_masteries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise masteries" 
ON public.exercise_masteries 
FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for certifications
CREATE POLICY "Users can view own certifications" 
ON public.certifications 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = validator_id);

CREATE POLICY "Users can create certification requests" 
ON public.certifications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Qualified users can validate certifications" 
ON public.certifications 
FOR UPDATE 
USING (
  auth.uid() = validator_id OR 
  EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for skill_requirements
CREATE POLICY "Anyone can view skill requirements" 
ON public.skill_requirements 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage skill requirements" 
ON public.skill_requirements 
FOR ALL 
USING (
  EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- RLS Policies for technique_validations
CREATE POLICY "Users can view validations for their exercises" 
ON public.technique_validations 
FOR SELECT 
USING (auth.uid() = user_id OR auth.uid() = validator_id);

CREATE POLICY "Qualified users can create validations" 
ON public.technique_validations 
FOR INSERT 
WITH CHECK (
  auth.uid() = validator_id AND
  EXISTS(
    SELECT 1 FROM public.exercise_masteries em
    WHERE em.user_id = auth.uid() 
    AND em.exercise_id = technique_validations.exercise_id 
    AND em.mastery_level >= 5
  )
);

-- Create triggers for updated_at
CREATE TRIGGER update_exercise_masteries_updated_at
BEFORE UPDATE ON public.exercise_masteries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add some seed data for skill requirements
INSERT INTO public.skill_requirements (exercise_id, required_exercise_id, required_mastery_level, requirement_type) VALUES
(gen_random_uuid(), gen_random_uuid(), 3, 'prerequisite'),
(gen_random_uuid(), gen_random_uuid(), 5, 'advanced_unlock'),
(gen_random_uuid(), gen_random_uuid(), 7, 'master_level');

-- Create function to calculate overall mastery score
CREATE OR REPLACE FUNCTION public.calculate_mastery_score(
  technique_score NUMERIC,
  consistency_score NUMERIC, 
  progression_score NUMERIC
) RETURNS NUMERIC AS $$
BEGIN
  RETURN ROUND(
    (technique_score * 0.4 + consistency_score * 0.3 + progression_score * 0.3)::NUMERIC, 
    2
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Create function to update mastery level based on scores
CREATE OR REPLACE FUNCTION public.update_mastery_level()
RETURNS TRIGGER AS $$
DECLARE
  overall_score NUMERIC;
  new_level INTEGER;
BEGIN
  overall_score := public.calculate_mastery_score(
    NEW.technique_score, 
    NEW.consistency_score, 
    NEW.progression_score
  );
  
  -- Determine mastery level based on overall score
  IF overall_score >= 95 THEN new_level := 10;
  ELSIF overall_score >= 90 THEN new_level := 9;
  ELSIF overall_score >= 85 THEN new_level := 8;
  ELSIF overall_score >= 80 THEN new_level := 7;
  ELSIF overall_score >= 75 THEN new_level := 6;
  ELSIF overall_score >= 70 THEN new_level := 5;
  ELSIF overall_score >= 60 THEN new_level := 4;
  ELSIF overall_score >= 50 THEN new_level := 3;
  ELSIF overall_score >= 30 THEN new_level := 2;
  ELSE new_level := 1;
  END IF;
  
  -- Update mastery level if it increased
  IF new_level > OLD.mastery_level THEN
    NEW.mastery_level := new_level;
    NEW.mastery_unlocked_at := now();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update mastery levels
CREATE TRIGGER trigger_update_mastery_level
BEFORE UPDATE ON public.exercise_masteries
FOR EACH ROW
EXECUTE FUNCTION public.update_mastery_level();