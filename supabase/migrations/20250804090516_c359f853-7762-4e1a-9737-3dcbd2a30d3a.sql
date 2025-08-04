
-- Add columns to track user exercise preferences and performance
ALTER TABLE user_preferences 
ADD COLUMN favorite_exercises uuid[] DEFAULT '{}',
ADD COLUMN avoided_exercises uuid[] DEFAULT '{}',
ADD COLUMN auto_progression boolean DEFAULT true,
ADD COLUMN progression_sensitivity integer DEFAULT 3 CHECK (progression_sensitivity >= 1 AND progression_sensitivity <= 5);

-- Create a table to track user exercise performance history
CREATE TABLE user_exercise_performance (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  best_duration_seconds integer NOT NULL DEFAULT 0,
  average_duration_seconds integer NOT NULL DEFAULT 0,
  total_sessions integer NOT NULL DEFAULT 0,
  last_session_at timestamp with time zone,
  difficulty_rating decimal(2,1) DEFAULT NULL CHECK (difficulty_rating >= 1.0 AND difficulty_rating <= 5.0),
  success_rate decimal(3,2) DEFAULT 1.0 CHECK (success_rate >= 0.0 AND success_rate <= 1.0),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, exercise_id)
);

-- Add RLS policies for user_exercise_performance
ALTER TABLE user_exercise_performance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own exercise performance" 
  ON user_exercise_performance 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own exercise performance" 
  ON user_exercise_performance 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own exercise performance" 
  ON user_exercise_performance 
  FOR UPDATE 
  USING (auth.uid() = user_id);

-- Create a table for exercise recommendations
CREATE TABLE user_exercise_recommendations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL,
  recommendation_type text NOT NULL CHECK (recommendation_type IN ('beginner_friendly', 'progressive_challenge', 'variety_boost', 'skill_building', 'recovery')),
  confidence_score decimal(3,2) NOT NULL DEFAULT 0.0 CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  reasoning text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone NOT NULL DEFAULT (now() + interval '7 days'),
  UNIQUE(user_id, exercise_id, recommendation_type)
);

-- Add RLS policies for recommendations
ALTER TABLE user_exercise_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recommendations" 
  ON user_exercise_recommendations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own recommendations" 
  ON user_exercise_recommendations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Add exercise categories and tags to enhance filtering
ALTER TABLE plank_exercises 
ADD COLUMN category text DEFAULT 'core_strength',
ADD COLUMN tags text[] DEFAULT '{}',
ADD COLUMN estimated_calories_per_minute decimal(4,2) DEFAULT 2.5,
ADD COLUMN primary_muscles text[] DEFAULT ARRAY['core', 'abdominals'],
ADD COLUMN equipment_needed text[] DEFAULT '{}',
ADD COLUMN is_beginner_friendly boolean DEFAULT true;

-- Create indexes for better performance
CREATE INDEX idx_user_exercise_performance_user_id ON user_exercise_performance(user_id);
CREATE INDEX idx_user_exercise_performance_exercise_id ON user_exercise_performance(exercise_id);
CREATE INDEX idx_user_recommendations_user_id ON user_exercise_recommendations(user_id);
CREATE INDEX idx_user_recommendations_expires_at ON user_exercise_recommendations(expires_at);
CREATE INDEX idx_plank_exercises_category ON plank_exercises(category);
CREATE INDEX idx_plank_exercises_difficulty ON plank_exercises(difficulty_level);
