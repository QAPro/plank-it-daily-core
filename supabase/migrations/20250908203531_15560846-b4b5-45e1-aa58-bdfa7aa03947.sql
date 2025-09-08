-- Add missing 'subscriber' role to enum for premium users
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'subscriber';