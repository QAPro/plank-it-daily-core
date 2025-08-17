
-- Extend feature_flags table with cohort targeting and A/B testing fields
ALTER TABLE feature_flags 
ADD COLUMN cohort_rules JSONB DEFAULT '{}',
ADD COLUMN ab_test_config JSONB DEFAULT NULL,
ADD COLUMN rollout_strategy TEXT DEFAULT 'immediate' CHECK (rollout_strategy IN ('immediate', 'gradual', 'scheduled')),
ADD COLUMN rollout_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN rollout_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Create feature_cohorts table for defining user segments
CREATE TABLE feature_cohorts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  rules JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ab_test_assignments table to track user A/B test assignments
CREATE TABLE ab_test_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  variant TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  assignment_hash TEXT NOT NULL,
  UNIQUE(user_id, feature_name)
);

-- Create user_cohort_memberships table for caching cohort assignments
CREATE TABLE user_cohort_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  cohort_id UUID REFERENCES feature_cohorts(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  UNIQUE(user_id, cohort_id)
);

-- Enable RLS on new tables
ALTER TABLE feature_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ab_test_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cohort_memberships ENABLE ROW LEVEL SECURITY;

-- RLS policies for feature_cohorts
CREATE POLICY "Admins can manage cohorts" ON feature_cohorts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

CREATE POLICY "Anyone can view active cohorts" ON feature_cohorts
  FOR SELECT USING (is_active = true);

-- RLS policies for ab_test_assignments
CREATE POLICY "Users can view own test assignments" ON ab_test_assignments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create test assignments" ON ab_test_assignments
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all test assignments" ON ab_test_assignments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- RLS policies for user_cohort_memberships
CREATE POLICY "Users can view own cohort memberships" ON user_cohort_memberships
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage cohort memberships" ON user_cohort_memberships
  FOR ALL WITH CHECK (true);

CREATE POLICY "Admins can view all cohort memberships" ON user_cohort_memberships
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Create function to evaluate user cohort membership
CREATE OR REPLACE FUNCTION evaluate_user_cohort(
  _user_id UUID,
  _cohort_rules JSONB
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_data RECORD;
  rule_key TEXT;
  rule_value JSONB;
  subscription_tier TEXT;
  current_level INTEGER;
  total_xp INTEGER;
  registration_date DATE;
BEGIN
  -- Get user data
  SELECT u.subscription_tier, u.current_level, u.total_xp, u.created_at::date
  INTO user_data
  FROM users u
  WHERE u.id = _user_id;
  
  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;
  
  subscription_tier := user_data.subscription_tier;
  current_level := user_data.current_level;
  total_xp := user_data.total_xp;
  registration_date := user_data.created_at;
  
  -- Evaluate each rule
  FOR rule_key, rule_value IN SELECT * FROM jsonb_each(_cohort_rules)
  LOOP
    CASE rule_key
      WHEN 'subscription_tiers' THEN
        IF NOT (subscription_tier = ANY(ARRAY(SELECT jsonb_array_elements_text(rule_value)))) THEN
          RETURN FALSE;
        END IF;
      WHEN 'min_level' THEN
        IF current_level < (rule_value->>0)::INTEGER THEN
          RETURN FALSE;
        END IF;
      WHEN 'max_level' THEN
        IF current_level > (rule_value->>0)::INTEGER THEN
          RETURN FALSE;
        END IF;
      WHEN 'min_xp' THEN
        IF total_xp < (rule_value->>0)::INTEGER THEN
          RETURN FALSE;
        END IF;
      WHEN 'registration_after' THEN
        IF registration_date <= (rule_value->>0)::DATE THEN
          RETURN FALSE;
        END IF;
      WHEN 'registration_before' THEN
        IF registration_date >= (rule_value->>0)::DATE THEN
          RETURN FALSE;
        END IF;
    END CASE;
  END LOOP;
  
  RETURN TRUE;
END;
$$;

-- Create function to get user's feature flag value with cohort and A/B testing
CREATE OR REPLACE FUNCTION get_user_feature_flag(
  _user_id UUID,
  _feature_name TEXT
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  flag_record RECORD;
  user_override RECORD;
  cohort_match BOOLEAN := FALSE;
  rollout_percentage INTEGER;
  user_hash TEXT;
  hash_value INTEGER;
  ab_assignment RECORD;
  result JSONB := '{"enabled": false, "variant": null}';
BEGIN
  -- Check for user-specific override first
  SELECT * INTO user_override
  FROM user_feature_overrides
  WHERE user_id = _user_id 
    AND feature_name = _feature_name
    AND (expires_at IS NULL OR expires_at > now());
  
  IF FOUND THEN
    result := jsonb_build_object(
      'enabled', user_override.is_enabled,
      'variant', 'override',
      'source', 'user_override'
    );
    RETURN result;
  END IF;
  
  -- Get feature flag
  SELECT * INTO flag_record
  FROM feature_flags
  WHERE feature_name = _feature_name AND is_enabled = true;
  
  IF NOT FOUND THEN
    RETURN result;
  END IF;
  
  -- Check cohort rules if they exist
  IF flag_record.cohort_rules != '{}' THEN
    cohort_match := evaluate_user_cohort(_user_id, flag_record.cohort_rules);
    IF NOT cohort_match THEN
      RETURN result;
    END IF;
  END IF;
  
  -- Check rollout percentage
  rollout_percentage := COALESCE(flag_record.rollout_percentage, 100);
  IF rollout_percentage < 100 THEN
    user_hash := md5(_user_id::text || _feature_name);
    hash_value := ('x' || substr(user_hash, 1, 8))::bit(32)::integer;
    IF abs(hash_value) % 100 >= rollout_percentage THEN
      RETURN result;
    END IF;
  END IF;
  
  -- Handle A/B testing
  IF flag_record.ab_test_config IS NOT NULL THEN
    -- Check existing assignment
    SELECT * INTO ab_assignment
    FROM ab_test_assignments
    WHERE user_id = _user_id AND feature_name = _feature_name;
    
    IF NOT FOUND THEN
      -- Create new assignment
      DECLARE
        variants JSONB := flag_record.ab_test_config->'variants';
        variant_count INTEGER := jsonb_array_length(variants);
        selected_variant TEXT;
        assignment_hash_val TEXT;
      BEGIN
        assignment_hash_val := md5(_user_id::text || _feature_name || 'ab_test');
        selected_variant := (variants->>((('x' || substr(assignment_hash_val, 1, 8))::bit(32)::integer % variant_count)));
        
        INSERT INTO ab_test_assignments (user_id, feature_name, variant, assignment_hash)
        VALUES (_user_id, _feature_name, selected_variant, assignment_hash_val);
        
        result := jsonb_build_object(
          'enabled', true,
          'variant', selected_variant,
          'source', 'ab_test'
        );
      END;
    ELSE
      result := jsonb_build_object(
        'enabled', true,
        'variant', ab_assignment.variant,
        'source', 'ab_test'
      );
    END IF;
  ELSE
    -- Standard feature flag
    result := jsonb_build_object(
      'enabled', true,
      'variant', 'default',
      'source', 'feature_flag'
    );
  END IF;
  
  RETURN result;
END;
$$;

-- Create function to refresh user cohort memberships
CREATE OR REPLACE FUNCTION refresh_user_cohort_memberships(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  cohort_record RECORD;
BEGIN
  -- Remove expired memberships
  DELETE FROM user_cohort_memberships
  WHERE user_id = _user_id 
    AND expires_at IS NOT NULL 
    AND expires_at <= now();
  
  -- Check all active cohorts
  FOR cohort_record IN 
    SELECT id, rules FROM feature_cohorts WHERE is_active = true
  LOOP
    IF evaluate_user_cohort(_user_id, cohort_record.rules) THEN
      -- Add membership if not exists
      INSERT INTO user_cohort_memberships (user_id, cohort_id)
      VALUES (_user_id, cohort_record.id)
      ON CONFLICT (user_id, cohort_id) DO NOTHING;
    ELSE
      -- Remove membership if exists
      DELETE FROM user_cohort_memberships
      WHERE user_id = _user_id AND cohort_id = cohort_record.id;
    END IF;
  END LOOP;
END;
$$;
