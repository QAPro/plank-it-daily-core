
-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  billing_interval TEXT NOT NULL DEFAULT 'month', -- 'month', 'year'
  stripe_price_id TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'canceled', 'past_due', 'unpaid', 'trialing'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create custom pricing table for beta users and special deals
CREATE TABLE public.custom_pricing (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES subscription_plans(id) NOT NULL,
  original_price_cents INTEGER NOT NULL,
  custom_price_cents INTEGER NOT NULL,
  discount_percentage NUMERIC,
  pricing_reason TEXT,
  is_lifetime_access BOOLEAN DEFAULT false,
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create billing transactions table
CREATE TABLE public.billing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_payment_intent_id TEXT,
  stripe_invoice_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT DEFAULT 'usd',
  status TEXT NOT NULL, -- 'pending', 'succeeded', 'failed', 'canceled', 'refunded'
  transaction_type TEXT NOT NULL, -- 'subscription', 'one_time', 'refund'
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user notes table for admin tracking
CREATE TABLE public.user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES auth.users(id) NOT NULL,
  note_type TEXT DEFAULT 'general', -- 'general', 'billing', 'support', 'beta'
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create admin settings table for subscription system controls
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_cents, billing_interval, features, is_active, is_popular, sort_order) VALUES
('Free', 'Basic plank training features', 0, 'month', '["basic_timer", "limited_exercises", "basic_progress"]', true, false, 1),
('Premium', 'Full access to all features', 499, 'month', '["all_exercises", "advanced_analytics", "custom_workouts", "priority_support", "social_challenges"]', true, true, 2),
('Premium Yearly', 'Full access with yearly discount', 4990, 'year', '["all_exercises", "advanced_analytics", "custom_workouts", "priority_support", "social_challenges"]', true, false, 3);

-- Insert default admin settings
INSERT INTO admin_settings (setting_key, setting_value, description) VALUES
('subscription_system_enabled', 'true', 'Enable/disable the subscription system globally'),
('stripe_mode', '"test"', 'Stripe mode: test or live'),
('demo_mode', 'true', 'Enable demo mode for subscription testing without real payments'),
('allow_custom_pricing', 'true', 'Allow admins to set custom pricing for users'),
('beta_user_discount_percentage', '50', 'Default discount percentage for beta users');

-- Enable RLS on all tables
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_pricing ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" ON subscription_plans
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON subscription_plans
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON subscriptions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "System can manage subscriptions" ON subscriptions
FOR ALL WITH CHECK (true);

-- RLS Policies for custom_pricing
CREATE POLICY "Users can view own custom pricing" ON custom_pricing
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage custom pricing" ON custom_pricing
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- RLS Policies for billing_transactions
CREATE POLICY "Users can view own billing transactions" ON billing_transactions
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all billing transactions" ON billing_transactions
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

CREATE POLICY "System can manage billing transactions" ON billing_transactions
FOR ALL WITH CHECK (true);

-- RLS Policies for user_notes
CREATE POLICY "Admins can manage user notes" ON user_notes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- RLS Policies for admin_settings
CREATE POLICY "Admins can manage admin settings" ON admin_settings
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  )
);

-- Create indexes for performance
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_custom_pricing_user_id ON custom_pricing(user_id);
CREATE INDEX idx_billing_transactions_user_id ON billing_transactions(user_id);
CREATE INDEX idx_billing_transactions_subscription_id ON billing_transactions(subscription_id);
CREATE INDEX idx_user_notes_user_id ON user_notes(user_id);

-- Database functions for subscription management
CREATE OR REPLACE FUNCTION get_user_active_subscription(_user_id UUID)
RETURNS TABLE(
  subscription_id UUID,
  plan_name TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  is_custom_pricing BOOLEAN,
  custom_price_cents INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    sp.name,
    s.status,
    s.current_period_end,
    cp.id IS NOT NULL as is_custom_pricing,
    COALESCE(cp.custom_price_cents, sp.price_cents) as effective_price
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  LEFT JOIN custom_pricing cp ON cp.user_id = s.user_id 
    AND cp.plan_id = s.plan_id 
    AND (cp.expires_at IS NULL OR cp.expires_at > now())
  WHERE s.user_id = _user_id 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

CREATE OR REPLACE FUNCTION get_subscription_analytics()
RETURNS TABLE(
  total_subscribers BIGINT,
  monthly_revenue_cents BIGINT,
  churn_rate NUMERIC,
  avg_subscription_length_days NUMERIC,
  custom_pricing_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM subscriptions WHERE status = 'active')::BIGINT,
    (SELECT COALESCE(SUM(sp.price_cents), 0) 
     FROM subscriptions s 
     JOIN subscription_plans sp ON s.plan_id = sp.id 
     WHERE s.status = 'active' AND sp.billing_interval = 'month')::BIGINT,
    (SELECT ROUND(
      CASE 
        WHEN COUNT(*) > 0 THEN 
          (COUNT(*) FILTER (WHERE status = 'canceled' AND canceled_at >= now() - interval '30 days'))::NUMERIC / 
          COUNT(*)::NUMERIC * 100 
        ELSE 0 
      END, 2
    ) FROM subscriptions WHERE created_at >= now() - interval '90 days')::NUMERIC,
    (SELECT ROUND(AVG(EXTRACT(days FROM (COALESCE(canceled_at, now()) - created_at))), 1)
     FROM subscriptions)::NUMERIC,
    (SELECT COUNT(*) FROM custom_pricing WHERE expires_at IS NULL OR expires_at > now())::BIGINT;
END;
$$;
