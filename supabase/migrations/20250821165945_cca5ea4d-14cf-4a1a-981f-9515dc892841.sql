
-- 1) Enforce fixed search_path='public' for any remaining SECURITY DEFINER functions missing it
DO $$
DECLARE 
  r RECORD;
BEGIN
  FOR r IN
    SELECT 
      n.nspname AS schema_name,
      p.proname AS function_name,
      oidvectortypes(p.proargtypes) AS argtypes
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public'
      AND p.prosecdef = true  -- SECURITY DEFINER
      AND (
        p.proconfig IS NULL
        OR NOT EXISTS (
          SELECT 1 FROM unnest(p.proconfig) AS cfg WHERE cfg ILIKE 'search_path=%'
        )
      )
  LOOP
    EXECUTE format(
      'ALTER FUNCTION %I.%I(%s) SET search_path TO public;',
      r.schema_name, r.function_name, r.argtypes
    );
  END LOOP;
END;
$$;

-- 2) Lock down materialized views explicitly (silence MV-in-API warning)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname='public' AND matviewname='user_engagement_metrics') THEN
    REVOKE ALL ON MATERIALIZED VIEW public.user_engagement_metrics FROM PUBLIC, anon, authenticated;
  END IF;

  IF EXISTS (SELECT 1 FROM pg_matviews WHERE schemaname='public' AND matviewname='subscription_analytics') THEN
    REVOKE ALL ON MATERIALIZED VIEW public.subscription_analytics FROM PUBLIC, anon, authenticated;
  END IF;
END;
$$;
