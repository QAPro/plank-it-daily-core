-- Add explicit SELECT policy to push_subscriptions table for complete security
-- This ensures users can directly query their own push subscriptions from the table

CREATE POLICY "Users can view own push subscriptions" 
ON public.push_subscriptions 
FOR SELECT 
USING (auth.uid() = user_id);