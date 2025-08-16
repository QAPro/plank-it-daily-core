
-- Create user_goals table for advanced goal setting and tracking
CREATE TABLE public.user_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  goal_type TEXT NOT NULL, -- 'duration', 'consistency', 'weight_loss', 'strength', 'custom'
  title TEXT NOT NULL,
  description TEXT,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC DEFAULT 0,
  target_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  priority_level INTEGER DEFAULT 3, -- 1-5 scale
  category TEXT DEFAULT 'fitness',
  measurement_unit TEXT DEFAULT 'seconds',
  milestone_values JSONB DEFAULT '[]'::jsonb,
  achievement_probability NUMERIC DEFAULT 0.5,
  estimated_completion_date DATE
);

-- Create ml_predictions table for storing ML analysis results
CREATE TABLE public.ml_predictions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prediction_type TEXT NOT NULL, -- 'performance', 'plateau_risk', 'injury_risk', 'goal_achievement'
  prediction_data JSONB NOT NULL,
  confidence_score NUMERIC NOT NULL DEFAULT 0.0,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + '7 days'::interval),
  model_version TEXT DEFAULT 'v1.0',
  input_data_hash TEXT,
  is_active BOOLEAN DEFAULT true
);

-- Create performance_benchmarks table for comparative analysis
CREATE TABLE public.performance_benchmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_segment TEXT NOT NULL, -- demographic/experience grouping
  exercise_id UUID,
  metric_type TEXT NOT NULL, -- 'duration', 'consistency', 'improvement_rate'
  percentile_data JSONB NOT NULL, -- {p10: x, p25: x, p50: x, p75: x, p90: x}
  sample_size INTEGER NOT NULL,
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  data_period TEXT DEFAULT 'last_30_days'
);

-- Create analytics_insights table for storing generated insights
CREATE TABLE public.analytics_insights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  insight_type TEXT NOT NULL, -- 'improvement', 'plateau', 'risk', 'recommendation', 'achievement'
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  insight_data JSONB DEFAULT '{}',
  relevance_score NUMERIC NOT NULL DEFAULT 0.0,
  action_required BOOLEAN DEFAULT false,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + '14 days'::interval),
  is_read BOOLEAN DEFAULT false,
  category TEXT DEFAULT 'general',
  priority_level INTEGER DEFAULT 3
);

-- Create training_load_history table for load optimization
CREATE TABLE public.training_load_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  planned_load NUMERIC DEFAULT 0,
  actual_load NUMERIC DEFAULT 0,
  load_score NUMERIC DEFAULT 0, -- calculated training load score
  recovery_score NUMERIC DEFAULT 0, -- recovery assessment
  stress_indicators JSONB DEFAULT '{}',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ml_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.performance_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_load_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_goals
CREATE POLICY "Users can view own goals" 
ON public.user_goals FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals" 
ON public.user_goals FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" 
ON public.user_goals FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" 
ON public.user_goals FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for ml_predictions
CREATE POLICY "Users can view own predictions" 
ON public.ml_predictions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own predictions" 
ON public.ml_predictions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own predictions" 
ON public.ml_predictions FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for performance_benchmarks (public read-only data)
CREATE POLICY "Anyone can view benchmarks" 
ON public.performance_benchmarks FOR SELECT 
USING (true);

-- RLS Policies for analytics_insights
CREATE POLICY "Users can view own insights" 
ON public.analytics_insights FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own insights" 
ON public.analytics_insights FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights" 
ON public.analytics_insights FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for training_load_history
CREATE POLICY "Users can view own training load" 
ON public.training_load_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own training load" 
ON public.training_load_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own training load" 
ON public.training_load_history FOR UPDATE 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_user_goals_user_active ON public.user_goals(user_id, is_active);
CREATE INDEX idx_user_goals_target_date ON public.user_goals(target_date) WHERE is_active = true;
CREATE INDEX idx_ml_predictions_user_type ON public.ml_predictions(user_id, prediction_type);
CREATE INDEX idx_ml_predictions_expires ON public.ml_predictions(expires_at) WHERE is_active = true;
CREATE INDEX idx_performance_benchmarks_segment ON public.performance_benchmarks(user_segment, exercise_id);
CREATE INDEX idx_analytics_insights_user_unread ON public.analytics_insights(user_id, is_read);
CREATE INDEX idx_analytics_insights_priority ON public.analytics_insights(priority_level DESC);
CREATE INDEX idx_training_load_user_date ON public.training_load_history(user_id, date);

-- Create function to update goal progress automatically
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Update duration-based goals
    UPDATE user_goals 
    SET current_value = (
        SELECT COALESCE(MAX(duration_seconds), 0)
        FROM user_sessions 
        WHERE user_id = NEW.user_id 
        AND goal_type = 'duration'
    ),
    updated_at = now()
    WHERE user_id = NEW.user_id 
    AND goal_type = 'duration' 
    AND is_active = true;
    
    -- Update consistency-based goals (sessions this month)
    UPDATE user_goals 
    SET current_value = (
        SELECT COUNT(*)
        FROM user_sessions 
        WHERE user_id = NEW.user_id 
        AND completed_at >= date_trunc('month', now())
    ),
    updated_at = now()
    WHERE user_id = NEW.user_id 
    AND goal_type = 'consistency' 
    AND is_active = true;
    
    RETURN NEW;
END;
$$;

-- Create trigger to automatically update goals when sessions are completed
CREATE TRIGGER update_goal_progress_trigger
    AFTER INSERT ON public.user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_goal_progress();

-- Insert sample performance benchmarks for different user segments
INSERT INTO public.performance_benchmarks (user_segment, exercise_id, metric_type, percentile_data, sample_size) VALUES
('beginner_0-30_days', null, 'duration', '{"p10": 15, "p25": 25, "p50": 45, "p75": 75, "p90": 120}', 1000),
('intermediate_30-90_days', null, 'duration', '{"p10": 30, "p25": 60, "p50": 90, "p75": 150, "p90": 240}', 800),
('advanced_90+_days', null, 'duration', '{"p10": 60, "p25": 120, "p50": 180, "p75": 300, "p90": 480}', 500),
('beginner_0-30_days', null, 'consistency', '{"p10": 2, "p25": 4, "p50": 8, "p75": 15, "p90": 25}', 1000),
('intermediate_30-90_days', null, 'consistency', '{"p10": 5, "p25": 10, "p50": 18, "p75": 25, "p90": 30}', 800),
('advanced_90+_days', null, 'consistency', '{"p10": 10, "p25": 18, "p50": 25, "p75": 30, "p90": 35}', 500);
