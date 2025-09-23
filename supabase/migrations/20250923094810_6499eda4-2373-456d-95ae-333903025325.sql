-- Add weekly_goal field to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN weekly_goal integer NOT NULL DEFAULT 7;

-- Add constraint to ensure reasonable weekly goal values (1-14 days)
ALTER TABLE public.user_preferences 
ADD CONSTRAINT weekly_goal_range CHECK (weekly_goal >= 1 AND weekly_goal <= 14);