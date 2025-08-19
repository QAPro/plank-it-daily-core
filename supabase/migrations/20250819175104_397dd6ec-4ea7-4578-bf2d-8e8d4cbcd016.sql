
-- Add indexes for faster subscription queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_status ON subscriptions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status_created ON subscriptions(status, created_at);
CREATE INDEX IF NOT EXISTS idx_billing_transactions_user_status ON billing_transactions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_users_subscription_tier ON users(subscription_tier);

-- Create materialized view for subscription analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS subscription_analytics AS
SELECT 
  DATE_TRUNC('day', s.created_at) as date,
  s.status,
  sp.name as plan_name,
  COUNT(*) as subscription_count,
  SUM(sp.price_cents) as total_revenue_cents,
  COUNT(DISTINCT s.user_id) as unique_users
FROM subscriptions s
JOIN subscription_plans sp ON s.plan_id = sp.id
WHERE s.created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY DATE_TRUNC('day', s.created_at), s.status, sp.name, sp.price_cents;

-- Create index on the materialized view
CREATE INDEX IF NOT EXISTS idx_subscription_analytics_date_status ON subscription_analytics(date, status);

-- Create audit table for admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID REFERENCES auth.users(id),
  target_user_id UUID REFERENCES auth.users(id),
  action_type TEXT NOT NULL,
  action_details JSONB DEFAULT '{}',
  affected_count INTEGER DEFAULT 1,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for audit log
CREATE POLICY "Admins can view audit log" ON admin_audit_log
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);

CREATE POLICY "System can create audit entries" ON admin_audit_log
FOR INSERT WITH CHECK (true);

-- Add subscription health scoring function
CREATE OR REPLACE FUNCTION get_subscription_health_score(target_user_id UUID)
RETURNS TABLE(
  health_score INTEGER,
  risk_factors JSONB,
  recommendations JSONB
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  score INTEGER := 100;
  factors JSONB := '[]'::jsonb;
  recommendations JSONB := '[]'::jsonb;
  sub_record RECORD;
  payment_failures INTEGER;
  usage_rate NUMERIC;
BEGIN
  -- Get subscription info
  SELECT s.*, sp.name as plan_name, sp.price_cents
  INTO sub_record
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = target_user_id AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT 0, '["no_active_subscription"]'::jsonb, '["consider_upgrade_campaign"]'::jsonb;
    RETURN;
  END IF;
  
  -- Check payment failures
  SELECT COUNT(*) INTO payment_failures
  FROM billing_transactions bt
  WHERE bt.user_id = target_user_id 
    AND bt.status = 'failed'
    AND bt.created_at >= NOW() - INTERVAL '30 days';
  
  IF payment_failures > 0 THEN
    score := score - (payment_failures * 20);
    factors := factors || '"payment_failures"'::jsonb;
    recommendations := recommendations || '"review_payment_method"'::jsonb;
  END IF;
  
  -- Check if subscription is near expiration
  IF sub_record.current_period_end < NOW() + INTERVAL '7 days' THEN
    score := score - 30;
    factors := factors || '"expiring_soon"'::jsonb;
    recommendations := recommendations || '"renewal_reminder"'::jsonb;
  END IF;
  
  -- Check usage rate (sessions in last 30 days)
  SELECT COUNT(*) INTO usage_rate
  FROM user_sessions us
  WHERE us.user_id = target_user_id 
    AND us.completed_at >= NOW() - INTERVAL '30 days';
  
  IF usage_rate < 5 THEN
    score := score - 25;
    factors := factors || '"low_usage"'::jsonb;
    recommendations := recommendations || '"engagement_campaign"'::jsonb;
  END IF;
  
  -- Ensure score doesn't go below 0
  score := GREATEST(score, 0);
  
  RETURN QUERY SELECT score, factors, recommendations;
END;
$$;

-- Function to refresh the materialized view
CREATE OR REPLACE FUNCTION refresh_subscription_analytics()
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW subscription_analytics;
END;
$$;

-- Add bulk operations tracking
CREATE TABLE IF NOT EXISTS bulk_operations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  operation_type TEXT NOT NULL,
  initiated_by UUID REFERENCES auth.users(id),
  target_criteria JSONB DEFAULT '{}',
  affected_user_ids UUID[] DEFAULT '{}',
  operation_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending',
  progress_count INTEGER DEFAULT 0,
  total_count INTEGER DEFAULT 0,
  error_details JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS on bulk operations
ALTER TABLE bulk_operations ENABLE ROW LEVEL SECURITY;

-- RLS policy for bulk operations
CREATE POLICY "Admins can manage bulk operations" ON bulk_operations
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
  )
);
