
-- Create subscription plans table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  billing_interval TEXT NOT NULL DEFAULT 'month',
  stripe_price_id TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  is_popular BOOLEAN DEFAULT false,
  sort_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES public.subscription_plans(id),
  stripe_subscription_id TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create billing transactions table
CREATE TABLE IF NOT EXISTS public.billing_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  transaction_type TEXT NOT NULL DEFAULT 'subscription',
  description TEXT,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create admin settings table
CREATE TABLE IF NOT EXISTS public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL,
  description TEXT,
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  is_public BOOLEAN DEFAULT false
);

-- Create user notes table for admin tracking
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'general',
  is_important BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user subscription overrides table for custom pricing and lifetime access
CREATE TABLE IF NOT EXISTS public.user_subscription_overrides (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  override_type TEXT NOT NULL, -- 'custom_pricing', 'lifetime_access', 'free_premium'
  override_data JSONB DEFAULT '{}'::jsonb,
  reason TEXT,
  granted_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscription_overrides ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans
CREATE POLICY "Anyone can view active subscription plans" ON public.subscription_plans
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  );

-- RLS Policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON public.subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" ON public.subscriptions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  );

CREATE POLICY "System can manage subscriptions" ON public.subscriptions
  FOR ALL WITH CHECK (true);

-- RLS Policies for billing_transactions
CREATE POLICY "Users can view own billing transactions" ON public.billing_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all billing transactions" ON public.billing_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  );

CREATE POLICY "System can create billing transactions" ON public.billing_transactions
  FOR INSERT WITH CHECK (true);

-- RLS Policies for admin_settings
CREATE POLICY "Anyone can view public admin settings" ON public.admin_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all admin settings" ON public.admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  );

-- RLS Policies for user_notes
CREATE POLICY "Admins can manage all user notes" ON public.user_notes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  );

-- RLS Policies for user_subscription_overrides
CREATE POLICY "Users can view own subscription overrides" ON public.user_subscription_overrides
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all subscription overrides" ON public.user_subscription_overrides
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
    )
  );

-- Create function to get user active subscription with overrides
CREATE OR REPLACE FUNCTION public.get_user_active_subscription(_user_id UUID)
RETURNS TABLE(
  subscription_id UUID,
  plan_name TEXT,
  status TEXT,
  current_period_end TIMESTAMP WITH TIME ZONE,
  is_custom_pricing BOOLEAN,
  effective_price INTEGER
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id as subscription_id,
    sp.name as plan_name,
    s.status,
    s.current_period_end,
    (uso.override_type = 'custom_pricing' AND uso.is_active = true) as is_custom_pricing,
    CASE 
      WHEN uso.override_type = 'custom_pricing' AND uso.is_active = true 
      THEN (uso.override_data->>'price_cents')::INTEGER
      ELSE sp.price_cents
    END as effective_price
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON s.plan_id = sp.id
  LEFT JOIN public.user_subscription_overrides uso ON uso.user_id = s.user_id 
    AND uso.is_active = true
    AND (uso.expires_at IS NULL OR uso.expires_at > now())
  WHERE s.user_id = _user_id 
    AND s.status = 'active'
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$;

-- Create function to change user subscription tier (admin only)
CREATE OR REPLACE FUNCTION public.admin_change_user_tier(
  _target_user_id UUID,
  _new_tier TEXT,
  _reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  _admin_user_id UUID := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = _admin_user_id AND ur.role = 'admin'::app_role
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Update user subscription tier
  UPDATE public.users 
  SET subscription_tier = _new_tier, updated_at = now()
  WHERE id = _target_user_id;

  -- Log the change in user notes
  INSERT INTO public.user_notes (user_id, created_by, title, content, note_type)
  VALUES (
    _target_user_id, 
    _admin_user_id, 
    'Subscription Tier Changed',
    'Tier changed to ' || _new_tier || CASE WHEN _reason IS NOT NULL THEN '. Reason: ' || _reason ELSE '' END,
    'subscription'
  );

  RETURN TRUE;
END;
$$;

-- Create function to set custom pricing override
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
DECLARE
  _admin_user_id UUID := auth.uid();
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = _admin_user_id AND ur.role = 'admin'::app_role
  ) THEN
    RAISE EXCEPTION 'Unauthorized: Admin access required';
  END IF;

  -- Insert or update custom pricing override
  INSERT INTO public.user_subscription_overrides (
    user_id, override_type, override_data, reason, granted_by
  )
  VALUES (
    _target_user_id,
    'custom_pricing',
    jsonb_build_object('plan_id', _plan_id, 'price_cents', _custom_price_cents),
    _reason,
    _admin_user_id
  )
  ON CONFLICT (user_id, override_type) 
  WHERE override_type = 'custom_pricing'
  DO UPDATE SET
    override_data = jsonb_build_object('plan_id', _plan_id, 'price_cents', _custom_price_cents),
    reason = _reason,
    granted_by = _admin_user_id,
    is_active = true,
    created_at = now();

  -- Log the change
  INSERT INTO public.user_notes (user_id, created_by, title, content, note_type)
  VALUES (
    _target_user_id, 
    _admin_user_id, 
    'Custom Pricing Applied',
    'Custom pricing set to $' || (_custom_price_cents::FLOAT / 100)::TEXT || 
    CASE WHEN _reason IS NOT NULL THEN '. Reason: ' || _reason ELSE '' END,
    'billing'
  );

  RETURN TRUE;
END;
$$;

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_cents, billing_interval, is_active, is_popular, sort_order)
VALUES 
  ('Free', 'Basic features for getting started', 0, 'month', true, false, 1),
  ('Premium Monthly', 'Full access to all features', 999, 'month', true, true, 2),
  ('Premium Yearly', 'Full access with yearly discount', 9999, 'year', true, false, 3)
ON CONFLICT DO NOTHING;

-- Insert default admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description, is_public)
VALUES 
  ('subscription_system_enabled', 'true', 'Enable/disable the subscription system', true),
  ('demo_mode', 'true', 'Enable demo mode for testing subscriptions', false),
  ('stripe_mode', 'test', 'Stripe mode: test or live', false)
ON CONFLICT (setting_key) DO NOTHING;
