-- Update Premium Monthly plan with correct price and Stripe Price ID
UPDATE subscription_plans 
SET 
  stripe_price_id = 'price_1SQZoMJW62tXwc0DsoxUOfpA',
  price_cents = 499,
  description = 'Unlimited access to all premium features - Billed monthly',
  is_active = true,
  sort_order = 2,
  updated_at = now()
WHERE id = 'a7a9e18d-16ef-4993-8539-ed793662b3e3';

-- Create Premium Annual plan
INSERT INTO subscription_plans (
  name,
  description,
  price_cents,
  billing_interval,
  stripe_price_id,
  features,
  is_active,
  is_popular,
  sort_order
) VALUES (
  'Premium',
  'Unlimited access to all premium features - Billed annually (Save $10/year)',
  4999,
  'year',
  'price_1SQZsRJW62tXwc0Dazc2XLxR',
  '["Advanced workout analytics", "AI-powered recommendations", "Social challenges and competitions", "Custom workout builder", "Export your data", "Priority support", "Ad-free experience", "Unlimited cloud storage", "Early access to new features"]'::jsonb,
  true,
  true,
  3
);

-- Delete inactive Pro plans
DELETE FROM subscription_plans 
WHERE id IN (
  '2bded409-d8fb-43c4-b410-c5ad49fb02ae',
  'e26dc68d-20e4-4cec-8f12-81ab183b31de'
);