-- Add workout_count column to user_momentum_scores table
ALTER TABLE public.user_momentum_scores 
ADD COLUMN IF NOT EXISTS workout_count INTEGER NOT NULL DEFAULT 0;