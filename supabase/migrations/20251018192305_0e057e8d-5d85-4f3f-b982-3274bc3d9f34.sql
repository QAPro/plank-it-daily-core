-- Upgrade Migrate1 user to premium tier for testing
UPDATE users 
SET 
  subscription_tier = 'premium',
  updated_at = now()
WHERE id = 'a4d6155d-dce5-4195-a58f-f7c539f6ba80';