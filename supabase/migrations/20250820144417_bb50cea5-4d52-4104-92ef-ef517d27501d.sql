
-- Create avatar options table with predefined cartoon bust avatars
CREATE TABLE public.avatar_options (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  image_url text NOT NULL,
  category text NOT NULL DEFAULT 'cartoon_bust',
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert predefined cartoon bust avatars
INSERT INTO public.avatar_options (name, image_url, category, display_order) VALUES
('Classic Male', '/avatars/cartoon-male-1.svg', 'cartoon_bust', 1),
('Classic Female', '/avatars/cartoon-female-1.svg', 'cartoon_bust', 2),
('Casual Male', '/avatars/cartoon-male-2.svg', 'cartoon_bust', 3),
('Casual Female', '/avatars/cartoon-female-2.svg', 'cartoon_bust', 4),
('Professional Male', '/avatars/cartoon-male-3.svg', 'cartoon_bust', 5),
('Professional Female', '/avatars/cartoon-female-3.svg', 'cartoon_bust', 6),
('Friendly Male', '/avatars/cartoon-male-4.svg', 'cartoon_bust', 7),
('Friendly Female', '/avatars/cartoon-female-4.svg', 'cartoon_bust', 8),
('Cool Male', '/avatars/cartoon-male-5.svg', 'cartoon_bust', 9),
('Cool Female', '/avatars/cartoon-female-5.svg', 'cartoon_bust', 10),
('Smart Male', '/avatars/cartoon-male-6.svg', 'cartoon_bust', 11),
('Smart Female', '/avatars/cartoon-female-6.svg', 'cartoon_bust', 12);

-- Enable RLS on avatar_options table
ALTER TABLE public.avatar_options ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to view avatar options
CREATE POLICY "Anyone can view avatar options" 
  ON public.avatar_options 
  FOR SELECT 
  USING (is_active = true);

-- Add case-insensitive unique constraint on username
CREATE UNIQUE INDEX users_username_unique_ci ON public.users (lower(username)) WHERE username IS NOT NULL;

-- Add columns for email change functionality
ALTER TABLE public.users ADD COLUMN pending_new_email text;
ALTER TABLE public.users ADD COLUMN email_change_sent_at timestamp with time zone;
