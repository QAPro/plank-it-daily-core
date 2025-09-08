-- Investment Protection System Schema

-- Cross-platform data weaving table
CREATE TABLE public.user_investment_weaving (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  composite_score NUMERIC NOT NULL DEFAULT 0,
  social_weight NUMERIC NOT NULL DEFAULT 0.33,
  mastery_weight NUMERIC NOT NULL DEFAULT 0.33,
  status_weight NUMERIC NOT NULL DEFAULT 0.34,
  interdependency_factor NUMERIC NOT NULL DEFAULT 1.0,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Time-sensitive investments that create lock-in
CREATE TABLE public.investment_streaks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  streak_type TEXT NOT NULL,
  current_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  max_multiplier_achieved NUMERIC NOT NULL DEFAULT 1.0,
  last_activity_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_investment_value NUMERIC NOT NULL DEFAULT 0,
  reset_penalty_value NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Seasonal/Limited certifications that expire
CREATE TABLE public.seasonal_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  certification_name TEXT NOT NULL,
  season_year INTEGER NOT NULL,
  season_period TEXT NOT NULL, -- 'spring', 'summer', 'fall', 'winter'
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  maintenance_requirement JSONB NOT NULL DEFAULT '{}',
  expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
  max_holders INTEGER DEFAULT 100,
  current_holders INTEGER DEFAULT 0,
  prestige_value NUMERIC NOT NULL DEFAULT 100,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User seasonal certification progress
CREATE TABLE public.user_seasonal_certifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  certification_id UUID NOT NULL REFERENCES seasonal_certifications(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  maintenance_score NUMERIC NOT NULL DEFAULT 100,
  is_expired BOOLEAN NOT NULL DEFAULT false,
  abandonment_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Invitation-only features and scarcity mechanics
CREATE TABLE public.exclusive_features (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL,
  feature_type TEXT NOT NULL, -- 'invitation_only', 'limited_edition', 'waitlist'
  max_users INTEGER,
  current_users INTEGER DEFAULT 0,
  invitation_requirements JSONB NOT NULL DEFAULT '{}',
  scarcity_multiplier NUMERIC NOT NULL DEFAULT 1.0,
  prestige_value NUMERIC NOT NULL DEFAULT 50,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User exclusive feature access
CREATE TABLE public.user_exclusive_access (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_id UUID NOT NULL REFERENCES exclusive_features(id),
  invited_by UUID,
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  access_level TEXT NOT NULL DEFAULT 'basic', -- 'basic', 'premium', 'elite'
  investment_value NUMERIC NOT NULL DEFAULT 0,
  abandonment_penalty NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Investment value tracking and abandonment cost calculation
CREATE TABLE public.user_investment_portfolio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  total_time_invested_hours NUMERIC NOT NULL DEFAULT 0,
  social_capital_value NUMERIC NOT NULL DEFAULT 0,
  mastery_investment_value NUMERIC NOT NULL DEFAULT 0,
  exclusive_access_value NUMERIC NOT NULL DEFAULT 0,
  streak_multiplier_value NUMERIC NOT NULL DEFAULT 0,
  seasonal_certification_value NUMERIC NOT NULL DEFAULT 0,
  total_portfolio_value NUMERIC NOT NULL DEFAULT 0,
  abandonment_cost_24h NUMERIC NOT NULL DEFAULT 0,
  abandonment_cost_7d NUMERIC NOT NULL DEFAULT 0,
  abandonment_cost_30d NUMERIC NOT NULL DEFAULT 0,
  recovery_difficulty_score NUMERIC NOT NULL DEFAULT 1.0,
  last_calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Data export requests (intentionally complex)
CREATE TABLE public.data_export_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  export_type TEXT NOT NULL, -- 'partial', 'full', 'investment_summary'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'complex_review', 'completed', 'expired'
  complexity_score NUMERIC NOT NULL DEFAULT 1.0,
  estimated_completion_hours INTEGER NOT NULL DEFAULT 24,
  warning_acknowledged BOOLEAN NOT NULL DEFAULT false,
  data_interconnection_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() + INTERVAL '7 days')
);

-- Enable RLS on all tables
ALTER TABLE public.user_investment_weaving ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seasonal_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_seasonal_certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exclusive_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_exclusive_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_investment_portfolio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.data_export_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_investment_weaving
CREATE POLICY "Users can view own investment weaving" ON public.user_investment_weaving
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own investment weaving" ON public.user_investment_weaving
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "System can manage investment weaving" ON public.user_investment_weaving
  FOR ALL WITH CHECK (true);

-- RLS Policies for investment_streaks
CREATE POLICY "Users can view own investment streaks" ON public.investment_streaks
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own investment streaks" ON public.investment_streaks
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for seasonal_certifications
CREATE POLICY "Anyone can view active seasonal certifications" ON public.seasonal_certifications
  FOR SELECT USING (end_date > now());
CREATE POLICY "Admins can manage seasonal certifications" ON public.seasonal_certifications
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for user_seasonal_certifications
CREATE POLICY "Users can view own seasonal certifications" ON public.user_seasonal_certifications
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own seasonal certifications" ON public.user_seasonal_certifications
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for exclusive_features
CREATE POLICY "Anyone can view active exclusive features" ON public.exclusive_features
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage exclusive features" ON public.exclusive_features
  FOR ALL USING (is_admin(auth.uid()));

-- RLS Policies for user_exclusive_access
CREATE POLICY "Users can view own exclusive access" ON public.user_exclusive_access
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own exclusive access" ON public.user_exclusive_access
  FOR ALL USING (auth.uid() = user_id);

-- RLS Policies for user_investment_portfolio
CREATE POLICY "Users can view own investment portfolio" ON public.user_investment_portfolio
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can manage investment portfolio" ON public.user_investment_portfolio
  FOR ALL WITH CHECK (true);

-- RLS Policies for data_export_requests
CREATE POLICY "Users can manage own export requests" ON public.data_export_requests
  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all export requests" ON public.data_export_requests
  FOR SELECT USING (is_admin(auth.uid()));

-- Function to calculate composite investment score
CREATE OR REPLACE FUNCTION public.calculate_composite_investment_score(
  _user_id UUID,
  _social_weight NUMERIC DEFAULT 0.33,
  _mastery_weight NUMERIC DEFAULT 0.33,
  _status_weight NUMERIC DEFAULT 0.34
) RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  social_score NUMERIC := 0;
  mastery_score NUMERIC := 0;
  status_score NUMERIC := 0;
  composite_score NUMERIC := 0;
  interdependency_bonus NUMERIC := 1.0;
BEGIN
  -- Get social investment score
  SELECT COALESCE(AVG(karma_score), 0) INTO social_score
  FROM user_reputation WHERE user_id = _user_id;
  
  -- Get mastery investment score
  SELECT COALESCE(AVG(calculate_mastery_score(technique_score, consistency_score, progression_score)), 0)
  INTO mastery_score
  FROM exercise_masteries WHERE user_id = _user_id;
  
  -- Get status/streak score
  SELECT COALESCE(MAX(current_streak * 10), 0) INTO status_score
  FROM user_streaks WHERE user_id = _user_id;
  
  -- Calculate interdependency bonus (more systems = higher value)
  IF social_score > 0 AND mastery_score > 0 AND status_score > 0 THEN
    interdependency_bonus := 1.5;
  ELSIF (social_score > 0 AND mastery_score > 0) OR 
        (social_score > 0 AND status_score > 0) OR 
        (mastery_score > 0 AND status_score > 0) THEN
    interdependency_bonus := 1.25;
  END IF;
  
  -- Calculate weighted composite score
  composite_score := (
    (social_score * _social_weight) +
    (mastery_score * _mastery_weight) +
    (status_score * _status_weight)
  ) * interdependency_bonus;
  
  RETURN ROUND(composite_score, 2);
END;
$$;

-- Function to calculate abandonment cost
CREATE OR REPLACE FUNCTION public.calculate_abandonment_cost(_user_id UUID)
RETURNS TABLE(
  cost_24h NUMERIC,
  cost_7d NUMERIC, 
  cost_30d NUMERIC,
  recovery_difficulty NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public 
AS $$
DECLARE
  base_investment_value NUMERIC := 0;
  streak_penalty NUMERIC := 0;
  exclusive_access_loss NUMERIC := 0;
  seasonal_cert_loss NUMERIC := 0;
  social_capital_loss NUMERIC := 0;
BEGIN
  -- Calculate base investment value (time spent)
  SELECT COALESCE(SUM(duration_seconds) / 3600.0 * 10, 0) INTO base_investment_value
  FROM user_sessions WHERE user_id = _user_id;
  
  -- Calculate streak penalties
  SELECT COALESCE(SUM(current_multiplier * total_investment_value * 0.1), 0) INTO streak_penalty
  FROM investment_streaks WHERE user_id = _user_id;
  
  -- Calculate exclusive access loss
  SELECT COALESCE(SUM(investment_value), 0) INTO exclusive_access_loss
  FROM user_exclusive_access WHERE user_id = _user_id;
  
  -- Calculate seasonal certification loss
  SELECT COALESCE(SUM(sc.prestige_value), 0) INTO seasonal_cert_loss
  FROM user_seasonal_certifications usc
  JOIN seasonal_certifications sc ON usc.certification_id = sc.id
  WHERE usc.user_id = _user_id AND NOT usc.is_expired;
  
  -- Calculate social capital loss
  SELECT COALESCE(SUM(karma_score * 5), 0) INTO social_capital_loss
  FROM user_reputation WHERE user_id = _user_id;
  
  RETURN QUERY SELECT
    -- 24 hour cost (immediate penalties)
    (streak_penalty * 0.3)::NUMERIC,
    -- 7 day cost (streak resets + some access loss)
    (streak_penalty + exclusive_access_loss * 0.2)::NUMERIC,
    -- 30 day cost (full investment loss)
    (base_investment_value + streak_penalty + exclusive_access_loss + 
     seasonal_cert_loss + social_capital_loss)::NUMERIC,
    -- Recovery difficulty (exponential based on total investment)
    (LEAST(10.0, (base_investment_value + exclusive_access_loss + social_capital_loss) / 100.0))::NUMERIC;
END;
$$;

-- Trigger to update investment portfolio on any relevant data change
CREATE OR REPLACE FUNCTION public.update_investment_portfolio()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  portfolio_user_id UUID;
  abandonment_costs RECORD;
BEGIN
  -- Determine user_id based on the table being updated
  portfolio_user_id := COALESCE(NEW.user_id, OLD.user_id);
  
  -- Get abandonment costs
  SELECT * INTO abandonment_costs FROM calculate_abandonment_cost(portfolio_user_id);
  
  -- Update or insert investment portfolio
  INSERT INTO user_investment_portfolio (
    user_id, 
    total_portfolio_value,
    abandonment_cost_24h,
    abandonment_cost_7d,
    abandonment_cost_30d,
    recovery_difficulty_score,
    last_calculated_at
  )
  VALUES (
    portfolio_user_id,
    abandonment_costs.cost_30d,
    abandonment_costs.cost_24h,
    abandonment_costs.cost_7d,
    abandonment_costs.cost_30d,
    abandonment_costs.recovery_difficulty,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    total_portfolio_value = EXCLUDED.total_portfolio_value,
    abandonment_cost_24h = EXCLUDED.abandonment_cost_24h,
    abandonment_cost_7d = EXCLUDED.abandonment_cost_7d,
    abandonment_cost_30d = EXCLUDED.abandonment_cost_30d,
    recovery_difficulty_score = EXCLUDED.recovery_difficulty_score,
    last_calculated_at = EXCLUDED.last_calculated_at,
    updated_at = now();
    
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Triggers to update investment portfolio on data changes
CREATE TRIGGER update_portfolio_on_sessions
  AFTER INSERT OR UPDATE OR DELETE ON user_sessions
  FOR EACH ROW EXECUTE FUNCTION update_investment_portfolio();

CREATE TRIGGER update_portfolio_on_reputation
  AFTER INSERT OR UPDATE OR DELETE ON user_reputation
  FOR EACH ROW EXECUTE FUNCTION update_investment_portfolio();

CREATE TRIGGER update_portfolio_on_streaks
  AFTER INSERT OR UPDATE OR DELETE ON investment_streaks
  FOR EACH ROW EXECUTE FUNCTION update_investment_portfolio();

-- Insert some initial seasonal certifications
INSERT INTO seasonal_certifications (
  certification_name, season_year, season_period, start_date, end_date, 
  maintenance_requirement, expiry_date, max_holders, prestige_value
) VALUES
  ('Winter Warrior 2025', 2025, 'winter', '2025-01-01', '2025-03-31', 
   '{"min_sessions_per_week": 5, "min_duration_seconds": 1800}', '2025-06-30', 50, 500),
  ('Spring Champion 2025', 2025, 'spring', '2025-04-01', '2025-06-30',
   '{"min_sessions_per_week": 4, "social_interactions": 10}', '2025-09-30', 75, 400),
  ('Summer Elite 2025', 2025, 'summer', '2025-07-01', '2025-09-30',
   '{"mastery_level": 7, "min_streak": 30}', '2025-12-31', 25, 800);

-- Insert exclusive features
INSERT INTO exclusive_features (
  feature_name, feature_type, max_users, invitation_requirements, 
  scarcity_multiplier, prestige_value
) VALUES
  ('Elite Training Circle', 'invitation_only', 100, 
   '{"min_level": 15, "min_social_reputation": 500, "referral_required": true}', 3.0, 300),
  ('Master Mentor Access', 'invitation_only', 50,
   '{"mastery_certifications": 3, "community_contributions": 25}', 5.0, 600),
  ('Legendary Status Badge', 'limited_edition', 10,
   '{"total_investment_value": 10000, "seasonal_certifications": 2}', 10.0, 1000);

-- Triggers for updated_at columns
CREATE TRIGGER set_updated_at_investment_weaving
  BEFORE UPDATE ON user_investment_weaving
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_investment_streaks
  BEFORE UPDATE ON investment_streaks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_seasonal_certs
  BEFORE UPDATE ON user_seasonal_certifications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_updated_at_investment_portfolio 
  BEFORE UPDATE ON user_investment_portfolio
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();