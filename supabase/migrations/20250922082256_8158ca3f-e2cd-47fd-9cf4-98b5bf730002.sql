-- ============================================================================
-- SECURITY FIX: Push Notification Cryptographic Keys Protection
-- ============================================================================
-- This migration addresses the security vulnerability where users could 
-- read back their push notification cryptographic keys (auth_key, p256dh_key).
-- 
-- Changes:
-- 1. Drop existing overly permissive RLS policies
-- 2. Create secure policies that prevent key exposure while maintaining functionality
-- 3. Add a secure view for user subscription management without key exposure
-- ============================================================================

-- Step 1: Drop existing RLS policies that expose cryptographic keys
DROP POLICY IF EXISTS "Users can manage own push subscriptions" ON public.push_subscriptions;
DROP POLICY IF EXISTS "Admins can view all push subscriptions" ON public.push_subscriptions;

-- Step 2: Create secure RLS policies

-- Allow users to create new push subscriptions (INSERT only)
CREATE POLICY "Users can create own push subscriptions" 
ON public.push_subscriptions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Allow users to update their subscription status (UPDATE without exposing keys)
CREATE POLICY "Users can update own subscription status" 
ON public.push_subscriptions 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own subscriptions
CREATE POLICY "Users can delete own push subscriptions" 
ON public.push_subscriptions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Allow edge functions and admins to access all data (including keys) via service role
CREATE POLICY "Service role and admins can access all subscriptions" 
ON public.push_subscriptions 
FOR ALL 
USING (
  -- Service role access (for edge functions)
  auth.role() = 'service_role' 
  OR 
  -- Admin access with explicit role check
  EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() 
    AND ur.role IN ('admin', 'superadmin')
  )
);

-- Step 3: Create a secure view for users to check their subscription status
-- This view excludes the sensitive cryptographic keys
CREATE OR REPLACE VIEW public.user_push_subscription_status AS
SELECT 
  id,
  user_id,
  endpoint,
  -- Exclude auth_key and p256dh_key for security
  user_agent,
  is_active,
  created_at,
  updated_at
FROM public.push_subscriptions
WHERE auth.uid() = user_id;

-- Enable RLS on the view (inherits from base table, but this makes it explicit)
ALTER VIEW public.user_push_subscription_status SET (security_invoker = true);

-- Step 4: Create a function for users to safely check if they have active subscriptions
CREATE OR REPLACE FUNCTION public.get_user_push_subscription_count()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::INTEGER 
  FROM public.push_subscriptions 
  WHERE user_id = auth.uid() 
  AND is_active = true;
$$;

-- Step 5: Add helpful comments for future reference
COMMENT ON POLICY "Users can create own push subscriptions" ON public.push_subscriptions 
IS 'Allows users to register new push subscriptions with their cryptographic keys';

COMMENT ON POLICY "Users can update own subscription status" ON public.push_subscriptions 
IS 'Allows users to activate/deactivate subscriptions without exposing keys';

COMMENT ON POLICY "Users can delete own push subscriptions" ON public.push_subscriptions 
IS 'Allows users to unsubscribe and remove their data';

COMMENT ON POLICY "Service role and admins can access all subscriptions" ON public.push_subscriptions 
IS 'Edge functions (service role) and admins can access all data including cryptographic keys';

COMMENT ON VIEW public.user_push_subscription_status 
IS 'Secure view for users to check subscription status without exposing cryptographic keys';

COMMENT ON FUNCTION public.get_user_push_subscription_count() 
IS 'Safe function for users to count their active subscriptions without key exposure';