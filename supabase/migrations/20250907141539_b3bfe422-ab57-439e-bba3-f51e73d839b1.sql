-- 1) Time zone support for scheduling
ALTER TABLE public.user_preferences
  ADD COLUMN IF NOT EXISTS time_zone text DEFAULT 'UTC';

-- 2) Per-user multi-slot reminder schedules
CREATE TABLE IF NOT EXISTS public.user_reminder_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  slot text NOT NULL CHECK (slot IN ('morning','lunch','evening','last_chance')),
  reminder_time time NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_reminder_slots ENABLE ROW LEVEL SECURITY;

-- Users manage their own slots
DROP POLICY IF EXISTS "Users can manage own reminder slots" ON public.user_reminder_slots;
CREATE POLICY "Users can manage own reminder slots"
ON public.user_reminder_slots
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Admins can view all
DROP POLICY IF EXISTS "Admins can view all reminder slots" ON public.user_reminder_slots;
CREATE POLICY "Admins can view all reminder slots"
ON public.user_reminder_slots
FOR SELECT
USING (public.is_admin(auth.uid()));

-- Ensure one row per slot per user
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_reminder_slots_unique
  ON public.user_reminder_slots(user_id, slot);

-- Updated at trigger
DROP TRIGGER IF EXISTS set_updated_at_user_reminder_slots ON public.user_reminder_slots;
CREATE TRIGGER set_updated_at_user_reminder_slots
BEFORE UPDATE ON public.user_reminder_slots
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 3) Notification interactions logging
CREATE TABLE IF NOT EXISTS public.notification_interactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  notification_type text,
  category text,
  action text,
  data jsonb DEFAULT '{}'::jsonb,
  interacted_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_interactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all notification interactions" ON public.notification_interactions;
CREATE POLICY "Admins can view all notification interactions"
ON public.notification_interactions
FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own notification interactions" ON public.notification_interactions;
CREATE POLICY "Users can view own notification interactions"
ON public.notification_interactions
FOR SELECT
USING (auth.uid() = user_id);

-- Allow system (service role) to insert
DROP POLICY IF EXISTS "System can insert notification interactions" ON public.notification_interactions;
CREATE POLICY "System can insert notification interactions"
ON public.notification_interactions
FOR INSERT
WITH CHECK (true);

-- Create index after table exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notification_interactions_user_time') THEN
    CREATE INDEX idx_notification_interactions_user_time
      ON public.notification_interactions(user_id, interacted_at DESC);
  END IF;
END
$$;

-- 4) A/B testing message variants
CREATE TABLE IF NOT EXISTS public.notification_message_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL,
  slot text,
  variant_key text NOT NULL,
  content jsonb NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_message_variants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage notification message variants" ON public.notification_message_variants;
CREATE POLICY "Admins can manage notification message variants"
ON public.notification_message_variants
FOR ALL
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Ensure uniqueness per category/slot/variant_key
CREATE UNIQUE INDEX IF NOT EXISTS idx_notification_message_variants_unique
  ON public.notification_message_variants(category, COALESCE(slot, ''), variant_key);

DROP TRIGGER IF EXISTS set_updated_at_notification_message_variants ON public.notification_message_variants;
CREATE TRIGGER set_updated_at_notification_message_variants
BEFORE UPDATE ON public.notification_message_variants
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 5) User variant assignments (sticky A/B)
CREATE TABLE IF NOT EXISTS public.user_notification_variant_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  slot text,
  variant_id uuid NOT NULL REFERENCES public.notification_message_variants(id) ON DELETE CASCADE,
  assignment_hash text,
  assigned_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_notification_variant_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view all notification variant assignments" ON public.user_notification_variant_assignments;
CREATE POLICY "Admins can view all notification variant assignments"
ON public.user_notification_variant_assignments
FOR SELECT
USING (public.is_admin(auth.uid()));

DROP POLICY IF EXISTS "Users can view own notification variant assignments" ON public.user_notification_variant_assignments;
CREATE POLICY "Users can view own notification variant assignments"
ON public.user_notification_variant_assignments
FOR SELECT
USING (auth.uid() = user_id);

-- Allow system (service role) to insert
DROP POLICY IF EXISTS "System can insert notification variant assignments" ON public.user_notification_variant_assignments;
CREATE POLICY "System can insert notification variant assignments"
ON public.user_notification_variant_assignments
FOR INSERT
WITH CHECK (true);

-- Ensure one assignment per user/category/slot
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_variant_assignment_unique
  ON public.user_notification_variant_assignments(user_id, category, COALESCE(slot, ''));

-- 6) Analytics-ready indexes on existing logs
CREATE INDEX IF NOT EXISTS idx_notification_logs_user_time
  ON public.notification_logs(user_id, sent_at DESC);