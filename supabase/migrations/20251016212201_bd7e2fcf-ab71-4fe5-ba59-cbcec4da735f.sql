-- Phase 1: Foundation - Complete Database Infrastructure
-- This migration is ADDITIVE ONLY - no deletions, existing app remains functional

-- ============================================================================
-- PHASE 1A: EXERCISE FOUNDATION
-- ============================================================================

-- Create exercise_categories table
CREATE TABLE IF NOT EXISTS public.exercise_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon_name TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create exercises table
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category_id UUID REFERENCES public.exercise_categories(id) ON DELETE CASCADE NOT NULL,
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  duration_seconds INTEGER NOT NULL,
  description TEXT,
  instructions TEXT,
  benefits TEXT[],
  modifications TEXT[],
  cautions TEXT[],
  tier_required TEXT NOT NULL DEFAULT 'free' CHECK (tier_required IN ('free', 'premium')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.exercise_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exercise_categories
CREATE POLICY "Anyone can view active exercise categories"
ON public.exercise_categories
FOR SELECT
USING (true);

-- RLS Policies for exercises
CREATE POLICY "Anyone can view active exercises"
ON public.exercises
FOR SELECT
USING (is_active = true);

-- Insert Exercise Categories
INSERT INTO public.exercise_categories (name, description, icon_name, display_order) VALUES
('Cardio', 'Heart-pumping exercises to boost cardiovascular endurance', 'Zap', 1),
('Strength', 'Build muscle and increase power with resistance exercises', 'Dumbbell', 2),
('Flexibility', 'Improve range of motion and reduce injury risk', 'Wind', 3),
('Core', 'Strengthen your center for better stability and balance', 'Target', 4),
('Balance', 'Enhance coordination and body control', 'Scale', 5),
('Endurance', 'Build stamina for sustained physical activity', 'Activity', 6);

-- ============================================================================
-- PHASE 1B: MOMENTUM SCORE INFRASTRUCTURE
-- ============================================================================

-- Create user_momentum_scores table
CREATE TABLE IF NOT EXISTS public.user_momentum_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  momentum_score NUMERIC NOT NULL DEFAULT 0,
  workouts_completed INTEGER NOT NULL DEFAULT 0,
  personal_bests_count INTEGER NOT NULL DEFAULT 0,
  category_diversity_score NUMERIC NOT NULL DEFAULT 0,
  difficulty_progression_score NUMERIC NOT NULL DEFAULT 0,
  consistency_bonus NUMERIC NOT NULL DEFAULT 0,
  weekly_goal_met BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Create momentum_score_components table
CREATE TABLE IF NOT EXISTS public.momentum_score_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  momentum_score_id UUID REFERENCES public.user_momentum_scores(id) ON DELETE CASCADE NOT NULL,
  component_type TEXT NOT NULL CHECK (component_type IN ('workout', 'personal_best', 'category', 'difficulty', 'consistency')),
  points_earned NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_category_progress table
CREATE TABLE IF NOT EXISTS public.user_category_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  category_id UUID REFERENCES public.exercise_categories(id) ON DELETE CASCADE NOT NULL,
  week_start_date DATE NOT NULL,
  workouts_this_week INTEGER NOT NULL DEFAULT 0,
  highest_difficulty_reached INTEGER NOT NULL DEFAULT 1,
  total_duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, category_id, week_start_date)
);

-- Create user_weekly_goals table
CREATE TABLE IF NOT EXISTS public.user_weekly_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  week_start_date DATE NOT NULL,
  target_workouts INTEGER NOT NULL DEFAULT 3,
  target_momentum_score NUMERIC NOT NULL DEFAULT 100,
  previous_week_workouts INTEGER DEFAULT 0,
  previous_week_momentum NUMERIC DEFAULT 0,
  goal_adjustment_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start_date)
);

-- Add new columns to user_sessions (ADDITIVE - no data loss)
ALTER TABLE public.user_sessions 
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS was_personal_best BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS momentum_points_earned NUMERIC DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_completed 
  ON public.user_sessions(user_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_category 
  ON public.user_sessions(user_id, category);

-- Enable RLS on momentum tables
ALTER TABLE public.user_momentum_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.momentum_score_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_category_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_weekly_goals ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_momentum_scores
CREATE POLICY "Users can view own momentum scores"
ON public.user_momentum_scores FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own momentum scores"
ON public.user_momentum_scores FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own momentum scores"
ON public.user_momentum_scores FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for momentum_score_components
CREATE POLICY "Users can view own momentum components"
ON public.momentum_score_components FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.user_momentum_scores
  WHERE id = momentum_score_components.momentum_score_id
  AND user_id = auth.uid()
));

CREATE POLICY "Users can insert own momentum components"
ON public.momentum_score_components FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.user_momentum_scores
  WHERE id = momentum_score_components.momentum_score_id
  AND user_id = auth.uid()
));

-- RLS Policies for user_category_progress
CREATE POLICY "Users can view own category progress"
ON public.user_category_progress FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own category progress"
ON public.user_category_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own category progress"
ON public.user_category_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for user_weekly_goals
CREATE POLICY "Users can view own weekly goals"
ON public.user_weekly_goals FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own weekly goals"
ON public.user_weekly_goals FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly goals"
ON public.user_weekly_goals FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 1C: AI COACH INFRASTRUCTURE
-- ============================================================================

-- Create ai_coach_insights table (templates)
CREATE TABLE IF NOT EXISTS public.ai_coach_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_category TEXT NOT NULL CHECK (insight_category IN ('performance', 'consistency', 'progression', 'variety', 'milestone')),
  trigger_conditions JSONB NOT NULL DEFAULT '{}'::jsonb,
  template_text TEXT NOT NULL,
  priority_level INTEGER NOT NULL DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5),
  tier_required TEXT NOT NULL DEFAULT 'free' CHECK (tier_required IN ('free', 'premium')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_insights_history table
CREATE TABLE IF NOT EXISTS public.user_insights_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_template_id UUID REFERENCES public.ai_coach_insights(id) ON DELETE CASCADE,
  generated_text TEXT NOT NULL,
  insight_category TEXT NOT NULL,
  priority_level INTEGER NOT NULL DEFAULT 3,
  week_start_date DATE NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_insight_views table
CREATE TABLE IF NOT EXISTS public.user_insight_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  insight_history_id UUID REFERENCES public.user_insights_history(id) ON DELETE CASCADE NOT NULL,
  viewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  dismissed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(user_id, insight_history_id)
);

-- Enable RLS on AI Coach tables
ALTER TABLE public.ai_coach_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_insights_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_insight_views ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_coach_insights
CREATE POLICY "Anyone can view active AI coach templates"
ON public.ai_coach_insights FOR SELECT
USING (is_active = true);

-- RLS Policies for user_insights_history
CREATE POLICY "Users can view own insights"
ON public.user_insights_history FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
ON public.user_insights_history FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for user_insight_views
CREATE POLICY "Users can view own insight views"
ON public.user_insight_views FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own insight views"
ON public.user_insight_views FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insight views"
ON public.user_insight_views FOR UPDATE
USING (auth.uid() = user_id);

-- Seed AI Coach Insight Templates
INSERT INTO public.ai_coach_insights (insight_category, template_text, priority_level, tier_required, trigger_conditions) VALUES
-- Performance Category (5 templates)
('performance', 'You crushed your personal best in {{category}} by {{improvement_percent}}%! 🔥', 5, 'free', '{"type": "personal_best", "min_improvement": 5}'::jsonb),
('performance', 'Your {{exercise_name}} form is getting stronger - {{duration}} seconds is impressive!', 4, 'free', '{"type": "duration_milestone", "min_duration": 30}'::jsonb),
('performance', 'New record! You just completed your longest {{category}} session at {{duration}} seconds! 💪', 5, 'free', '{"type": "duration_record"}'::jsonb),
('performance', 'Difficulty {{difficulty_level}} conquered! You''re leveling up fast in {{category}}.', 4, 'premium', '{"type": "difficulty_increase"}'::jsonb),
('performance', 'That''s {{total_duration}} minutes of pure effort in {{category}} this week. Outstanding! 🌟', 3, 'premium', '{"type": "weekly_category_duration", "min_minutes": 10}'::jsonb),

-- Consistency Category (6 templates)
('consistency', '{{streak_days}} days in a row! Your consistency is building real momentum. 🚀', 5, 'free', '{"type": "streak", "min_days": 3}'::jsonb),
('consistency', 'You''re working out {{frequency}} this week - your body is adapting! Keep it up! 💯', 4, 'free', '{"type": "weekly_frequency", "min_workouts": 3}'::jsonb),
('consistency', 'Weekly goal smashed! {{workouts_completed}} workouts completed. You''re unstoppable! 🎯', 5, 'free', '{"type": "weekly_goal_met"}'::jsonb),
('consistency', 'You haven''t missed a single day this week! {{days_active}} days of pure dedication.', 5, 'premium', '{"type": "perfect_week"}'::jsonb),
('consistency', 'Morning warrior! You''ve started {{morning_count}} days with movement this week. 🌅', 3, 'free', '{"type": "morning_sessions", "min_count": 3}'::jsonb),
('consistency', '{{month_name}} consistency champion: {{workouts_this_month}} workouts and counting!', 4, 'premium', '{"type": "monthly_consistency", "min_workouts": 12}'::jsonb),

-- Progression Category (5 templates)
('progression', 'Level up! You''ve conquered Difficulty {{old_level}} and moved to {{new_level}}. 📈', 5, 'free', '{"type": "difficulty_increase"}'::jsonb),
('progression', 'First time hitting {{duration}} seconds in {{category}} - that''s real growth! 🌱', 4, 'free', '{"type": "first_time_duration"}'::jsonb),
('progression', 'From {{start_duration}}s to {{end_duration}}s in {{timeframe}} - amazing progress!', 5, 'premium', '{"type": "duration_comparison"}'::jsonb),
('progression', 'You''re averaging {{avg_difficulty}} difficulty now, up from {{prev_avg_difficulty}} last month!', 4, 'premium', '{"type": "difficulty_trend"}'::jsonb),
('progression', 'New exercise unlocked: {{exercise_name}}! Ready to try something new? 🆕', 3, 'free', '{"type": "new_exercise_available"}'::jsonb),

-- Variety Category (5 templates)
('variety', 'Category explorer! You''ve tried {{category_count}} different movement types this week. 🗺️', 4, 'free', '{"type": "category_diversity", "min_categories": 3}'::jsonb),
('variety', 'Balanced training: You''re hitting {{categories_list}} regularly. Well-rounded! ⚖️', 4, 'free', '{"type": "balanced_categories"}'::jsonb),
('variety', 'Jack of all trades! You''ve completed exercises in {{category_count}} categories this month.', 3, 'premium', '{"type": "monthly_variety", "min_categories": 4}'::jsonb),
('variety', 'First {{category}} workout! Expanding your fitness horizons. 🌈', 3, 'free', '{"type": "first_category_attempt"}'::jsonb),
('variety', 'You''ve mastered {{exercise_count}} different exercises. Variety builds resilience! 💪', 4, 'premium', '{"type": "exercise_variety", "min_exercises": 10}'::jsonb),

-- Milestone Category (9 templates)
('milestone', '{{total_workouts}} total workouts completed - you''re a consistency champion! 🏆', 5, 'free', '{"type": "workout_milestone", "milestones": [10, 25, 50, 100, 250, 500]}'::jsonb),
('milestone', '{{total_minutes}} minutes of movement this month - your dedication shows! ⏱️', 4, 'free', '{"type": "monthly_duration", "min_minutes": 60}'::jsonb),
('milestone', 'Welcome to the Inner Fire community! Your first workout is complete. 🔥', 5, 'free', '{"type": "first_workout"}'::jsonb),
('milestone', 'One week strong! Keep building that momentum. 💪', 4, 'free', '{"type": "one_week_active"}'::jsonb),
('milestone', 'One month milestone reached! You''re officially building a habit. 🎉', 5, 'free', '{"type": "one_month_active"}'::jsonb),
('milestone', '100 days of Inner Fire! You''re in the top 5% of users. Legendary! 🌟', 5, 'premium', '{"type": "hundred_days"}'::jsonb),
('milestone', 'You''ve earned {{achievement_count}} achievements! Collecting them all? 🏅', 3, 'free', '{"type": "achievement_count", "min_achievements": 5}'::jsonb),
('milestone', 'Personal best streak: {{pb_count}} in the last month! You''re peaking! 📊', 4, 'premium', '{"type": "pb_streak", "min_count": 3}'::jsonb),
('milestone', 'Weekend warrior! You''ve hit {{weekend_workouts}} weekend sessions this month. 🏃', 3, 'free', '{"type": "weekend_sessions", "min_count": 4}'::jsonb);

-- ============================================================================
-- PHASE 1D: HOME SCREEN DATA LAYER
-- ============================================================================

-- Add columns to user_preferences for Home Screen persistence
ALTER TABLE public.user_preferences 
  ADD COLUMN IF NOT EXISTS last_selected_exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS last_timer_duration INTEGER;

-- Create helper function to get weekly workout count
CREATE OR REPLACE FUNCTION public.get_user_weekly_workout_count(
  _user_id UUID,
  _week_start_date DATE
)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER
  FROM public.user_sessions
  WHERE user_id = _user_id
    AND completed_at >= _week_start_date::TIMESTAMP WITH TIME ZONE
    AND completed_at < (_week_start_date + INTERVAL '7 days')::TIMESTAMP WITH TIME ZONE;
$$;

-- Create helper function to get current streak
CREATE OR REPLACE FUNCTION public.get_user_current_streak(_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_streak INTEGER := 0;
  check_date DATE;
  has_workout BOOLEAN;
BEGIN
  check_date := CURRENT_DATE;
  
  -- Check if there's a workout today or yesterday to start counting
  SELECT EXISTS (
    SELECT 1 FROM public.user_sessions
    WHERE user_id = _user_id
    AND completed_at::DATE >= CURRENT_DATE - INTERVAL '1 day'
  ) INTO has_workout;
  
  IF NOT has_workout THEN
    RETURN 0;
  END IF;
  
  -- Count consecutive days backward from today
  WHILE check_date >= CURRENT_DATE - INTERVAL '365 days' LOOP
    SELECT EXISTS (
      SELECT 1 FROM public.user_sessions
      WHERE user_id = _user_id
      AND completed_at::DATE = check_date
    ) INTO has_workout;
    
    IF has_workout THEN
      current_streak := current_streak + 1;
      check_date := check_date - INTERVAL '1 day';
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN current_streak;
END;
$$;

-- Create helper function to get current momentum score
CREATE OR REPLACE FUNCTION public.get_user_momentum_score(
  _user_id UUID,
  _week_start_date DATE
)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(momentum_score, 0)
  FROM public.user_momentum_scores
  WHERE user_id = _user_id
    AND week_start_date = _week_start_date;
$$;

-- Create helper function to calculate momentum components
CREATE OR REPLACE FUNCTION public.calculate_momentum_components(
  _user_id UUID,
  _week_start_date DATE
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
  workout_count INTEGER;
  pb_count INTEGER;
  category_count INTEGER;
  avg_difficulty NUMERIC;
BEGIN
  -- Get workout count
  SELECT COUNT(*) INTO workout_count
  FROM public.user_sessions
  WHERE user_id = _user_id
    AND completed_at >= _week_start_date::TIMESTAMP WITH TIME ZONE
    AND completed_at < (_week_start_date + INTERVAL '7 days')::TIMESTAMP WITH TIME ZONE;
  
  -- Get personal best count
  SELECT COUNT(*) INTO pb_count
  FROM public.user_sessions
  WHERE user_id = _user_id
    AND completed_at >= _week_start_date::TIMESTAMP WITH TIME ZONE
    AND completed_at < (_week_start_date + INTERVAL '7 days')::TIMESTAMP WITH TIME ZONE
    AND was_personal_best = true;
  
  -- Get unique category count
  SELECT COUNT(DISTINCT category) INTO category_count
  FROM public.user_sessions
  WHERE user_id = _user_id
    AND completed_at >= _week_start_date::TIMESTAMP WITH TIME ZONE
    AND completed_at < (_week_start_date + INTERVAL '7 days')::TIMESTAMP WITH TIME ZONE
    AND category IS NOT NULL;
  
  -- Get average difficulty (approximation based on duration)
  SELECT COALESCE(AVG(duration_seconds / 30.0), 0) INTO avg_difficulty
  FROM public.user_sessions
  WHERE user_id = _user_id
    AND completed_at >= _week_start_date::TIMESTAMP WITH TIME ZONE
    AND completed_at < (_week_start_date + INTERVAL '7 days')::TIMESTAMP WITH TIME ZONE;
  
  -- Build result JSON
  result := jsonb_build_object(
    'workout_count', workout_count,
    'personal_bests', pb_count,
    'categories_explored', category_count,
    'avg_difficulty', ROUND(avg_difficulty, 2),
    'base_points', workout_count * 10,
    'pb_bonus', pb_count * 25,
    'diversity_bonus', category_count * 15,
    'difficulty_bonus', ROUND(avg_difficulty * 10, 2)
  );
  
  RETURN result;
END;
$$;