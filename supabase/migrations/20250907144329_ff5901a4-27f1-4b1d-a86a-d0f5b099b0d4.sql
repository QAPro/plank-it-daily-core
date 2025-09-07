-- Just create the user_notification_schedules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('morning', 'lunch', 'evening', 'last_chance')),
  send_time TIME NOT NULL DEFAULT '18:00:00',
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, slot)
);

-- Enable RLS
ALTER TABLE public.user_notification_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies only if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'user_notification_schedules' 
        AND policyname = 'Users can manage own notification schedules'
    ) THEN
        CREATE POLICY "Users can manage own notification schedules"
        ON public.user_notification_schedules
        FOR ALL
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
    END IF;
END $$;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_notification_schedules_user_enabled 
ON public.user_notification_schedules(user_id, enabled);

-- Add time_zone column to user_preferences if it doesn't exist
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS time_zone TEXT DEFAULT 'UTC';

-- Migrate existing reminder data to evening slots (only insert if not exists)
INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT 
  user_id,
  'evening' as slot,
  COALESCE(reminder_time, '18:00:00'::TIME) as send_time,
  workout_reminders as enabled
FROM public.user_preferences
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_notification_schedules 
  WHERE user_notification_schedules.user_id = user_preferences.user_id 
  AND slot = 'evening'
);

-- Add default disabled slots for all other slots
INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'morning', '08:00:00'::TIME, false
FROM public.user_preferences
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_notification_schedules 
  WHERE user_notification_schedules.user_id = user_preferences.user_id 
  AND slot = 'morning'
);

INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'lunch', '12:00:00'::TIME, false
FROM public.user_preferences
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_notification_schedules 
  WHERE user_notification_schedules.user_id = user_preferences.user_id 
  AND slot = 'lunch'
);

INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'last_chance', '20:00:00'::TIME, false
FROM public.user_preferences
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_notification_schedules 
  WHERE user_notification_schedules.user_id = user_preferences.user_id 
  AND slot = 'last_chance'
);