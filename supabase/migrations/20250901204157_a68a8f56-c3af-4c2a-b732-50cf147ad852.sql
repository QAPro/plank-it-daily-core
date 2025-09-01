-- 1) Safe username availability check (boolean only, no PII)
CREATE OR REPLACE FUNCTION public.does_username_exist(target_username text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS(
    SELECT 1
    FROM public.users u
    WHERE lower(u.username) = lower(target_username)
  );
$$;

-- Expose to client roles so the app can use it
GRANT EXECUTE ON FUNCTION public.does_username_exist(text) TO anon, authenticated;

-- 2) Performance index for case-insensitive lookups
CREATE INDEX IF NOT EXISTS idx_users_lower_username ON public.users ((lower(username)));

-- NOTE: We intentionally do not modify find_user_by_username_or_email here to avoid breaking username login.
-- For stronger hardening, we can later restrict it to admins or reduce fields returned, pending your approval.
