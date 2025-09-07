-- 1) Create notification_message_variants table (if missing)
CREATE TABLE IF NOT EXISTS public.notification_message_variants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  slot TEXT NULL,
  variant_key TEXT NOT NULL,
  weight INTEGER NOT NULL DEFAULT 1,
  experiment_key TEXT NULL,
  title_template TEXT NULL,
  body_template TEXT NULL,
  content JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS for variants (admins manage)
ALTER TABLE public.notification_message_variants ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notification_message_variants' AND policyname='Admins can manage variants'
  ) THEN
    CREATE POLICY "Admins can manage variants"
    ON public.notification_message_variants
    FOR ALL
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));
  END IF;
END $$;

-- Unique index for (category, COALESCE(slot,''), variant_key)
CREATE UNIQUE INDEX IF NOT EXISTS uq_notification_variants_cat_slot_key
ON public.notification_message_variants (category, COALESCE(slot, ''), variant_key);

-- Lookup index to speed selection by category/slot/active
CREATE INDEX IF NOT EXISTS idx_notification_variants_lookup 
ON public.notification_message_variants (category, COALESCE(slot, ''), is_active);

-- updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_notification_variants_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_notification_variants_updated_at
    BEFORE UPDATE ON public.notification_message_variants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 2) Create user_notification_schedules
CREATE TABLE IF NOT EXISTS public.user_notification_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slot TEXT NOT NULL CHECK (slot IN ('morning', 'lunch', 'evening', 'last_chance')),
  send_time TIME NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, slot)
);

ALTER TABLE public.user_notification_schedules ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_notification_schedules' AND policyname='Users can manage own notification schedules'
  ) THEN
    CREATE POLICY "Users can manage own notification schedules"
    ON public.user_notification_schedules
    FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='user_notification_schedules' AND policyname='Admins can view all notification schedules'
  ) THEN
    CREATE POLICY "Admins can view all notification schedules"
    ON public.user_notification_schedules
    FOR SELECT
    USING (is_admin(auth.uid()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notification_schedules_user_enabled 
ON public.user_notification_schedules(user_id, enabled);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_update_user_notification_schedules_updated_at'
  ) THEN
    CREATE TRIGGER trg_update_user_notification_schedules_updated_at
    BEFORE UPDATE ON public.user_notification_schedules
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 3) Extend notification_logs for variant tracking
ALTER TABLE public.notification_logs 
  ADD COLUMN IF NOT EXISTS variant_key TEXT,
  ADD COLUMN IF NOT EXISTS experiment_key TEXT;

-- 4) Create notification_interactions
CREATE TABLE IF NOT EXISTS public.notification_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  notification_log_id UUID REFERENCES public.notification_logs(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('click', 'dismiss', 'view')),
  interaction_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_interactions ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notification_interactions' AND policyname='Users can create own interactions'
  ) THEN
    CREATE POLICY "Users can create own interactions"
    ON public.notification_interactions
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notification_interactions' AND policyname='Users can view own interactions'
  ) THEN
    CREATE POLICY "Users can view own interactions"
    ON public.notification_interactions
    FOR SELECT
    USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='notification_interactions' AND policyname='Admins can view all interactions'
  ) THEN
    CREATE POLICY "Admins can view all interactions"
    ON public.notification_interactions
    FOR SELECT
    USING (is_admin(auth.uid()));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_notification_interactions_user ON public.notification_interactions(user_id, created_at);

-- 5) Data migration for schedules (idempotent with ON CONFLICT DO NOTHING)
INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'evening', COALESCE(reminder_time, '18:00:00'::TIME), workout_reminders
FROM public.user_preferences
ON CONFLICT DO NOTHING;

INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'morning', '08:00:00'::TIME, false
FROM public.user_preferences
ON CONFLICT DO NOTHING;

INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'lunch', '12:00:00'::TIME, false
FROM public.user_preferences
ON CONFLICT DO NOTHING;

INSERT INTO public.user_notification_schedules (user_id, slot, send_time, enabled)
SELECT user_id, 'last_chance', '20:00:00'::TIME, false
FROM public.user_preferences
ON CONFLICT DO NOTHING;

-- 6) Seed notification message variants (idempotent)
INSERT INTO public.notification_message_variants (category, slot, variant_key, weight, experiment_key, title_template, body_template, metadata, is_active)
VALUES
('reminder', 'morning', 'encouraging', 2, 'morning_tone_test', 'Good morning! 💪', 'Start your day strong with a quick plank session!', '{"tone": "encouraging"}', true),
('reminder', 'morning', 'gentle', 1, 'morning_tone_test', 'Morning stretch time', 'A gentle plank to wake up your core', '{"tone": "gentle"}', true),
('reminder', 'evening', 'motivational', 2, 'evening_tone_test', 'Evening workout time! 🔥', 'End your day with strength - plank time!', '{"tone": "motivational"}', true),
('reminder', 'evening', 'relaxed', 1, 'evening_tone_test', 'Wind down workout', 'A calming plank session to finish your day', '{"tone": "relaxed"}', true),
('streak_risk', NULL, 'urgent', 2, 'streak_urgency_test', 'Your streak is at risk! ⚠️', 'Don''t break your {{streak_days}} day streak - quick plank now!', '{"urgency": "high"}', true),
('streak_risk', NULL, 'supportive', 1, 'streak_urgency_test', 'Keep it going! 💪', 'You''ve got {{streak_days}} days - just a quick plank to continue!', '{"urgency": "low"}', true),
('achievement', NULL, 'celebration', 2, 'achievement_style_test', 'Achievement Unlocked! 🏆', 'Amazing! You just earned: {{achievement_name}}', '{"style": "celebration"}', true),
('achievement', NULL, 'progress', 1, 'achievement_style_test', 'Progress milestone! ⭐', 'Great work reaching: {{achievement_name}}', '{"style": "progress"}', true)
ON CONFLICT DO NOTHING;