-- Create notification interactions table for click analytics
CREATE TABLE IF NOT EXISTS public.notification_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  notification_type text not null,
  category text,
  action text not null,
  data jsonb default '{}'::jsonb,
  clicked_at timestamptz not null default now()
);

-- Enable RLS
ALTER TABLE public.notification_interactions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Admins can view all notification interactions"
  ON public.notification_interactions
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::public.app_role));

CREATE POLICY "Users can view own notification interactions"
  ON public.notification_interactions
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notification interactions"
  ON public.notification_interactions
  FOR INSERT
  WITH CHECK (true);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_notification_interactions_user_time
  ON public.notification_interactions (user_id, clicked_at desc);

CREATE INDEX IF NOT EXISTS idx_notification_interactions_type_time
  ON public.notification_interactions (notification_type, clicked_at desc);