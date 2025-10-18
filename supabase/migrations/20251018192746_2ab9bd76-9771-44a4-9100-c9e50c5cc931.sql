-- Add explicit search_path to trigger function for security
-- This prevents schema-based attacks and satisfies security linter requirements

CREATE OR REPLACE FUNCTION public.update_ab_experiments_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;