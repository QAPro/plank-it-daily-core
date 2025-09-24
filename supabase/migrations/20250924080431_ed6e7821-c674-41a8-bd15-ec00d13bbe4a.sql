-- Fix critical security issue: Billing transactions INSERT policy is too permissive
-- Remove the current overly permissive INSERT policy
DROP POLICY "System can create transactions" ON public.billing_transactions;

-- Create a more secure INSERT policy that only allows system operations
-- This prevents unauthorized users from creating fake billing records
CREATE POLICY "Only system can create transactions" 
ON public.billing_transactions 
FOR INSERT 
WITH CHECK (
  -- Only allow inserts when there's no authenticated user (system operations)
  -- OR when called by an admin in specific administrative contexts
  auth.uid() IS NULL 
  OR 
  (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'::app_role
    )
    AND user_id IS NOT NULL
  )
);

-- Add an additional UPDATE policy to prevent unauthorized modifications
CREATE POLICY "Only system and admins can update transactions" 
ON public.billing_transactions 
FOR UPDATE 
USING (
  -- Only system (no auth.uid()) or admins can update
  auth.uid() IS NULL 
  OR 
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);

-- Add DELETE policy for completeness (only admins for data retention compliance)
CREATE POLICY "Only admins can delete transactions" 
ON public.billing_transactions 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'::app_role
  )
);