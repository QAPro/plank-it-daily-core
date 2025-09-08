-- Set up cron job for hook analytics rollup (runs nightly at 2 AM UTC)
SELECT cron.schedule(
  'hook-analytics-rollup',
  '0 2 * * *', -- Daily at 2 AM UTC
  $$
  SELECT
    net.http_post(
        url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/hook-analytics-rollup',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"}'::jsonb,
        body:='{"task": "nightly_rollup"}'::jsonb
    ) as request_id;
  $$
);