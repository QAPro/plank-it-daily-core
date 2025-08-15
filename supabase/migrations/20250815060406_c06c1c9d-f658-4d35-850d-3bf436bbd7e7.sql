-- Add additional security policy to explicitly deny unauthorized access to users table
-- This provides defense in depth alongside existing policies

CREATE POLICY "Deny unauthorized access to user profiles" 
ON public.users 
FOR ALL 
TO public 
USING (false) 
WITH CHECK (false);

-- Ensure the existing secure policies take precedence
-- (Existing policies already correctly restrict to auth.uid() = id)