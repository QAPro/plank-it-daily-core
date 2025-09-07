-- Create notification interactions table for click analytics
create table if not exists public.notification_interactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  notification_type text not null,
  category text,
  action text not null,
  data jsonb default '{}'::jsonb,
  clicked_at timestamptz not null default now()
);

-- Enable RLS
alter table public.notification_interactions enable row level security;

-- Policies
create policy if not exists "Admins can view all notification interactions"
  on public.notification_interactions
  for select
  using (exists (select 1 from public.user_roles ur where ur.user_id = auth.uid() and ur.role = 'admin'::public.app_role));

create policy if not exists "Users can view own notification interactions"
  on public.notification_interactions
  for select
  using (auth.uid() = user_id);

create policy if not exists "System can insert notification interactions"
  on public.notification_interactions
  for insert
  with check (true);

-- Helpful indexes
create index if not exists idx_notification_interactions_user_time
  on public.notification_interactions (user_id, clicked_at desc);

create index if not exists idx_notification_interactions_type_time
  on public.notification_interactions (notification_type, clicked_at desc);

-- Schedule automated jobs via pg_cron + pg_net to call the edge function `notification-events`
-- Daily workout reminders (hourly trigger, function respects user prefs)
select
  cron.schedule(
    'notify-daily-reminders-hourly',
    '0 * * * *',
    $$
    select net.http_post(
      url := 'https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"}'::jsonb,
      body := '{"task":"daily_reminders"}'::jsonb
    );
    $$
  );

-- Weekly summaries every Sunday at 09:00 UTC
select
  cron.schedule(
    'notify-weekly-summaries',
    '0 9 * * 0',
    $$
    select net.http_post(
      url := 'https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"}'::jsonb,
      body := '{"task":"weekly_summary"}'::jsonb
    );
    $$
  );

-- Streak risk alerts daily at 17:00 UTC
select
  cron.schedule(
    'notify-streak-risk-daily',
    '0 17 * * *',
    $$
    select net.http_post(
      url := 'https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"}'::jsonb,
      body := '{"task":"streak_risk_alerts"}'::jsonb
    );
    $$
  );

-- Re-engagement daily at 12:00 UTC
select
  cron.schedule(
    'notify-reengagement-daily',
    '0 12 * * *',
    $$
    select net.http_post(
      url := 'https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
      headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"}'::jsonb,
      body := '{"task":"reengagement"}'::jsonb
    );
    $$
  );