-- Create public storage bucket for achievement badges
INSERT INTO storage.buckets (id, name, public)
VALUES ('achievement-badges', 'achievement-badges', true);

-- RLS policy for public read access to badge images
CREATE POLICY "Public badge access"
ON storage.objects FOR SELECT
USING (bucket_id = 'achievement-badges');

-- Allow authenticated users to upload badges (for admin purposes)
CREATE POLICY "Authenticated users can upload badges"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'achievement-badges');