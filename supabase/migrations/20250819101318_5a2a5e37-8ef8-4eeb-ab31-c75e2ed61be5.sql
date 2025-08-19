
-- 1) Ensure subscription_plans has needed columns and uniqueness
ALTER TABLE public.subscription_plans 
  ADD COLUMN IF NOT EXISTS is_popular boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 1;

CREATE UNIQUE INDEX IF NOT EXISTS subscription_plans_name_interval_unique 
  ON public.subscription_plans (name, billing_interval);

-- 2) Ensure subscriptions has cancel_at_period_end used by demo flow
ALTER TABLE public.subscriptions 
  ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean NOT NULL DEFAULT false;

-- 3) Create the RPC used by the app to read the current active subscription
CREATE OR REPLACE FUNCTION public.get_user_active_subscription(_user_id uuid)
RETURNS TABLE (
  subscription_id uuid,
  plan_name text,
  status text,
  current_period_end timestamptz,
  is_custom_pricing boolean,
  effective_price integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Only the user themselves or an admin can query this
  IF NOT (auth.uid() = _user_id OR public.is_admin(auth.uid())) THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    s.id AS subscription_id,
    sp.name AS plan_name,
    s.status,
    s.current_period_end,
    FALSE AS is_custom_pricing,
    sp.price_cents AS effective_price
  FROM public.subscriptions s
  JOIN public.subscription_plans sp ON sp.id = s.plan_id
  WHERE s.user_id = _user_id
    AND s.status = 'active'
  ORDER BY COALESCE(s.current_period_end, s.updated_at) DESC
  LIMIT 1;
END;
$$;

-- 4) Standardize Premium features text (if Premium exists)
UPDATE public.subscription_plans
SET features = '[
  "Advanced statistics",
  "Smart AI recommendations",
  "Social challenges access",
  "Detailed performance tracking",
  "Goal tracking system",
  "Export workout data",
  "No advertisements",
  "Email support"
]'::jsonb
WHERE lower(name) = 'premium';

-- 5) Upsert Free (monthly)
INSERT INTO public.subscription_plans (
  name, description, price_cents, billing_interval, features, is_active, is_popular, sort_order, stripe_price_id
) VALUES (
  'Free',
  'Essential features to get started with your fitness journey',
  0,
  'month',
  '[
    "Basic workout tracking",
    "Simple statistics",
    "Community access",
    "3 workouts per day limit",
    "Basic achievements"
  ]'::jsonb,
  true,
  false,
  1,
  null
)
ON CONFLICT (name, billing_interval) DO UPDATE SET
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  features = EXCLUDED.features,
  is_active = true,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- 6) Upsert Pro (monthly)
INSERT INTO public.subscription_plans (
  name, description, price_cents, billing_interval, features, is_active, is_popular, sort_order, stripe_price_id
) VALUES (
  'Pro',
  'Advanced features for serious fitness enthusiasts',
  1999, -- $19.99/month
  'month',
  '[
    "All Premium features",
    "Custom workout builder",
    "Advanced analytics dashboard",
    "Priority customer support",
    "Unlimited workout exports",
    "Personal trainer AI coaching",
    "Advanced goal tracking",
    "Social challenges creation",
    "Competition leaderboards",
    "Detailed performance insights"
  ]'::jsonb,
  true,
  true,
  3,
  null
)
ON CONFLICT (name, billing_interval) DO UPDATE SET
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  features = EXCLUDED.features,
  is_active = true,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- 7) Upsert Pro (yearly)
INSERT INTO public.subscription_plans (
  name, description, price_cents, billing_interval, features, is_active, is_popular, sort_order, stripe_price_id
) VALUES (
  'Pro',
  'Advanced features for serious fitness enthusiasts (Save 20%)',
  19190, -- ~$191.90/year
  'year',
  '[
    "All Premium features",
    "Custom workout builder",
    "Advanced analytics dashboard",
    "Priority customer support",
    "Unlimited workout exports",
    "Personal trainer AI coaching",
    "Advanced goal tracking",
    "Social challenges creation",
    "Competition leaderboards",
    "Detailed performance insights"
  ]'::jsonb,
  true,
  false,
  3,
  null
)
ON CONFLICT (name, billing_interval) DO UPDATE SET
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  features = EXCLUDED.features,
  is_active = true,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- 8) Heuristic sort order for any other existing plans
UPDATE public.subscription_plans
SET sort_order = CASE
  WHEN lower(name) = 'free' THEN 1
  WHEN lower(name) = 'premium' THEN 2
  WHEN lower(name) = 'pro' THEN 3
  ELSE COALESCE(sort_order, 4)
END;
