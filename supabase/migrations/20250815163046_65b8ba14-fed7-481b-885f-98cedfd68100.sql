
-- Add subscription tier to users table
ALTER TABLE public.users 
ADD COLUMN subscription_tier text NOT NULL DEFAULT 'free';

-- Add check constraint for valid subscription tiers
ALTER TABLE public.users 
ADD CONSTRAINT valid_subscription_tier 
CHECK (subscription_tier IN ('free', 'premium', 'pro'));

-- Create index for efficient queries
CREATE INDEX idx_users_subscription_tier ON public.users(subscription_tier);
