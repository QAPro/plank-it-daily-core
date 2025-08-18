
-- Create subscription plans table
CREATE TABLE public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  billing_interval TEXT NOT NULL DEFAULT 'month',
  features JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  stripe_price_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE public.subscriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'inactive',
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  canceled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create billing transactions table
CREATE TABLE public.billing_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES public.subscriptions(id),
  stripe_payment_intent_id TEXT,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add RLS policies for subscription_plans
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active subscription plans" 
  ON public.subscription_plans 
  FOR SELECT 
  USING (is_active = true);

CREATE POLICY "Admins can manage subscription plans" 
  ON public.subscription_plans 
  FOR ALL 
  USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ));

-- Add RLS policies for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" 
  ON public.subscriptions 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all subscriptions" 
  ON public.subscriptions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ));

CREATE POLICY "System can create subscriptions" 
  ON public.subscriptions 
  FOR INSERT 
  WITH CHECK (true);

-- Add RLS policies for billing_transactions
ALTER TABLE public.billing_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" 
  ON public.billing_transactions 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all transactions" 
  ON public.billing_transactions 
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'admin'::app_role
  ));

CREATE POLICY "System can create transactions" 
  ON public.billing_transactions 
  FOR INSERT 
  WITH CHECK (true);

-- Insert default subscription plans
INSERT INTO public.subscription_plans (name, description, price_cents, billing_interval, features) VALUES
('Free', 'Basic plank workouts and tracking', 0, 'month', '{"max_custom_workouts": 1, "basic_analytics": true}'),
('Premium', 'Unlimited access to all features', 999, 'month', '{"max_custom_workouts": -1, "advanced_analytics": true, "social_features": true, "coaching": true}');
