-- Create leadership candidates table for tracking users eligible for leadership roles
CREATE TABLE public.leadership_candidates (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_type TEXT NOT NULL CHECK (candidate_type IN ('moderator', 'community_leader', 'expert')),
    qualification_data JSONB NOT NULL DEFAULT '{}',
    qualification_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'promoted', 'dismissed')),
    reviewed_by UUID REFERENCES auth.users(id),
    review_notes TEXT,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    
    -- Prevent duplicate candidates for same type
    UNIQUE(user_id, candidate_type)
);

-- Enable RLS
ALTER TABLE public.leadership_candidates ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can manage leadership candidates"
ON public.leadership_candidates
FOR ALL
USING (public.is_admin(auth.uid()));

-- Function to detect and add leadership candidates
CREATE OR REPLACE FUNCTION public.detect_leadership_candidates()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    user_record RECORD;
BEGIN
    -- Find users who meet leadership criteria but don't have assigned roles or existing candidacy
    FOR user_record IN
        SELECT DISTINCT
            u.id as user_id,
            u.username,
            u.subscription_tier,
            COALESCE(MAX(st.track_level), 0) as highest_level,
            COALESCE(SUM(ur.karma_score), 0) as total_karma,
            COALESCE(MAX(CASE WHEN st.track_name = 'community_leader' THEN st.track_level ELSE 0 END), 0) as community_track_level
        FROM users u
        LEFT JOIN status_tracks st ON u.id = st.user_id
        LEFT JOIN user_reputation ur ON u.id = ur.user_id
        WHERE u.id NOT IN (
            -- Exclude users who already have assigned roles
            SELECT user_id FROM user_roles 
            WHERE role IN ('admin', 'moderator')
        )
        AND u.id NOT IN (
            -- Exclude users who are already candidates with pending/contacted status
            SELECT user_id FROM leadership_candidates 
            WHERE status IN ('pending', 'contacted')
        )
        GROUP BY u.id, u.username, u.subscription_tier
        HAVING 
            -- Expert criteria: level 15+, 1000+ karma
            (COALESCE(MAX(st.track_level), 0) >= 15 AND COALESCE(SUM(ur.karma_score), 0) >= 1000)
            OR
            -- Community Leader criteria: level 10+, 500+ karma, community track 5+
            (COALESCE(MAX(st.track_level), 0) >= 10 AND COALESCE(SUM(ur.karma_score), 0) >= 500 AND COALESCE(MAX(CASE WHEN st.track_name = 'community_leader' THEN st.track_level ELSE 0 END), 0) >= 5)
            OR
            -- Moderator criteria: level 7+, 200+ karma, community track 3+
            (COALESCE(MAX(st.track_level), 0) >= 7 AND COALESCE(SUM(ur.karma_score), 0) >= 200 AND COALESCE(MAX(CASE WHEN st.track_name = 'community_leader' THEN st.track_level ELSE 0 END), 0) >= 3)
    LOOP
        -- Determine candidate type based on qualifications
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

-- Function to promote candidate to actual role
CREATE OR REPLACE FUNCTION public.promote_leadership_candidate(_candidate_id UUID, _admin_id UUID, _notes TEXT DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    candidate_record RECORD;
BEGIN
    -- Only admins can promote candidates
    IF NOT public.is_admin(_admin_id) THEN
        RAISE EXCEPTION 'Only admins can promote leadership candidates';
    END IF;
    
    -- Get candidate details
    SELECT * INTO candidate_record
    FROM leadership_candidates
    WHERE id = _candidate_id AND status IN ('pending', 'contacted');
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Candidate not found or already processed';
    END IF;
    
    -- Assign the role
    INSERT INTO user_roles (user_id, role)
    VALUES (candidate_record.user_id, candidate_record.candidate_type::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Update candidate status
    UPDATE leadership_candidates
    SET 
        status = 'promoted',
        reviewed_by = _admin_id,
        review_notes = _notes,
        reviewed_at = now(),
        updated_at = now()
    WHERE id = _candidate_id;
    
    -- Audit log
    INSERT INTO admin_audit_log (admin_user_id, target_user_id, action_type, action_details, reason)
    VALUES (_admin_id, candidate_record.user_id, 'promote_leadership_candidate', 
            jsonb_build_object('candidate_type', candidate_record.candidate_type, 'candidate_id', _candidate_id), 
            _notes);
    
    RETURN true;
END;
$$;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_leadership_candidates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_leadership_candidates_updated_at
    BEFORE UPDATE ON public.leadership_candidates
    FOR EACH ROW
    EXECUTE FUNCTION public.update_leadership_candidates_updated_at();

-- Create index for efficient queries
CREATE INDEX idx_leadership_candidates_status ON public.leadership_candidates(status);
CREATE INDEX idx_leadership_candidates_user_id ON public.leadership_candidates(user_id);