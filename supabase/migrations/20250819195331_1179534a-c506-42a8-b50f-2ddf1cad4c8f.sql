
-- Add user segments table for saving custom segments
CREATE TABLE public.user_segments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  criteria JSONB NOT NULL DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_system_segment BOOLEAN DEFAULT false,
  user_count INTEGER DEFAULT 0,
  last_refreshed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on user_segments
ALTER TABLE public.user_segments ENABLE ROW LEVEL SECURITY;

-- RLS policies for user_segments
CREATE POLICY "Admins can manage segments" ON public.user_segments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add user engagement metrics materialized view
CREATE MATERIALIZED VIEW public.user_engagement_metrics AS
SELECT 
  u.id as user_id,
  u.email,
  u.subscription_tier,
  u.created_at as registration_date,
  COALESCE(session_stats.total_sessions, 0) as total_sessions,
  COALESCE(session_stats.last_session_date, u.created_at::date) as last_session_date,
  COALESCE(session_stats.avg_session_duration, 0) as avg_session_duration,
  COALESCE(session_stats.total_duration, 0) as total_duration,
  CASE 
    WHEN session_stats.last_session_date >= CURRENT_DATE - INTERVAL '7 days' THEN 'active'
    WHEN session_stats.last_session_date >= CURRENT_DATE - INTERVAL '30 days' THEN 'dormant'
    ELSE 'inactive'
  END as engagement_status,
  COALESCE(streak_data.current_streak, 0) as current_streak,
  COALESCE(streak_data.longest_streak, 0) as longest_streak
FROM users u
LEFT JOIN (
  SELECT 
    user_id,
    COUNT(*) as total_sessions,
    MAX(completed_at::date) as last_session_date,
    AVG(duration_seconds) as avg_session_duration,
    SUM(duration_seconds) as total_duration
  FROM user_sessions 
  WHERE completed_at IS NOT NULL
  GROUP BY user_id
) session_stats ON u.id = session_stats.user_id
LEFT JOIN user_streaks streak_data ON u.id = streak_data.user_id;

-- Create index for performance
CREATE INDEX idx_user_engagement_metrics_status ON public.user_engagement_metrics(engagement_status);
CREATE INDEX idx_user_engagement_metrics_tier ON public.user_engagement_metrics(subscription_tier);

-- Function to refresh engagement metrics
CREATE OR REPLACE FUNCTION refresh_user_engagement_metrics()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  REFRESH MATERIALIZED VIEW user_engagement_metrics;
END;
$$;

-- Add billing history optimized function
CREATE OR REPLACE FUNCTION get_user_billing_history(target_user_id UUID, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  transaction_id UUID,
  amount_cents INTEGER,
  currency TEXT,
  status TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  stripe_payment_intent_id TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only the user themselves or an admin can query this
  IF NOT (auth.uid() = target_user_id OR EXISTS(
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    bt.id,
    bt.amount_cents,
    bt.currency,
    bt.status,
    bt.description,
    bt.created_at,
    bt.stripe_payment_intent_id
  FROM billing_transactions bt
  WHERE bt.user_id = target_user_id
  ORDER BY bt.created_at DESC
  LIMIT limit_count;
END;
$$;

-- Add function to get user subscription timeline
CREATE OR REPLACE FUNCTION get_user_subscription_timeline(target_user_id UUID)
RETURNS TABLE(
  event_date TIMESTAMP WITH TIME ZONE,
  event_type TEXT,
  event_description TEXT,
  plan_name TEXT,
  amount_cents INTEGER,
  status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only the user themselves or an admin can query this
  IF NOT (auth.uid() = target_user_id OR EXISTS(
    SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin'
  )) THEN
    RETURN;
  END IF;

  RETURN QUERY
  -- Subscription events
  SELECT 
    s.created_at as event_date,
    'subscription_created'::TEXT as event_type,
    'Subscription created for ' || sp.name as event_description,
    sp.name as plan_name,
    sp.price_cents as amount_cents,
    s.status
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = target_user_id
  
  UNION ALL
  
  -- Billing events
  SELECT 
    bt.created_at as event_date,
    CASE bt.status
      WHEN 'completed' THEN 'payment_success'
      WHEN 'failed' THEN 'payment_failed'
      ELSE 'payment_pending'
    END as event_type,
    bt.description as event_description,
    NULL as plan_name,
    bt.amount_cents,
    bt.status
  FROM billing_transactions bt
  WHERE bt.user_id = target_user_id
  
  ORDER BY event_date DESC;
END;
$$;
