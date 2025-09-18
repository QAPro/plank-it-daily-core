-- Drop the problematic public policy that's causing the security issue
DROP POLICY IF EXISTS "Anyone can view status tracks" ON public.user_status_tracks;

-- Enable RLS on user_status_tracks table
ALTER TABLE public.user_status_tracks ENABLE ROW LEVEL SECURITY;

-- Only create the essential policy if it doesn't exist
DO $$
BEGIN
  -- Check if the policy exists, if not create it
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_status_tracks' 
    AND policyname = 'Users can view own status tracks'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view own status tracks" ON public.user_status_tracks FOR SELECT USING (auth.uid() = user_id)';
  END IF;
END $$;