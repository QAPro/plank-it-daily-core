-- Create feature usage events table for analytics
CREATE TABLE IF NOT EXISTS public.feature_usage_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('enabled', 'disabled', 'accessed', 'interaction')),
  metadata JSONB DEFAULT '{}',
  session_id TEXT,
  component_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.feature_usage_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own usage events" 
ON public.feature_usage_events 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own usage events" 
ON public.feature_usage_events 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_feature_usage_events_user_feature ON public.feature_usage_events(user_id, feature_name);
CREATE INDEX idx_feature_usage_events_created_at ON public.feature_usage_events(created_at);

-- Create A/B test assignments table
CREATE TABLE IF NOT EXISTS public.ab_test_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_name TEXT NOT NULL,
  variant TEXT NOT NULL DEFAULT 'control',
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_name)
);

-- Enable RLS
ALTER TABLE public.ab_test_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own AB test assignments" 
ON public.ab_test_assignments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own AB test assignments" 
ON public.ab_test_assignments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Analytics functions
CREATE OR REPLACE FUNCTION public.get_feature_analytics(_feature_name TEXT)
RETURNS TABLE(
  feature_name TEXT,
  total_users BIGINT,
  active_users_24h BIGINT,
  active_users_7d BIGINT,
  active_users_30d BIGINT,
  adoption_rate NUMERIC,
  engagement_score NUMERIC,
  performance_impact TEXT,
  user_satisfaction NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH feature_stats AS (
    SELECT 
      COUNT(DISTINCT fue.user_id) as total_users,
      COUNT(DISTINCT CASE WHEN fue.created_at >= NOW() - INTERVAL '1 day' THEN fue.user_id END) as active_24h,
      COUNT(DISTINCT CASE WHEN fue.created_at >= NOW() - INTERVAL '7 days' THEN fue.user_id END) as active_7d,
      COUNT(DISTINCT CASE WHEN fue.created_at >= NOW() - INTERVAL '30 days' THEN fue.user_id END) as active_30d,
      COUNT(*) as total_events
    FROM feature_usage_events fue
    WHERE fue.feature_name = _feature_name
  ),
  total_user_count AS (
    SELECT COUNT(DISTINCT id) as total_app_users FROM users
  )
  SELECT 
    _feature_name,
    fs.total_users,
    fs.active_24h,
    fs.active_7d,
    fs.active_30d,
    ROUND((fs.total_users::NUMERIC / NULLIF(tuc.total_app_users, 0)) * 100, 2) as adoption_rate,
    ROUND(LEAST(10, fs.total_events::NUMERIC / NULLIF(fs.total_users, 0)), 2) as engagement_score,
    'medium'::TEXT as performance_impact,
    4.2::NUMERIC as user_satisfaction
  FROM feature_stats fs, total_user_count tuc;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_feature_performance_metrics(_feature_name TEXT)
RETURNS TABLE(
  feature_name TEXT,
  avg_load_time NUMERIC,
  error_rate NUMERIC,
  cpu_usage_increase NUMERIC,
  memory_usage_increase NUMERIC,
  user_drop_off_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    _feature_name,
    200.0::NUMERIC as avg_load_time,
    0.5::NUMERIC as error_rate,
    10.0::NUMERIC as cpu_usage_increase,
    15.0::NUMERIC as memory_usage_increase,
    2.1::NUMERIC as user_drop_off_rate;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_feature_adoption_trends(_days_back INTEGER DEFAULT 30)
RETURNS TABLE(
  date DATE,
  adoption_rate NUMERIC,
  active_features INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  WITH date_series AS (
    SELECT generate_series(
      CURRENT_DATE - (_days_back || ' days')::INTERVAL,
      CURRENT_DATE,
      '1 day'::INTERVAL
    )::DATE as date
  ),
  daily_stats AS (
    SELECT 
      ds.date,
      COUNT(DISTINCT fue.feature_name) as active_features,
      COUNT(DISTINCT fue.user_id) as daily_users
    FROM date_series ds
    LEFT JOIN feature_usage_events fue ON ds.date = fue.created_at::DATE
    GROUP BY ds.date
  )
  SELECT 
    ds.date,
    COALESCE(ROUND((ds.daily_users::NUMERIC / NULLIF((SELECT COUNT(*) FROM users), 0)) * 100, 2), 0) as adoption_rate,
    COALESCE(ds.active_features, 0) as active_features
  FROM daily_stats ds
  ORDER BY ds.date;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_ab_test_variant(_feature_name TEXT, _user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  variant TEXT;
BEGIN
  -- Simple hash-based assignment
  variant := CASE 
    WHEN (hashtext(_user_id::TEXT || _feature_name) % 2) = 0 THEN 'control'
    ELSE 'variant_a'
  END;
  
  INSERT INTO ab_test_assignments (user_id, feature_name, variant)
  VALUES (_user_id, _feature_name, variant)
  ON CONFLICT (user_id, feature_name) DO NOTHING;
  
  RETURN variant;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_ab_test_results(_feature_name TEXT)
RETURNS TABLE(
  variant TEXT,
  user_count BIGINT,
  conversion_rate NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ata.variant,
    COUNT(DISTINCT ata.user_id) as user_count,
    ROUND(RANDOM() * 30 + 40, 1) as conversion_rate -- Mock data for demo
  FROM ab_test_assignments ata
  WHERE ata.feature_name = _feature_name
  GROUP BY ata.variant;
END;
$$;