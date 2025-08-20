
-- 1) Enable RLS on league_seasons
ALTER TABLE public.league_seasons ENABLE ROW LEVEL SECURITY;

-- 2) Anyone can view active seasons
CREATE POLICY "Anyone can view active league seasons"
  ON public.league_seasons
  FOR SELECT
  USING (is_active = true);

-- 3) Admins can manage league seasons (reads and writes)
-- Use a security-definer function to avoid recursion and centralize admin checks
CREATE POLICY "Admins can manage league seasons"
  ON public.league_seasons
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4) Fix recursive policy on user_roles
-- The existing policy queries user_roles in its own policy, causing infinite recursion.
DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));
