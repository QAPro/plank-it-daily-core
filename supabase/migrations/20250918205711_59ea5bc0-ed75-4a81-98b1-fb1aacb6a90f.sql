-- First, drop ALL existing policies on user_reputation table to start clean
DROP POLICY IF EXISTS "Anyone can view reputation" ON public.user_reputation;
DROP POLICY IF EXISTS "Users can view own reputation" ON public.user_reputation;
DROP POLICY IF EXISTS "Users can update own reputation" ON public.user_reputation;
DROP POLICY IF EXISTS "Users can insert own reputation" ON public.user_reputation;
DROP POLICY IF EXISTS "Admins can view all reputation" ON public.user_reputation;
DROP POLICY IF EXISTS "System can create reputation" ON public.user_reputation;

-- Enable RLS on user_reputation table
ALTER TABLE public.user_reputation ENABLE ROW LEVEL SECURITY;

-- Create secure policies for user_reputation
CREATE POLICY "Users can view own reputation" 
ON public.user_reputation 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reputation" 
ON public.user_reputation 
FOR ALL 
USING (auth.uid() = user_id);

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

-- Allow system/triggers to create reputation records
CREATE POLICY "System can create reputation records" 
ON public.user_reputation 
FOR INSERT 
WITH CHECK (true);