-- Update subscription plans to support 2-tier system
-- Deactivate any existing "Pro" plans and update users from "pro" to "premium"

-- First, update any users with "pro" tier to "premium"
UPDATE public.users 
SET subscription_tier = 'premium', updated_at = now()
WHERE subscription_tier = 'pro';

-- Deactivate any Pro plans in subscription_plans table
UPDATE public.subscription_plans 
SET is_active = false, updated_at = now()
WHERE LOWER(name) LIKE '%pro%' AND LOWER(name) NOT LIKE '%premium%';

-- Update the comment on subscription_tier column to reflect new 2-tier system
COMMENT ON COLUMN public.users.subscription_tier IS 'User subscription tier: free or premium';