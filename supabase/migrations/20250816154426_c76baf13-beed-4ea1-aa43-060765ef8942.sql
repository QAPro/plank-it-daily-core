
-- Create custom workouts table
CREATE TABLE public.custom_workouts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  total_duration INTEGER NOT NULL DEFAULT 0,
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create custom workout exercises junction table
CREATE TABLE public.custom_workout_exercises (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  custom_workout_id UUID NOT NULL,
  exercise_id UUID NOT NULL,
  duration_seconds INTEGER NOT NULL,
  rest_after_seconds INTEGER NOT NULL DEFAULT 0,
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout templates table
CREATE TABLE public.workout_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  difficulty_level INTEGER NOT NULL DEFAULT 1,
  workout_data JSONB NOT NULL DEFAULT '{}',
  rating_average NUMERIC DEFAULT 0.0,
  rating_count INTEGER DEFAULT 0,
  created_by UUID,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create workout ratings table
CREATE TABLE public.workout_ratings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  template_id UUID,
  custom_workout_id UUID,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT check_rating_target CHECK (
    (template_id IS NOT NULL AND custom_workout_id IS NULL) OR
    (template_id IS NULL AND custom_workout_id IS NOT NULL)
  )
);

-- Add foreign key constraints
ALTER TABLE public.custom_workout_exercises 
ADD CONSTRAINT fk_custom_workout_exercises_workout 
FOREIGN KEY (custom_workout_id) REFERENCES public.custom_workouts(id) ON DELETE CASCADE;

ALTER TABLE public.custom_workout_exercises 
ADD CONSTRAINT fk_custom_workout_exercises_exercise 
FOREIGN KEY (exercise_id) REFERENCES public.plank_exercises(id) ON DELETE CASCADE;

ALTER TABLE public.workout_ratings 
ADD CONSTRAINT fk_workout_ratings_template 
FOREIGN KEY (template_id) REFERENCES public.workout_templates(id) ON DELETE CASCADE;

ALTER TABLE public.workout_ratings 
ADD CONSTRAINT fk_workout_ratings_workout 
FOREIGN KEY (custom_workout_id) REFERENCES public.custom_workouts(id) ON DELETE CASCADE;

-- Create unique constraints
ALTER TABLE public.custom_workout_exercises 
ADD CONSTRAINT unique_workout_exercise_order 
UNIQUE (custom_workout_id, order_index);

ALTER TABLE public.workout_ratings 
ADD CONSTRAINT unique_user_template_rating 
UNIQUE (user_id, template_id);

ALTER TABLE public.workout_ratings 
ADD CONSTRAINT unique_user_workout_rating 
UNIQUE (user_id, custom_workout_id);

-- Enable Row Level Security
ALTER TABLE public.custom_workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custom_workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for custom_workouts
CREATE POLICY "Users can view own workouts and public workouts" 
ON public.custom_workouts FOR SELECT 
USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can create own workouts" 
ON public.custom_workouts FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workouts" 
ON public.custom_workouts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own workouts" 
ON public.custom_workouts FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for custom_workout_exercises
CREATE POLICY "Users can view exercises of accessible workouts" 
ON public.custom_workout_exercises FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.custom_workouts cw 
    WHERE cw.id = custom_workout_id 
    AND (cw.user_id = auth.uid() OR cw.is_public = true)
  )
);

CREATE POLICY "Users can manage exercises of own workouts" 
ON public.custom_workout_exercises FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.custom_workouts cw 
    WHERE cw.id = custom_workout_id 
    AND cw.user_id = auth.uid()
  )
);

-- RLS Policies for workout_templates
CREATE POLICY "Anyone can view workout templates" 
ON public.workout_templates FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create templates" 
ON public.workout_templates FOR INSERT 
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update own templates" 
ON public.workout_templates FOR UPDATE 
USING (auth.uid() = created_by);

CREATE POLICY "Users can delete own templates" 
ON public.workout_templates FOR DELETE 
USING (auth.uid() = created_by);

-- RLS Policies for workout_ratings
CREATE POLICY "Users can view all ratings" 
ON public.workout_ratings FOR SELECT 
USING (true);

CREATE POLICY "Users can create own ratings" 
ON public.workout_ratings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" 
ON public.workout_ratings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" 
ON public.workout_ratings FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX idx_custom_workouts_user_id ON public.custom_workouts(user_id);
CREATE INDEX idx_custom_workouts_public ON public.custom_workouts(is_public) WHERE is_public = true;
CREATE INDEX idx_custom_workout_exercises_workout_id ON public.custom_workout_exercises(custom_workout_id);
CREATE INDEX idx_custom_workout_exercises_order ON public.custom_workout_exercises(custom_workout_id, order_index);
CREATE INDEX idx_workout_templates_category ON public.workout_templates(category);
CREATE INDEX idx_workout_templates_featured ON public.workout_templates(is_featured) WHERE is_featured = true;
CREATE INDEX idx_workout_ratings_template ON public.workout_ratings(template_id);
CREATE INDEX idx_workout_ratings_workout ON public.workout_ratings(custom_workout_id);

-- Insert some default workout templates
INSERT INTO public.workout_templates (name, description, category, difficulty_level, workout_data, is_featured) VALUES
('Quick Core Blast', 'A fast 10-minute core workout perfect for busy schedules', 'core', 2, 
'{"exercises": [{"exercise_id": null, "duration_seconds": 60, "rest_after_seconds": 15, "order_index": 0}, {"exercise_id": null, "duration_seconds": 45, "rest_after_seconds": 15, "order_index": 1}, {"exercise_id": null, "duration_seconds": 60, "rest_after_seconds": 15, "order_index": 2}, {"exercise_id": null, "duration_seconds": 30, "rest_after_seconds": 0, "order_index": 3}], "total_duration": 240}', 
true),
('Beginner Builder', 'Perfect first custom workout for beginners', 'beginner', 1,
'{"exercises": [{"exercise_id": null, "duration_seconds": 30, "rest_after_seconds": 30, "order_index": 0}, {"exercise_id": null, "duration_seconds": 30, "rest_after_seconds": 30, "order_index": 1}, {"exercise_id": null, "duration_seconds": 30, "rest_after_seconds": 0, "order_index": 2}], "total_duration": 150}',
true),
('Advanced Challenge', 'High-intensity workout for experienced users', 'advanced', 4,
'{"exercises": [{"exercise_id": null, "duration_seconds": 120, "rest_after_seconds": 30, "order_index": 0}, {"exercise_id": null, "duration_seconds": 90, "rest_after_seconds": 30, "order_index": 1}, {"exercise_id": null, "duration_seconds": 120, "rest_after_seconds": 30, "order_index": 2}, {"exercise_id": null, "duration_seconds": 60, "rest_after_seconds": 0, "order_index": 3}], "total_duration": 480}',
true);
