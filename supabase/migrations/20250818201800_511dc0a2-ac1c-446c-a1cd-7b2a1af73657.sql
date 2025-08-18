
-- Create admin_settings table
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_public BOOLEAN DEFAULT false
);

-- Create subscription_plans table
CREATE TABLE public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL,
  billing_interval TEXT NOT NULL CHECK (billing_interval IN ('month', 'year')),
  stripe_price_id TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid', 'trialing')),
  stripe_subscription_id TEXT,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create billing_transactions table
CREATE TABLE public.billing_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL CHECK (status IN ('pending', 'succeeded', 'failed', 'refunded')),
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('subscription', 'one_time', 'refund')),
  stripe_payment_intent_id TEXT,
  description TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_subscription_overrides table
CREATE TABLE public.user_subscription_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  override_type TEXT NOT NULL CHECK (override_type IN ('lifetime', 'custom_pricing')),
  plan_id UUID REFERENCES subscription_plans(id),
  custom_price_cents INTEGER,
  granted_by UUID REFERENCES auth.users(id),
  reason TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);

-- Create user_notes table
CREATE TABLE public.user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general' CHECK (note_type IN ('general', 'subscription', 'billing', 'support', 'beta')),
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscription_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_settings
CREATE POLICY "Anyone can read public settings" ON public.admin_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON public.admin_settings
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can read active plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage all plans" ON public.subscription_plans
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for subscriptions
CREATE POLICY "Users can read own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscriptions" ON public.subscriptions
  FOR ALL USING (true);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for billing_transactions
CREATE POLICY "Users can read own transactions" ON public.billing_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage transactions" ON public.billing_transactions
  FOR ALL USING (true);

CREATE POLICY "Admins can view all transactions" ON public.billing_transactions
  FOR SELECT USING (public.is_admin(auth.uid()));

-- RLS Policies for user_subscription_overrides
CREATE POLICY "Users can read own overrides" ON public.user_subscription_overrides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all overrides" ON public.user_subscription_overrides
  FOR ALL USING (public.is_admin(auth.uid()));

-- RLS Policies for user_notes
CREATE POLICY "Users can read notes about them" ON public.user_notes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all notes" ON public.user_notes
  FOR ALL USING (public.is_admin(auth.uid()));

-- Seed default subscription plans
INSERT INTO public.subscription_plans (name, description, price_cents, billing_interval, features, is_active, is_popular, sort_order) VALUES
('Free', 'Basic plank tracking', 0, 'month', '["Basic workout tracking", "Simple statistics", "Community access"]', true, false, 1),
('Premium Monthly', 'Advanced features monthly', 999, 'month', '["Advanced statistics", "Smart recommendations", "Social challenges", "Export data", "No ads"]', true, true, 2),
('Premium Yearly', 'Advanced features yearly', 9999, 'year', '["Advanced statistics", "Smart recommendations", "Social challenges", "Export data", "No ads", "Save 17%"]', true, false, 3);

-- Seed default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description, is_public) VALUES
('subscription_system_enabled', 'true', 'Enable/disable the subscription system globally', true),
('demo_mode', 'true', 'Enable demo mode for testing without Stripe', true),
('stripe_mode', '"test"', 'Stripe mode: test or live', false);

-- Create RPC function: get_user_active_subscription
CREATE OR REPLACE FUNCTION public.get_user_active_subscription(_user_id UUID)
RETURNS TABLE(
  subscription_id UUID,
  plan_name TEXT,
  status TEXT,
  current_period_end TIMESTAMPTZ,
  is_custom_pricing BOOLEAN,
  effective_price INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  active_sub RECORD;
  lifetime_override RECORD;
  custom_pricing RECORD;
BEGIN
  -- Check for active lifetime override
  SELECT * INTO lifetime_override
  FROM user_subscription_overrides uso
  WHERE uso.user_id = _user_id 
    AND uso.override_type = 'lifetime'
    AND uso.is_active = true
    AND (uso.expires_at IS NULL OR uso.expires_at > now());
  
  IF FOUND THEN
    SELECT sp.name INTO plan_name
    FROM subscription_plans sp
    WHERE sp.id = lifetime_override.plan_id;
    
    RETURN QUERY SELECT 
      NULL::UUID as subscription_id,
      COALESCE(plan_name, 'Premium')::TEXT as plan_name,
      'active'::TEXT as status,
      NULL::TIMESTAMPTZ as current_period_end,
      false as is_custom_pricing,
      0 as effective_price;
    RETURN;
  END IF;
  
  -- Get active subscription
  SELECT s.*, sp.name as plan_name, sp.price_cents
  INTO active_sub
  FROM subscriptions s
  JOIN subscription_plans sp ON s.plan_id = sp.id
  WHERE s.user_id = _user_id 
    AND s.status = 'active'
    AND s.current_period_end > now()
  ORDER BY s.created_at DESC
  LIMIT 1;
  
  IF NOT FOUND THEN
    RETURN;
  END IF;
  
  -- Check for custom pricing override
  SELECT * INTO custom_pricing
  FROM user_subscription_overrides uso
  WHERE uso.user_id = _user_id 
    AND uso.override_type = 'custom_pricing'
    AND uso.is_active = true
    AND (uso.expires_at IS NULL OR uso.expires_at > now());
  
  RETURN QUERY SELECT 
    active_sub.id as subscription_id,
    active_sub.plan_name::TEXT as plan_name,
    active_sub.status::TEXT as status,
    active_sub.current_period_end as current_period_end,
    FOUND as is_custom_pricing,
    COALESCE(custom_pricing.custom_price_cents, active_sub.price_cents) as effective_price;
END;
$$;

-- Create RPC function: admin_change_user_tier
CREATE OR REPLACE FUNCTION public.admin_change_user_tier(
  _target_user_id UUID,
  _new_tier TEXT,
  _reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;
  
  -- Validate tier
  IF _new_tier NOT IN ('free', 'premium', 'pro') THEN
    RAISE EXCEPTION 'Invalid tier: %', _new_tier;
  END IF;
  
  -- Update user tier
  UPDATE users 
  SET subscription_tier = _new_tier, updated_at = now()
  WHERE id = _target_user_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found: %', _target_user_id;
  END IF;
  
  -- TODO: Add audit entry if needed
  
  RETURN true;
END;
$$;

-- Create RPC function: admin_set_custom_pricing
CREATE OR REPLACE FUNCTION public.admin_set_custom_pricing(
  _target_user_id UUID,
  _plan_id UUID,
  _custom_price_cents INTEGER,
  _reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Check if caller is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: admin privileges required';
  END IF;
  
  -- Deactivate existing custom pricing overrides
  UPDATE user_subscription_overrides
  SET is_active = false, updated_at = now()
  WHERE user_id = _target_user_id 
    AND override_type = 'custom_pricing'
    AND is_active = true;
  
  -- Create new custom pricing override
  INSERT INTO user_subscription_overrides (
    user_id, override_type, plan_id, custom_price_cents, 
    granted_by, reason, is_active
  ) VALUES (
    _target_user_id, 'custom_pricing', _plan_id, _custom_price_cents,
    auth.uid(), _reason, true
  );
  
  RETURN true;
END;
$$;
