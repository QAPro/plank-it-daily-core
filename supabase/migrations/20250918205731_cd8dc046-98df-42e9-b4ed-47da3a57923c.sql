-- First, drop ALL existing policies on user_status_tracks table to start clean
DROP POLICY IF EXISTS "Anyone can view status tracks" ON public.user_status_tracks;
DROP POLICY IF EXISTS "Users can view own status tracks" ON public.user_status_tracks;
DROP POLICY IF EXISTS "Users can update own status tracks" ON public.user_status_tracks;
DROP POLICY IF EXISTS "Users can insert own status tracks" ON public.user_status_tracks;
DROP POLICY IF EXISTS "Admins can view all status tracks" ON public.user_status_tracks;

-- Enable RLS on user_status_tracks table
ALTER TABLE public.user_status_tracks ENABLE ROW LEVEL SECURITY;

-- Create secure policies for user_status_tracks
CREATE POLICY "Users can view own status tracks" 
ON public.user_status_tracks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own status tracks" 
ON public.user_status_tracks 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all status tracks" 
ON public.user_status_tracks 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::public.app_role
  )
);

-- Allow system/triggers to create status track records
CREATE POLICY "System can create status tracks" 
ON public.user_status_tracks 
FOR INSERT 
WITH CHECK (true);