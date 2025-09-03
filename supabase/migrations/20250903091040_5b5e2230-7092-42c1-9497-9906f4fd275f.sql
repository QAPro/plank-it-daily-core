-- Add cron schedules for notification events
-- Only add if pg_cron extension exists
SELECT CASE 
  WHEN EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron') THEN
    'Extension pg_cron is available'
  ELSE 
    'Extension pg_cron not available - schedules skipped'
END AS cron_status;

-- Schedule daily workout reminders (every 5 minutes during active hours)
SELECT cron.schedule(
  'daily-workout-reminders',
  '*/5 * * * *',
  $$
  select net.http_post(
    url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:='{"task":"daily_reminders"}'::jsonb
  );
  $$
) WHERE EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron');

-- Schedule streak risk alerts (daily at 18:00 UTC)
SELECT cron.schedule(
  'streak-risk-alerts',
  '0 18 * * *',
  $$
  select net.http_post(
    url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:='{"task":"streak_risk"}'::jsonb
  );
  $$
) WHERE EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron');

-- Schedule weekly progress summary (Sundays at 18:00 UTC)
SELECT cron.schedule(
  'weekly-progress-summary',
  '0 18 * * 0',
  $$
  select net.http_post(
    url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
    headers:='{"Content-Type":"application/json"}'::jsonb,
    body:='{"task":"weekly_summary"}'::jsonb
  );
  $$
) WHERE EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pg_cron');