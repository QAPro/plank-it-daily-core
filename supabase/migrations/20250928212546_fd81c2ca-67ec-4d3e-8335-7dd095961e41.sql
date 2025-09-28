-- Create cron job to execute rollout schedules every minute
SELECT cron.schedule(
  'execute-rollout-schedules',
  '* * * * *', -- Every minute
  $$
  SELECT
    net.http_post(
        url:='https://kgwmplptoctmoaefnpfg.supabase.co/functions/v1/execute-rollout-schedules',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnd21wbHB0b2N0bW9hZWZucGZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwODgyMjMsImV4cCI6MjA2NzY2NDIyM30.vlPPhkFrPL-pEM974VB9h4KC9XebvmvWQa80Cl6Uidw"}'::jsonb,
        body:=concat('{"timestamp": "', now(), '"}')::jsonb
    ) as request_id;
  $$
);