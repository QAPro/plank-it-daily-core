-- Add daily_sessions field to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS daily_sessions INTEGER DEFAULT 1;