-- Comprehensive RLS Security Fix: Implement Proper RESTRICTIVE Policies
-- This migration fixes the architectural flaw where PERMISSIVE policies were used incorrectly
-- to block access. We replace them with RESTRICTIVE policies that create hard security boundaries.

-- ============================================================================
-- Phase 1: Fix Users Table RLS Policies
-- ============================================================================

-- Drop non-functional PERMISSIVE deny-all policies
DROP POLICY IF EXISTS "Block all anonymous access to users table" ON public.users;
DROP POLICY IF EXISTS "Explicitly block public user data access" ON public.users;
DROP POLICY IF EXISTS "Prevent user profile deletion" ON public.users;

-- Add proper RESTRICTIVE policies for users table
-- RESTRICTIVE policies create hard blocks that cannot be bypassed by PERMISSIVE policies

-- Require authentication for all operations
CREATE POLICY "users_require_authentication"
ON public.users
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Prevent deletion except by system or admin
CREATE POLICY "users_prevent_deletion_restrictive"
ON public.users
AS RESTRICTIVE
FOR DELETE
TO public
USING (
  auth.uid() IS NULL OR is_admin(auth.uid())
);

-- Keep existing functional PERMISSIVE policies:
-- - "Users can view own profile data"
-- - "Users can update own profile data"
-- - "Admins can view all user profiles"
-- - "Admins can update user profiles"

-- ============================================================================
-- Phase 2: Fix Billing_transactions Table RLS Policies
-- ============================================================================

-- Drop the non-functional deny-all policy
DROP POLICY IF EXISTS "billing_default_deny_all" ON public.billing_transactions;

-- Add proper RESTRICTIVE policies for billing_transactions

-- Require authentication for all operations
CREATE POLICY "billing_require_authentication"
ON public.billing_transactions
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Prevent unauthorized updates (only system or admin)
CREATE POLICY "billing_prevent_unauthorized_modifications"
ON public.billing_transactions
AS RESTRICTIVE
FOR UPDATE
TO public
USING (
  auth.uid() IS NULL OR is_admin_with_audit(auth.uid())
);

-- Prevent unauthorized deletions (only system or superadmin)
CREATE POLICY "billing_prevent_unauthorized_deletion"
ON public.billing_transactions
AS RESTRICTIVE
FOR DELETE
TO public
USING (
  auth.uid() IS NULL OR is_superadmin(auth.uid())
);

-- Keep existing functional PERMISSIVE policies:
-- - "billing_users_own_data_read_only"
-- - "billing_admin_secure_function_only"
-- - "billing_system_create_only"

-- ============================================================================
-- Phase 3: Fix Notification_logs Table RLS Policies
-- ============================================================================

-- Add RESTRICTIVE policy to ensure authentication
CREATE POLICY "notifications_require_authentication"
ON public.notification_logs
AS RESTRICTIVE
FOR ALL
TO public
USING (auth.uid() IS NOT NULL);

-- Add RESTRICTIVE policy to prevent cross-user access
CREATE POLICY "notifications_strict_user_isolation"
ON public.notification_logs
AS RESTRICTIVE
FOR SELECT
TO public
USING (
  user_id = auth.uid() OR is_admin(auth.uid())
);

-- Add RESTRICTIVE policy for modifications
CREATE POLICY "notifications_prevent_unauthorized_modifications"
ON public.notification_logs
AS RESTRICTIVE
FOR UPDATE
TO public
USING (
  user_id = auth.uid() OR is_admin(auth.uid())
);

-- Add RESTRICTIVE policy for deletions
CREATE POLICY "notifications_prevent_unauthorized_deletion"
ON public.notification_logs
AS RESTRICTIVE
FOR DELETE
TO public
USING (
  user_id = auth.uid() OR is_admin(auth.uid())
);

-- ============================================================================
-- Documentation: Security Architecture
-- ============================================================================

COMMENT ON TABLE public.users IS 'User profiles with layered RLS security: RESTRICTIVE policies enforce hard blocks (authentication required, deletion restricted), PERMISSIVE policies allow specific access (own data, admin access). All access logged via audit trails.';

COMMENT ON TABLE public.billing_transactions IS 'Financial data with maximum security: RESTRICTIVE policies enforce hard blocks (authentication required, modifications/deletions restricted), PERMISSIVE policies allow access only via secure SECURITY DEFINER functions with full audit logging, rate limiting, and field-level encryption.';

COMMENT ON TABLE public.notification_logs IS 'User notifications with strict isolation: RESTRICTIVE policies enforce hard blocks (authentication required, cross-user access prevented), PERMISSIVE policies allow specific access (own notifications, admin oversight).';

-- ============================================================================
-- Security Architecture Explanation
-- ============================================================================
-- 
-- PostgreSQL RLS Policy Types:
-- 
-- 1. PERMISSIVE (default): Multiple policies are OR'd together
--    - If ANY PERMISSIVE policy allows access, the row is accessible
--    - Used for granting specific permissions (e.g., "users can read own data")
-- 
-- 2. RESTRICTIVE: Multiple policies are AND'd together
--    - ALL RESTRICTIVE policies must pass for access
--    - Used for creating hard security boundaries (e.g., "must be authenticated")
-- 
-- Evaluation Order:
-- - A row must pass ALL RESTRICTIVE policies AND at least one PERMISSIVE policy
-- - RESTRICTIVE = security boundaries, PERMISSIVE = specific allowances
-- 
-- This architecture:
-- ✅ RESTRICTIVE policies block all anonymous access (hard boundary)
-- ✅ RESTRICTIVE policies prevent unauthorized modifications (hard boundary)
-- ✅ PERMISSIVE policies allow specific access (user own data, admin access)
-- ✅ All existing security features maintained (audit, encryption, rate limiting)
-- ✅ Clean, maintainable, and secure by default
-- 
-- ============================================================================