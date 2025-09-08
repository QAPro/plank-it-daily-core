-- Phase 1: Database Schema Enhancement for User Role Access Control System
-- Split into parts due to PostgreSQL enum transaction constraints

-- First, add the new enum values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'superadmin';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'beta_tester';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'support_agent';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'content_creator';

-- Create special_permissions table for granular access control
CREATE TABLE IF NOT EXISTS public.special_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  permission_type TEXT NOT NULL,
  granted_by UUID,
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on special_permissions
ALTER TABLE public.special_permissions ENABLE ROW LEVEL SECURITY;

-- Create policies for special_permissions
CREATE POLICY "Admins can manage special permissions"
ON public.special_permissions
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "Users can view own special permissions"
ON public.special_permissions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_special_permissions_updated_at
BEFORE UPDATE ON public.special_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();