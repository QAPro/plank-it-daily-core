-- Schedule automated jobs via pg_cron + pg_net to call the edge function `notification-events`
-- Daily workout reminders (hourly trigger, function respects user prefs)
SELECT cron.schedule(
  'notify-daily-reminders-hourly',
  '0 * * * *',
  $$
  SELECT net.http_post(
    url := 'https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"}'::jsonb,
    body := '{"task":"daily_reminders"}'::jsonb
  );
  $$
);

-- Weekly summaries every Sunday at 09:00 UTC
SELECT cron.schedule(
  'notify-weekly-summaries',
  '0 9 * * 0',
  $$
  SELECT net.http_post(
    url := 'https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"}'::jsonb,
    body := '{"task":"weekly_summary"}'::jsonb
  );
  $$
);

-- Streak risk alerts daily at 17:00 UTC
SELECT cron.schedule(
  'notify-streak-risk-daily',
  '0 17 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"}'::jsonb,
    body := '{"task":"streak_risk_alerts"}'::jsonb
  );
  $$
);

-- Re-engagement daily at 12:00 UTC
SELECT cron.schedule(
  'notify-reengagement-daily',
  '0 12 * * *',
  $$
  SELECT net.http_post(
    url := 'https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/notification-events',
    headers := '{"Content-Type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"}'::jsonb,
    body := '{"task":"reengagement"}'::jsonb
  );
  $$
);