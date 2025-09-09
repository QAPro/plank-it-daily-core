-- Add sender_user_id column to notification_logs table for tracking who sent notifications
ALTER TABLE public.notification_logs 
ADD COLUMN IF NOT EXISTS sender_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;