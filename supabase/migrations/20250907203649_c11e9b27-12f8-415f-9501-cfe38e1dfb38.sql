-- Phase 1: Data Investment Enhancement Tables
-- Victory Photos System
CREATE TABLE public.user_victory_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  victory_title TEXT NOT NULL,
  celebration_notes TEXT,
  stats_overlay JSONB DEFAULT '{}',
  milestone_achieved TEXT,
  is_public BOOLEAN DEFAULT false,
  celebration_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Victory Playlists System  
CREATE TABLE public.user_victory_playlists (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  playlist_name TEXT NOT NULL,
  description TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE TABLE public.victory_playlist_songs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  playlist_id UUID NOT NULL REFERENCES public.user_victory_playlists(id) ON DELETE CASCADE,
  song_title TEXT NOT NULL,
  artist_name TEXT NOT NULL,
  energy_level INTEGER DEFAULT 3 CHECK (energy_level >= 1 AND energy_level <= 5),
  victory_moment_tag TEXT, -- 'warmup', 'power', 'breakthrough', 'celebration'
  duration_seconds INTEGER,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enhanced Workout History with Success Focus
CREATE TABLE public.workout_victory_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.user_sessions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  victory_level INTEGER DEFAULT 3 CHECK (victory_level >= 1 AND victory_level <= 5),
  todays_win TEXT,
  power_moments TEXT[],
  growth_insights TEXT,
  victory_notes TEXT,
  breakthrough_achieved BOOLEAN DEFAULT false,
  energy_before INTEGER CHECK (energy_before >= 1 AND energy_before <= 10),
  energy_after INTEGER CHECK (energy_after >= 1 AND energy_after <= 10),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_victory_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_victory_playlists ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.victory_playlist_songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_victory_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Victory Photos
CREATE POLICY "Users can manage own victory photos" 
ON public.user_victory_photos 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public victory photos" 
ON public.user_victory_photos 
FOR SELECT 
USING (is_public = true);

-- RLS Policies for Victory Playlists
CREATE POLICY "Users can manage own victory playlists" 
ON public.user_victory_playlists 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own playlist songs" 
ON public.victory_playlist_songs 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.user_victory_playlists vp 
  WHERE vp.id = victory_playlist_songs.playlist_id 
  AND vp.user_id = auth.uid()
));

-- RLS Policies for Workout Victory Logs
CREATE POLICY "Users can manage own victory logs" 
ON public.workout_victory_logs 
FOR ALL 
USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_victory_playlists_updated_at
BEFORE UPDATE ON public.user_victory_playlists
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();