
-- Update existing subscription plans with correct pricing
UPDATE subscription_plans 
SET 
  name = 'Free',
  price_cents = 0,
  billing_interval = 'month',
  description = 'Core timer functionality with basic features',
  is_popular = false,
  sort_order = 1
WHERE name = 'Free';

UPDATE subscription_plans 
SET 
  name = 'Premium Monthly',
  price_cents = 499,
  billing_interval = 'month',
  description = 'Unlimited exercises, analytics, custom workouts',
  is_popular = true,
  sort_order = 2
WHERE name = 'Premium' AND billing_interval = 'month';

UPDATE subscription_plans 
SET 
  name = 'Premium Yearly',
  price_cents = 3999,
  billing_interval = 'year',
  description = 'Unlimited exercises, analytics, custom workouts',
  is_popular = false,
  sort_order = 3
WHERE name = 'Premium' AND billing_interval = 'year';

-- Insert Pro plans if they don't exist
INSERT INTO subscription_plans (name, description, price_cents, billing_interval, features, is_active, is_popular, sort_order)
VALUES 
  ('Pro Monthly', 'AI coaching, predictive analytics, advanced features', 999, 'month', '["custom_workouts", "priority_support", "smart_recommendations", "advanced_stats"]'::jsonb, true, false, 4),
  ('Pro Yearly', 'AI coaching, predictive analytics, advanced features', 7999, 'year', '["custom_workouts", "priority_support", "smart_recommendations", "advanced_stats"]'::jsonb, true, false, 5)
ON CONFLICT (name, billing_interval) DO UPDATE SET
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  features = EXCLUDED.features,
  is_active = true,
  is_popular = EXCLUDED.is_popular,
  sort_order = EXCLUDED.sort_order;

-- Ensure Free plan exists
INSERT INTO subscription_plans (name, description, price_cents, billing_interval, features, is_active, is_popular, sort_order)
VALUES 
  ('Free', 'Core timer functionality with basic features', 0, 'month', '[]'::jsonb, true, false, 1)
ON CONFLICT (name, billing_interval) DO UPDATE SET
  description = EXCLUDED.description,
  price_cents = EXCLUDED.price_cents,
  features = EXCLUDED.features,
  is_active = true,
  sort_order = EXCLUDED.sort_order;
