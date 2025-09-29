-- Remove overly permissive policies from sensitive tables that exist
-- Only drop policies with USING (true) or WITH CHECK (true) on sensitive data

-- Drop overly permissive policies from billing_transactions (confirmed exists in schema)
DROP POLICY IF EXISTS "System can manage transactions" ON public.billing_transactions;

-- Note: Preserving existing restrictive policies on billing_transactions:
-- - billing_admin_secure_function_only (admin access with audit)
-- - billing_users_own_data_read_only (users can only view their own)
-- - billing_prevent_unauthorized_modifications
-- - billing_prevent_unauthorized_deletion
-- - billing_system_create_only
-- - billing_require_authentication

-- Security improvement: The overly permissive "System can manage transactions" policy
-- has been removed. Now billing data is protected by:
-- 1. Users can only view their own transactions (not modify)
-- 2. Only admins with audit logging can modify billing data
-- 3. Only system or admins can create new transactions
-- 4. Super admins required for deletion

-- Note: Other sensitive tables already have proper restrictive policies in place
-- and do not need changes at this time.