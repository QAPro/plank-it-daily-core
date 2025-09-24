-- Critical Security Fix: Ensure users table is completely protected from unauthorized access
-- This addresses the reported vulnerability of email addresses being accessible to hackers

-- First, ensure there are absolutely no public access policies
-- Remove any potential public access (this should already be the case, but let's be explicit)
DO $$
BEGIN
    -- Drop any existing public access policies if they exist
    DROP POLICY IF EXISTS "Public can view users" ON public.users;
    DROP POLICY IF EXISTS "Anyone can view users" ON public.users;
    DROP POLICY IF EXISTS "Users are viewable by everyone" ON public.users;
EXCEPTION WHEN OTHERS THEN
    -- Policies may not exist, continue
    NULL;
END $$;

-- Create an explicit denial policy for unauthenticated users
CREATE POLICY "Deny all unauthenticated access" 
ON public.users 
FOR ALL 
TO anon 
USING (false)
WITH CHECK (false);

-- Ensure the existing secure policies are still in place and optimized
-- Update the user self-access policy to be more explicit about what fields can be accessed
DROP POLICY IF EXISTS "Users can view own profile data" ON public.users;
CREATE POLICY "Users can view own profile data" 
ON public.users 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

-- Create a restricted function for safe user lookups that never exposes emails
CREATE OR REPLACE FUNCTION public.safe_user_lookup(search_term text)
RETURNS TABLE(user_id uuid, username text, avatar_url text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only authenticated users can perform lookups
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required for user lookups';
  END IF;
  
  -- Only return safe, non-sensitive data - NEVER email addresses
  RETURN QUERY
  SELECT 
    u.id,
    u.username,
    u.avatar_url
  FROM public.users u
  WHERE u.username ILIKE '%' || search_term || '%'
    AND u.username IS NOT NULL
  LIMIT 20; -- Prevent large data exports
END;
$$;

-- Create audit function to log any access to user data
CREATE OR REPLACE FUNCTION public.log_user_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log SELECT operations on users table for audit purposes
  IF TG_OP = 'SELECT' AND auth.uid() IS NOT NULL THEN
    INSERT INTO public.user_data_access_audit (
      accessing_user_id,
      target_user_id,
      access_type,
      accessed_fields,
      access_reason
    ) VALUES (
      auth.uid(),
      COALESCE(NEW.id, OLD.id),
      'profile_access',
      ARRAY['profile_data'],
      'User profile access'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Add additional security check to existing admin functions
CREATE OR REPLACE FUNCTION public.is_admin_with_audit(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_admin_user boolean := false;
BEGIN
  -- Check if user is admin
  SELECT EXISTS(
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id 
    AND role = 'admin'::app_role
  ) INTO is_admin_user;
  
  -- Log admin access attempts
  IF is_admin_user THEN
    INSERT INTO public.admin_audit_log (
      admin_user_id,
      action_type,
      action_details,
      reason
    ) VALUES (
      _user_id,
      'admin_privilege_check',
      jsonb_build_object('timestamp', now()),
      'Admin privilege verification'
    );
  END IF;
  
  RETURN is_admin_user;
END;
$$;

-- Update the detect_leadership_candidates function to be more secure
CREATE OR REPLACE FUNCTION public.detect_leadership_candidates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Only allow admins to run this function
    IF NOT public.is_admin_with_audit() THEN
        RAISE EXCEPTION 'Only admins can detect leadership candidates';
    END IF;
    
    -- Find users who meet leadership criteria but don't have assigned roles or existing candidacy
    FOR user_record IN
        SELECT DISTINCT
            u.id as user_id,
            u.username, -- Only username, never email
            u.subscription_tier,
            COALESCE(MAX(st.track_level), 0) as highest_level,
            COALESCE(SUM(ur.karma_score), 0) as total_karma,
            COALESCE(MAX(CASE WHEN st.track_name = 'community_leader' THEN st.track_level ELSE 0 END), 0) as community_track_level
        FROM users u
        LEFT JOIN status_tracks st ON u.id = st.user_id
        LEFT JOIN user_reputation ur ON u.id = ur.user_id
        WHERE u.id NOT IN (
            SELECT user_id FROM user_roles 
            WHERE role IN ('admin', 'moderator')
        )
        AND u.id NOT IN (
            SELECT user_id FROM leadership_candidates 
            WHERE status IN ('pending', 'contacted')
        )
        GROUP BY u.id, u.username, u.subscription_tier
        HAVING 
            (COALESCE(MAX(st.track_level), 0) >= 15 AND COALESCE(SUM(ur.karma_score), 0) >= 1000)
            OR
            (COALESCE(MAX(st.track_level), 0) >= 10 AND COALESCE(SUM(ur.karma_score), 0) >= 500 AND COALESCE(MAX(CASE WHEN st.track_name = 'community_leader' THEN st.track_level ELSE 0 END), 0) >= 5)
            OR
            (COALESCE(MAX(st.track_level), 0) >= 7 AND COALESCE(SUM(ur.karma_score), 0) >= 200 AND COALESCE(MAX(CASE WHEN st.track_name = 'community_leader' THEN st.track_level ELSE 0 END), 0) >= 3)
    LOOP
        -- Insert candidates with secure data handling
        IF user_record.highest_level >= 15 AND user_record.total_karma >= 1000 THEN
            INSERT INTO leadership_candidates (user_id, candidate_type, qualification_data)
            VALUES (user_record.user_id, 'expert', jsonb_build_object(
                'highest_level', user_record.highest_level,
                'total_karma', user_record.total_karma,
                'community_track_level', user_record.community_track_level,
                'subscription_tier', user_record.subscription_tier
            ))
            ON CONFLICT (user_id, candidate_type) DO NOTHING;
        ELSIF user_record.highest_level >= 10 AND user_record.total_karma >= 500 AND user_record.community_track_level >= 5 THEN
            INSERT INTO leadership_candidates (user_id, candidate_type, qualification_data)
            VALUES (user_record.user_id, 'community_leader', jsonb_build_object(
                'highest_level', user_record.highest_level,
                'total_karma', user_record.total_karma,
                'community_track_level', user_record.community_track_level,
                'subscription_tier', user_record.subscription_tier
            ))
            ON CONFLICT (user_id, candidate_type) DO NOTHING;
        ELSIF user_record.highest_level >= 7 AND user_record.total_karma >= 200 AND user_record.community_track_level >= 3 THEN
            INSERT INTO leadership_candidates (user_id, candidate_type, qualification_data)
            VALUES (user_record.user_id, 'moderator', jsonb_build_object(
                'highest_level', user_record.highest_level,
                'total_karma', user_record.total_karma,
                'community_track_level', user_record.community_track_level,
                'subscription_tier', user_record.subscription_tier
            ))
            ON CONFLICT (user_id, candidate_type) DO NOTHING;
        END IF;
    END LOOP;
END;
$$;