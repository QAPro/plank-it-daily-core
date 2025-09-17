-- Fix security issue: Restrict access to users table to prevent data theft

-- Drop existing problematic policies
DROP POLICY "Deny unauthorized access to user profiles" ON public.users;
DROP POLICY "Users can view own profile" ON public.users;
DROP POLICY "Users can update own profile" ON public.users;

-- Create secure policies that only allow users to access their own data
CREATE POLICY "Users can only view own profile" 
ON public.users 
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can only update own profile" 
ON public.users 
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile during signup
CREATE POLICY "Users can insert own profile" 
ON public.users 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Ensure no public access to users table
-- (No policies for anonymous users means they can't access anything)