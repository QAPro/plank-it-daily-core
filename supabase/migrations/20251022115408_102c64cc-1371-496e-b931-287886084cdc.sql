-- Replace old cartoon avatars with new fitness-themed avatars

-- Step 1: Clear existing avatar options
DELETE FROM avatar_options;

-- Step 2: Reset all users' avatars to NULL (clean slate)
UPDATE users SET avatar_url = NULL WHERE avatar_url IS NOT NULL;

-- Step 3: Insert 16 new fitness-themed avatar options
INSERT INTO avatar_options (name, category, image_url, display_order, is_active) VALUES
  ('Fitness Enthusiast', 'fitness', '/avatars/avatar-1.png', 1, true),
  ('Active Lifestyle', 'fitness', '/avatars/avatar-2.png', 2, true),
  ('Wellness Champion', 'fitness', '/avatars/avatar-3.png', 3, true),
  ('Health Warrior', 'fitness', '/avatars/avatar-4.png', 4, true),
  ('Energy Boost', 'fitness', '/avatars/avatar-5.png', 5, true),
  ('Power Player', 'fitness', '/avatars/avatar-6.png', 6, true),
  ('Fitness Warrior', 'fitness', '/avatars/avatar-7.png', 7, true),
  ('Champion Spirit', 'fitness', '/avatars/avatar-8.png', 8, true),
  ('Strength Master', 'fitness', '/avatars/avatar-9.png', 9, true),
  ('Stretching Pro', 'fitness', '/avatars/avatar-10.png', 10, true),
  ('Victory Vibe', 'fitness', '/avatars/avatar-11.png', 11, true),
  ('Fighter Spirit', 'fitness', '/avatars/avatar-12.png', 12, true),
  ('Runner', 'fitness', '/avatars/avatar-13.png', 13, true),
  ('Power Celebration', 'fitness', '/avatars/avatar-14.png', 14, true),
  ('Zen Master', 'fitness', '/avatars/avatar-15.png', 15, true),
  ('Push-Up Pro', 'fitness', '/avatars/avatar-16.png', 16, true);