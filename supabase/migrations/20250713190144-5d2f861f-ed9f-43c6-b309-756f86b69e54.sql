
-- Create user_onboarding table to track onboarding progress
CREATE TABLE public.user_onboarding (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  fitness_level INTEGER CHECK (fitness_level BETWEEN 1 AND 5),
  goals TEXT[],
  experience_level TEXT CHECK (experience_level IN ('beginner', 'intermediate', 'advanced')),
  preferred_duration INTEGER DEFAULT 30,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create user_assessments table for fitness assessment results
CREATE TABLE public.user_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL DEFAULT 'initial_plank',
  duration_seconds INTEGER NOT NULL,
  difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on new tables
ALTER TABLE public.user_onboarding ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_assessments ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_onboarding
CREATE POLICY "Users can view own onboarding data" ON public.user_onboarding
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own onboarding data" ON public.user_onboarding
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own onboarding data" ON public.user_onboarding
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS policies for user_assessments
CREATE POLICY "Users can view own assessments" ON public.user_assessments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments" ON public.user_assessments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments" ON public.user_assessments
  FOR UPDATE USING (auth.uid() = user_id);

-- Update the handle_new_user function to initialize onboarding
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
  
  -- Initialize user onboarding record
  INSERT INTO public.user_onboarding (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
