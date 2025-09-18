-- Secure user_reputation table 
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view reputation" ON public.user_reputation;

-- Create secure policies for user_reputation
CREATE POLICY "Users can view own reputation" 
ON public.user_reputation 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own reputation" 
ON public.user_reputation 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own reputation" 
ON public.user_reputation 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all reputation" 
ON public.user_reputation 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::public.app_role
  )
);

-- Secure user_status_tracks table
ALTER TABLE public.user_status_tracks ENABLE ROW LEVEL SECURITY;

-- Drop the overly permissive public policy
DROP POLICY IF EXISTS "Anyone can view status tracks" ON public.user_status_tracks;

-- Create secure policies for user_status_tracks
CREATE POLICY "Users can view own status tracks" 
ON public.user_status_tracks 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own status tracks" 
ON public.user_status_tracks 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own status tracks" 
ON public.user_status_tracks 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

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