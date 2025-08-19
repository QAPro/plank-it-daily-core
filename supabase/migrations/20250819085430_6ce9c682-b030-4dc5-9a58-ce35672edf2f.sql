
-- Add missing sort_order column to subscription_plans table if it doesn't exist
-- This will help us order plans properly in the UI
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'sort_order'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN sort_order INTEGER DEFAULT 1;
  END IF;
END $$;

-- Update existing plans with proper sort order if they don't have one
UPDATE subscription_plans 
SET sort_order = CASE 
  WHEN LOWER(name) LIKE '%free%' OR LOWER(name) LIKE '%basic%' THEN 1
  WHEN LOWER(name) LIKE '%premium%' THEN 2  
  WHEN LOWER(name) LIKE '%pro%' THEN 3
  ELSE 4
END 
WHERE sort_order IS NULL OR sort_order = 1;

-- Insert a comprehensive Pro plan
INSERT INTO subscription_plans (
  name, 
  description, 
  price_cents, 
  billing_interval, 
  features, 
  is_active, 
  is_popular, 
  sort_order
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
  3
) ON CONFLICT (name, billing_interval) DO NOTHING;

-- Insert a yearly Pro plan with discount
INSERT INTO subscription_plans (
  name, 
  description, 
  price_cents, 
  billing_interval, 
  features, 
  is_active, 
  is_popular, 
  sort_order
) VALUES (
  'Pro',
  'Advanced features for serious fitness enthusiasts (Save 20%)',
  19190, -- $191.90/year (20% discount from $239.88)
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
  3
) ON CONFLICT (name, billing_interval) DO NOTHING;

-- Update existing Premium plans to have better feature structure
UPDATE subscription_plans 
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
WHERE LOWER(name) LIKE '%premium%';

-- Ensure we have a proper Free/Basic plan
INSERT INTO subscription_plans (
  name, 
  description, 
  price_cents, 
  billing_interval, 
  features, 
  is_active, 
  is_popular, 
  sort_order
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
  1
) ON CONFLICT (name, billing_interval) DO NOTHING;
