
-- 1) Ensure required extensions
create extension if not exists pg_net;
create extension if not exists pg_cron;

-- 2) Attach triggers to fire event notifications and analytics updates

-- user_achievements → notify achievement_unlocked
drop trigger if exists trg_notify_achievement_unlocked on public.user_achievements;
create trigger trg_notify_achievement_unlocked
after insert on public.user_achievements
for each row execute function public.trg_notify_achievement_unlocked();

-- user_streaks → notify streak_milestone
drop trigger if exists trg_notify_streak_milestone on public.user_streaks;
create trigger trg_notify_streak_milestone
after update on public.user_streaks
for each row execute function public.trg_notify_streak_milestone();

-- user_sessions → ensure completed_at set before insert
drop trigger if exists set_user_sessions_completed_at on public.user_sessions;
create trigger set_user_sessions_completed_at
before insert on public.user_sessions
for each row execute function public.set_user_sessions_completed_at();

-- user_sessions → notify session_completed
drop trigger if exists trg_notify_session_completed on public.user_sessions;
create trigger trg_notify_session_completed
after insert on public.user_sessions
for each row execute function public.trg_notify_session_completed();

-- user_sessions → weekly stats
drop trigger if exists trg_update_user_weekly_stats on public.user_sessions;
create trigger trg_update_user_weekly_stats
after insert on public.user_sessions
for each row execute function public.update_user_weekly_stats();

-- user_sessions → monthly stats
drop trigger if exists trg_update_user_monthly_stats on public.user_sessions;
create trigger trg_update_user_monthly_stats
after insert on public.user_sessions
for each row execute function public.update_user_monthly_stats();

-- user_sessions → goal progress
drop trigger if exists trg_update_goal_progress on public.user_sessions;
create trigger trg_update_goal_progress
after insert on public.user_sessions
for each row execute function public.update_goal_progress();

-- 3) Cron jobs to call the Edge Function: notification-events
do $$
declare
  v_jobid int;
begin
  -- Daily reminders every minute (function applies a 5-minute window)
  select jobid into v_jobid from cron.job where jobname = 'notification-daily-reminders';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;

  perform cron.schedule(
    'notification-daily-reminders',
    '* * * * *',
    $$
    select net.http_post(
      url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
      headers:='{"Content-Type":"application/json"}'::jsonb,
      body:='{"task":"daily_reminders"}'::jsonb
    );
    $$
  );

  -- Streak risk alerts hourly at :00
  select jobid into v_jobid from cron.job where jobname = 'notification-streak-risk';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;

  perform cron.schedule(
    'notification-streak-risk',
    '0 * * * *',
    $$
    select net.http_post(
      url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
      headers:='{"Content-Type":"application/json"}'::jsonb,
      body:='{"task":"streak_risk"}'::jsonb
    );
    $$
  );

  -- Weekly summary on Mondays at 09:00 UTC
  select jobid into v_jobid from cron.job where jobname = 'notification-weekly-summary';
  if v_jobid is not null then
    perform cron.unschedule(v_jobid);
  end if;

  perform cron.schedule(
    'notification-weekly-summary',
    '0 9 * * MON',
    $$
    select net.http_post(
      url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
      headers:='{"Content-Type":"application/json"}'::jsonb,
      body:='{"task":"weekly_summary"}'::jsonb
    );
    $$
  );
end $$;
