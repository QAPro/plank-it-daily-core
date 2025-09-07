-- Add music preferences fields to user_preferences table
ALTER TABLE public.user_preferences 
ADD COLUMN IF NOT EXISTS preferred_music_genre TEXT DEFAULT 'electronic',
ADD COLUMN IF NOT EXISTS music_auto_start TEXT DEFAULT 'timer-only';