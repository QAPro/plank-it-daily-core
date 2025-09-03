-- Address linter warnings without using unsupported features on materialized views

-- 1) Ensure functions have a fixed search_path (example: update_push_subscription_updated_at)
CREATE OR REPLACE FUNCTION public.update_push_subscription_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- 2) Prevent exposing materialized views via the Data API by revoking API roles
DO $$
BEGIN
  -- Revoke from anon/authenticated if they exist
  PERFORM 1 FROM pg_roles WHERE rolname = 'anon';
  IF FOUND THEN
    EXECUTE 'REVOKE ALL ON MATERIALIZED VIEW public.subscription_analytics FROM anon;';
    EXECUTE 'REVOKE ALL ON MATERIALIZED VIEW public.user_engagement_metrics FROM anon;';
  END IF;

  PERFORM 1 FROM pg_roles WHERE rolname = 'authenticated';
  IF FOUND THEN
    EXECUTE 'REVOKE ALL ON MATERIALIZED VIEW public.subscription_analytics FROM authenticated;';
    EXECUTE 'REVOKE ALL ON MATERIALIZED VIEW public.user_engagement_metrics FROM authenticated;';
  END IF;
END $$;

-- 3) NOTE: Auth OTP expiry must be updated in the Dashboard (Auth > Settings). Recommend 300 seconds.