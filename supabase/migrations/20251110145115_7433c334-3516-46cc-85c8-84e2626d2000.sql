-- Add notification_schedules_streak_protection table
CREATE TABLE IF NOT EXISTS public.notification_schedules_streak_protection (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  send_time TIME NOT NULL DEFAULT '20:00:00',
  enabled BOOLEAN NOT NULL DEFAULT true,
  time_zone TEXT NOT NULL DEFAULT 'America/New_York',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.notification_schedules_streak_protection ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own streak protection schedule"
  ON public.notification_schedules_streak_protection
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own streak protection schedule"
  ON public.notification_schedules_streak_protection
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own streak protection schedule"
  ON public.notification_schedules_streak_protection
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own streak protection schedule"
  ON public.notification_schedules_streak_protection
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_streak_protection_schedule_updated_at
  BEFORE UPDATE ON public.notification_schedules_streak_protection
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for efficient queries
CREATE INDEX idx_streak_protection_schedule_user_id ON public.notification_schedules_streak_protection(user_id);
CREATE INDEX idx_streak_protection_schedule_enabled ON public.notification_schedules_streak_protection(enabled) WHERE enabled = true;