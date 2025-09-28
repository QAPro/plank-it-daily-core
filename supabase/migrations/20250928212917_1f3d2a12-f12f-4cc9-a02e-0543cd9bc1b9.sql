-- Create A/B test experiments table
CREATE TABLE public.ab_test_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_flag_id UUID REFERENCES public.feature_flags(id) ON DELETE CASCADE,
  experiment_name TEXT NOT NULL,
  experiment_description TEXT,
  hypothesis TEXT,
  success_metric TEXT NOT NULL,
  traffic_split JSONB NOT NULL DEFAULT '{"control": 50, "variant_a": 50}'::jsonb,
  minimum_sample_size INTEGER NOT NULL DEFAULT 1000,
  significance_threshold NUMERIC NOT NULL DEFAULT 0.95,
  test_duration_days INTEGER NOT NULL DEFAULT 14,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'running', 'paused', 'completed', 'stopped')),
  winner_variant TEXT,
  confidence_level NUMERIC,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create A/B test results table for tracking conversions and metrics
CREATE TABLE public.ab_test_results (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES public.ab_test_experiments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  variant TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_value NUMERIC DEFAULT 1,
  session_id TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create A/B test statistics table for caching calculated results
CREATE TABLE public.ab_test_statistics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id UUID REFERENCES public.ab_test_experiments(id) ON DELETE CASCADE NOT NULL,
  variant TEXT NOT NULL,
  total_users INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  conversion_rate NUMERIC NOT NULL DEFAULT 0,
  confidence_interval_lower NUMERIC,
  confidence_interval_upper NUMERIC,
  statistical_significance NUMERIC,
  p_value NUMERIC,
  calculated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(experiment_id, variant)
);

-- Enable RLS on new tables
ALTER TABLE public.ab_test_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ab_test_statistics ENABLE ROW LEVEL SECURITY;

-- RLS policies for ab_test_experiments
CREATE POLICY "Admins can manage all experiments" ON public.ab_test_experiments
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Users can view running experiments" ON public.ab_test_experiments
FOR SELECT USING (status = 'running');

-- RLS policies for ab_test_results
CREATE POLICY "Admins can view all test results" ON public.ab_test_results
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Users can create their own test results" ON public.ab_test_results
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own test results" ON public.ab_test_results
FOR SELECT USING (auth.uid() = user_id);

-- RLS policies for ab_test_statistics
CREATE POLICY "Admins can manage test statistics" ON public.ab_test_statistics
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'admin'::app_role
  )
);

CREATE POLICY "Anyone can view test statistics for running experiments" ON public.ab_test_statistics
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.ab_test_experiments 
    WHERE id = ab_test_statistics.experiment_id AND status = 'running'
  )
);

-- Add A/B test configuration to feature_flags table
ALTER TABLE public.feature_flags 
ADD COLUMN ab_test_enabled BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN current_experiment_id UUID REFERENCES public.ab_test_experiments(id);

-- Function to calculate A/B test statistics
CREATE OR REPLACE FUNCTION public.calculate_ab_test_statistics(_experiment_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  variant_record RECORD;
  total_users INTEGER;
  conversions INTEGER;
  conversion_rate NUMERIC;
  control_rate NUMERIC := 0;
  variant_rate NUMERIC := 0;
  control_users INTEGER := 0;
  variant_users INTEGER := 0;
  z_score NUMERIC;
  p_value NUMERIC;
BEGIN
  -- Calculate statistics for each variant
  FOR variant_record IN 
    SELECT DISTINCT variant FROM ab_test_results WHERE experiment_id = _experiment_id
  LOOP
    -- Get total users for this variant
    SELECT COUNT(DISTINCT user_id) INTO total_users
    FROM ab_test_assignments 
    WHERE feature_name = (
      SELECT ff.feature_name FROM feature_flags ff 
      JOIN ab_test_experiments e ON ff.current_experiment_id = e.id 
      WHERE e.id = _experiment_id
    ) AND variant = variant_record.variant;
    
    -- Get conversions for this variant
    SELECT COUNT(*) INTO conversions
    FROM ab_test_results 
    WHERE experiment_id = _experiment_id 
    AND variant = variant_record.variant 
    AND event_type = (
      SELECT success_metric FROM ab_test_experiments WHERE id = _experiment_id
    );
    
    -- Calculate conversion rate
    conversion_rate := CASE 
      WHEN total_users > 0 THEN conversions::NUMERIC / total_users
      ELSE 0 
    END;
    
    -- Store control values for significance calculation
    IF variant_record.variant = 'control' THEN
      control_rate := conversion_rate;
      control_users := total_users;
    ELSIF variant_record.variant = 'variant_a' THEN
      variant_rate := conversion_rate;
      variant_users := total_users;
    END IF;
    
    -- Upsert statistics
    INSERT INTO ab_test_statistics (
      experiment_id, variant, total_users, conversions, conversion_rate, calculated_at
    ) VALUES (
      _experiment_id, variant_record.variant, total_users, conversions, conversion_rate, now()
    ) ON CONFLICT (experiment_id, variant) 
    DO UPDATE SET 
      total_users = EXCLUDED.total_users,
      conversions = EXCLUDED.conversions,
      conversion_rate = EXCLUDED.conversion_rate,
      calculated_at = EXCLUDED.calculated_at;
  END LOOP;
  
  -- Calculate statistical significance between control and variant_a
  IF control_users > 0 AND variant_users > 0 AND control_rate > 0 AND variant_rate > 0 THEN
    -- Simplified z-test calculation
    z_score := ABS(variant_rate - control_rate) / SQRT(
      (control_rate * (1 - control_rate) / control_users) + 
      (variant_rate * (1 - variant_rate) / variant_users)
    );
    
    -- Approximate p-value (simplified)
    p_value := CASE 
      WHEN z_score > 2.58 THEN 0.01
      WHEN z_score > 1.96 THEN 0.05
      WHEN z_score > 1.64 THEN 0.1
      ELSE 0.5
    END;
    
    -- Update statistics with significance values
    UPDATE ab_test_statistics 
    SET 
      statistical_significance = CASE WHEN p_value <= 0.05 THEN z_score ELSE NULL END,
      p_value = p_value,
      calculated_at = now()
    WHERE experiment_id = _experiment_id;
  END IF;
END;
$$;

-- Function to auto-detect experiment winner
CREATE OR REPLACE FUNCTION public.detect_experiment_winner(_experiment_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  experiment_record RECORD;
  winner_variant TEXT := NULL;
  significance_threshold NUMERIC;
  min_sample_size INTEGER;
  control_stats RECORD;
  variant_stats RECORD;
BEGIN
  -- Get experiment details
  SELECT * INTO experiment_record 
  FROM ab_test_experiments 
  WHERE id = _experiment_id AND status = 'running';
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  significance_threshold := experiment_record.significance_threshold;
  min_sample_size := experiment_record.minimum_sample_size;
  
  -- Get statistics for control and variant_a
  SELECT * INTO control_stats FROM ab_test_statistics 
  WHERE experiment_id = _experiment_id AND variant = 'control';
  
  SELECT * INTO variant_stats FROM ab_test_statistics 
  WHERE experiment_id = _experiment_id AND variant = 'variant_a';
  
  -- Check if we have enough sample size and significance
  IF control_stats.total_users >= min_sample_size 
     AND variant_stats.total_users >= min_sample_size 
     AND variant_stats.p_value IS NOT NULL 
     AND variant_stats.p_value <= (1 - significance_threshold) THEN
    
    -- Determine winner based on conversion rate
    IF variant_stats.conversion_rate > control_stats.conversion_rate THEN
      winner_variant := 'variant_a';
    ELSIF control_stats.conversion_rate > variant_stats.conversion_rate THEN
      winner_variant := 'control';
    END IF;
    
    -- Update experiment with winner
    IF winner_variant IS NOT NULL THEN
      UPDATE ab_test_experiments 
      SET 
        winner_variant = winner_variant,
        confidence_level = significance_threshold,
        status = 'completed',
        ended_at = now(),
        updated_at = now()
      WHERE id = _experiment_id;
    END IF;
  END IF;
  
  RETURN winner_variant;
END;
$$;

-- Trigger to update ab_test_experiments updated_at
CREATE OR REPLACE FUNCTION public.update_ab_experiments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ab_experiments_updated_at
  BEFORE UPDATE ON public.ab_test_experiments
  FOR EACH ROW EXECUTE FUNCTION public.update_ab_experiments_updated_at();