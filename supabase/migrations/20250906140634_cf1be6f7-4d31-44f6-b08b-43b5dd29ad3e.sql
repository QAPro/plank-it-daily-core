
-- Enable required extensions (idempotent)
create extension if not exists pg_net with schema extensions;
create extension if not exists pg_cron with schema extensions;

-- EVENT-DRIVEN NOTIFICATION TRIGGERS

-- 1) Ensure user_sessions.completed_at is set if null
drop trigger if exists trg_set_user_sessions_completed_at on public.user_sessions;
create trigger trg_set_user_sessions_completed_at
before insert on public.user_sessions
for each row
execute function public.set_user_sessions_completed_at();

-- 2) Notify on session completion
drop trigger if exists trg_notify_session_completed on public.user_sessions;
create trigger trg_notify_session_completed
after insert on public.user_sessions
for each row
execute function public.trg_notify_session_completed();

-- 3) Notify on achievement unlocked
drop trigger if exists trg_notify_achievement_unlocked on public.user_achievements;
create trigger trg_notify_achievement_unlocked
after insert on public.user_achievements
for each row
execute function public.trg_notify_achievement_unlocked();

-- 4) Notify on streak milestone when streak changes
drop trigger if exists trg_notify_streak_milestone on public.user_streaks;
create trigger trg_notify_streak_milestone
after update on public.user_streaks
for each row
when (NEW.current_streak is distinct from OLD.current_streak)
execute function public.trg_notify_streak_milestone();

-- SCHEDULED TASKS (CRON)

-- Unschedule existing jobs if they exist (idempotent cleanup)
select cron.unschedule('notification-daily-reminders-every-5-min') where exists (
  select 1 from cron.job where jobname = 'notification-daily-reminders-every-5-min'
);
select cron.unschedule('notification-streak-risk-alerts-hourly') where exists (
  select 1 from cron.job where jobname = 'notification-streak-risk-alerts-hourly'
);
select cron.unschedule('notification-weekly-summary-sundays') where exists (
  select 1 from cron.job where jobname = 'notification-weekly-summary-sundays'
);

-- 1) Daily reminders: runs every 5 minutes and function matches users whose reminder_time is now (±5 minutes)
select
  cron.schedule(
    'notification-daily-reminders-every-5-min',
    '*/5 * * * *',
    $$
    select
      net.http_post(
        url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
        headers:='{
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"
        }'::jsonb,
        body:='{"task":"daily_reminders"}'::jsonb
      ) as request_id;
    $$
  );

-- 2) Streak risk alerts: run hourly
select
  cron.schedule(
    'notification-streak-risk-alerts-hourly',
    '0 * * * *',
    $$
    select
      net.http_post(
        url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
        headers:='{
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"
        }'::jsonb,
        body:='{"task":"streak_risk_alerts"}'::jsonb
      ) as request_id;
    $$
  );

-- 3) Weekly summary: Sundays at 17:00 UTC
select
  cron.schedule(
    'notification-weekly-summary-sundays',
    '0 17 * * 0',
    $$
    select
      net.http_post(
        url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
        headers:='{
          "Content-Type": "application/json",
          "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw",
          "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"
        }'::jsonb,
        body:='{"task":"weekly_summary"}'::jsonb
      ) as request_id;
    $$
  );
