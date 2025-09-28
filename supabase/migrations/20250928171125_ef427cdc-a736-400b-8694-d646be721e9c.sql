-- Create the main_dashboard feature flag that's missing
INSERT INTO feature_flags (feature_name, description, is_enabled) 
VALUES ('main_dashboard', 'Main dashboard access for all users', true)
ON CONFLICT (feature_name) DO UPDATE SET 
  is_enabled = true,
  updated_at = now();