
-- Create user roles table for admin access control
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Create feature flags table for dynamic feature control
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT true NOT NULL,
  description TEXT,
  target_audience TEXT DEFAULT 'all', -- 'all', 'premium', 'pro', 'admin'
  rollout_percentage INTEGER DEFAULT 100 CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create admin settings table for global configuration
CREATE TABLE public.admin_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key TEXT NOT NULL UNIQUE,
  setting_value JSONB NOT NULL DEFAULT '{}',
  description TEXT,
  is_public BOOLEAN DEFAULT false, -- whether users can see this setting
  updated_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create seasonal events table
CREATE TABLE public.seasonal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL DEFAULT 'challenge', -- 'challenge', 'tournament', 'community'
  theme_data JSONB DEFAULT '{}', -- UI themes, colors, etc
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  participation_requirements JSONB DEFAULT '{}',
  reward_data JSONB DEFAULT '{}',
  max_participants INTEGER,
  current_participants INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create event challenges table
CREATE TABLE public.event_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.seasonal_events(id) ON DELETE CASCADE NOT NULL,
  challenge_title TEXT NOT NULL,
  challenge_description TEXT,
  challenge_type TEXT NOT NULL, -- 'duration', 'consistency', 'progression'
  target_criteria JSONB NOT NULL,
  points_reward INTEGER DEFAULT 0,
  badge_reward TEXT,
  is_active BOOLEAN DEFAULT true,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create event participants table
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.seasonal_events(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  progress_data JSONB DEFAULT '{}',
  is_completed BOOLEAN DEFAULT false,
  completion_date TIMESTAMP WITH TIME ZONE,
  final_score INTEGER DEFAULT 0,
  rank_position INTEGER,
  UNIQUE (event_id, user_id)
);

-- Create fitness leagues table
CREATE TABLE public.fitness_leagues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  league_type TEXT NOT NULL DEFAULT 'skill_based', -- 'skill_based', 'casual', 'competitive'
  season_duration_days INTEGER DEFAULT 30,
  max_participants_per_division INTEGER DEFAULT 50,
  ranking_algorithm TEXT DEFAULT 'elo', -- 'elo', 'points', 'performance'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create league divisions table
CREATE TABLE public.league_divisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES public.fitness_leagues(id) ON DELETE CASCADE NOT NULL,
  division_name TEXT NOT NULL, -- 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'
  division_level INTEGER NOT NULL CHECK (division_level >= 1),
  min_rating INTEGER DEFAULT 0,
  max_rating INTEGER DEFAULT 1000,
  promotion_threshold NUMERIC DEFAULT 0.8, -- top 80% get promoted
  relegation_threshold NUMERIC DEFAULT 0.2, -- bottom 20% get relegated
  current_participants INTEGER DEFAULT 0,
  UNIQUE (league_id, division_level)
);

-- Create league participants table
CREATE TABLE public.league_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES public.fitness_leagues(id) ON DELETE CASCADE NOT NULL,
  division_id UUID REFERENCES public.league_divisions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  current_rating INTEGER DEFAULT 1000,
  peak_rating INTEGER DEFAULT 1000,
  matches_played INTEGER DEFAULT 0,
  matches_won INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  season_points INTEGER DEFAULT 0,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  last_match_at TIMESTAMP WITH TIME ZONE,
  UNIQUE (league_id, user_id)
);

-- Create league seasons table
CREATE TABLE public.league_seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  league_id UUID REFERENCES public.fitness_leagues(id) ON DELETE CASCADE NOT NULL,
  season_number INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  season_rewards JSONB DEFAULT '{}',
  total_participants INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (league_id, season_number)
);

-- Create tournaments table
CREATE TABLE public.tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  tournament_type TEXT NOT NULL DEFAULT 'elimination', -- 'elimination', 'round_robin', 'swiss'
  bracket_size INTEGER NOT NULL CHECK (bracket_size > 0),
  entry_requirements JSONB DEFAULT '{}',
  prize_pool JSONB DEFAULT '{}',
  registration_start TIMESTAMP WITH TIME ZONE NOT NULL,
  registration_end TIMESTAMP WITH TIME ZONE NOT NULL,
  tournament_start TIMESTAMP WITH TIME ZONE NOT NULL,
  tournament_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'upcoming', -- 'upcoming', 'registration', 'active', 'completed', 'cancelled'
  max_participants INTEGER DEFAULT 64,
  current_participants INTEGER DEFAULT 0,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Create tournament participants table
CREATE TABLE public.tournament_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  seed_position INTEGER,
  current_round INTEGER DEFAULT 1,
  is_eliminated BOOLEAN DEFAULT false,
  elimination_round INTEGER,
  total_score INTEGER DEFAULT 0,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE (tournament_id, user_id)
);

-- Create tournament matches table
CREATE TABLE public.tournament_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES public.tournaments(id) ON DELETE CASCADE NOT NULL,
  round_number INTEGER NOT NULL,
  match_number INTEGER NOT NULL,
  participant1_id UUID REFERENCES public.tournament_participants(id),
  participant2_id UUID REFERENCES public.tournament_participants(id),
  winner_id UUID REFERENCES public.tournament_participants(id),
  match_data JSONB DEFAULT '{}', -- scores, performance metrics
  scheduled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pending', -- 'pending', 'active', 'completed', 'bye'
  UNIQUE (tournament_id, round_number, match_number)
);

-- Add RLS policies for user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add RLS policies for feature_flags
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active feature flags" ON public.feature_flags
  FOR SELECT USING (is_enabled = true);

CREATE POLICY "Admins can manage feature flags" ON public.feature_flags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add RLS policies for admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view public settings" ON public.admin_settings
  FOR SELECT USING (is_public = true);

CREATE POLICY "Admins can manage all settings" ON public.admin_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add RLS policies for seasonal_events
ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active events" ON public.seasonal_events
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage events" ON public.seasonal_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add RLS policies for event_challenges
ALTER TABLE public.event_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active event challenges" ON public.event_challenges
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage event challenges" ON public.event_challenges
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add RLS policies for event_participants
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own event participation" ON public.event_participants
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can join events" ON public.event_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own participation" ON public.event_participants
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all event participation" ON public.event_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add RLS policies for fitness_leagues
ALTER TABLE public.fitness_leagues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active leagues" ON public.fitness_leagues
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage leagues" ON public.fitness_leagues
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add RLS policies for league_divisions
ALTER TABLE public.league_divisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view league divisions" ON public.league_divisions
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage league divisions" ON public.league_divisions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add RLS policies for league_participants
ALTER TABLE public.league_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view league participants" ON public.league_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can join leagues" ON public.league_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own league participation" ON public.league_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for tournaments
ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournaments" ON public.tournaments
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tournaments" ON public.tournaments
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Add RLS policies for tournament_participants
ALTER TABLE public.tournament_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tournament participants" ON public.tournament_participants
  FOR SELECT USING (true);

CREATE POLICY "Users can register for tournaments" ON public.tournament_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tournament participation" ON public.tournament_participants
  FOR UPDATE USING (auth.uid() = user_id);

-- Add RLS policies for tournament_matches
ALTER TABLE public.tournament_matches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tournament matches" ON public.tournament_matches
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage tournament matches" ON public.tournament_matches
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      WHERE ur.user_id = auth.uid() AND ur.role = 'admin'
    )
  );

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
$$;

-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT public.has_role(_user_id, 'admin');
$$;

-- Insert initial feature flags
INSERT INTO public.feature_flags (feature_name, description, target_audience) VALUES
  ('seasonal_events', 'Enable seasonal events and challenges', 'all'),
  ('competitive_leagues', 'Enable competitive league system', 'premium'),
  ('tournaments', 'Enable tournament participation', 'pro'),
  ('advanced_analytics', 'Enable advanced analytics dashboard', 'premium'),
  ('social_features', 'Enable social features and friend system', 'all'),
  ('custom_themes', 'Enable custom timer themes', 'premium'),
  ('coaching_messages', 'Enable AI coaching messages', 'pro');

-- Insert initial admin settings
INSERT INTO public.admin_settings (setting_key, setting_value, description, is_public) VALUES
  ('maintenance_mode', 'false', 'Enable maintenance mode for the app', true),
  ('max_daily_sessions', '10', 'Maximum daily sessions per user', false),
  ('tournament_registration_fee', '0', 'Fee for tournament registration in points', true),
  ('seasonal_event_frequency', '30', 'Days between seasonal events', false);

-- Insert initial league structure
INSERT INTO public.fitness_leagues (name, description) VALUES
  ('Core Strength League', 'Competitive league focused on core strength and endurance'),
  ('Beginner Friendly League', 'Casual league for new users to build confidence');

-- Insert divisions for the Core Strength League
INSERT INTO public.league_divisions (league_id, division_name, division_level, min_rating, max_rating) 
SELECT fl.id, division_name, division_level, min_rating, max_rating
FROM public.fitness_leagues fl,
(VALUES 
  ('Bronze', 1, 0, 1199),
  ('Silver', 2, 1200, 1399), 
  ('Gold', 3, 1400, 1599),
  ('Platinum', 4, 1600, 1799),
  ('Diamond', 5, 1800, 2500)
) AS divisions(division_name, division_level, min_rating, max_rating)
WHERE fl.name = 'Core Strength League';
