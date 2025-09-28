-- Remove the problematic blanket denial policy from users table
DROP POLICY IF EXISTS "Deny all unauthenticated access" ON public.users;

-- The existing user-specific policies are already correct:
-- - "Users can view own profile data" (auth.uid() = id)
-- - "Users can update own profile" (auth.uid() = id) 
-- - "Users can create own profile"
-- - "Admins can view user data for management" (is_user_admin() = true)
-- - "Admins can update user data" (is_user_admin() = true)

-- These policies already provide proper security without the blanket denial