-- Create specialized status tracks table
CREATE TABLE public.user_status_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_name TEXT NOT NULL,
  track_level INTEGER NOT NULL DEFAULT 1,
  experience_points INTEGER NOT NULL DEFAULT 0,
  level_progress NUMERIC NOT NULL DEFAULT 0.0,
  awarded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, track_name)
);

-- Create level unlocks table for progressive features
CREATE TABLE public.level_unlocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  track_name TEXT NOT NULL,
  level_required INTEGER NOT NULL,
  feature_name TEXT NOT NULL,
  feature_type TEXT NOT NULL DEFAULT 'feature', -- 'feature', 'theme', 'privilege', 'reward'
  unlock_data JSONB NOT NULL DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(track_name, level_required, feature_name)
);

-- Create featured users table for rotation system
CREATE TABLE public.featured_users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feature_type TEXT NOT NULL DEFAULT 'weekly', -- 'weekly', 'monthly', 'hall_of_fame'
  featured_for TEXT NOT NULL, -- reason for featuring
  featured_data JSONB NOT NULL DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_status_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.level_unlocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.featured_users ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_status_tracks
CREATE POLICY "Users can view own status tracks" ON public.user_status_tracks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view public status tracks" ON public.user_status_tracks  
  FOR SELECT USING (true); -- Allow viewing others' tracks for leaderboards

CREATE POLICY "System can manage status tracks" ON public.user_status_tracks
  FOR ALL USING (true) WITH CHECK (true);

-- RLS Policies for level_unlocks  
CREATE POLICY "Anyone can view level unlocks" ON public.level_unlocks
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage level unlocks" ON public.level_unlocks
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- RLS Policies for featured_users
CREATE POLICY "Anyone can view active featured users" ON public.featured_users
  FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage featured users" ON public.featured_users
  FOR ALL USING (is_admin(auth.uid())) WITH CHECK (is_admin(auth.uid()));

-- Create indexes for performance
CREATE INDEX idx_user_status_tracks_user_id ON public.user_status_tracks(user_id);
CREATE INDEX idx_user_status_tracks_track_level ON public.user_status_tracks(track_name, track_level);
CREATE INDEX idx_level_unlocks_track_level ON public.level_unlocks(track_name, level_required);
CREATE INDEX idx_featured_users_active ON public.featured_users(is_active, feature_type, start_date);

-- Insert default level unlocks for each track
INSERT INTO public.level_unlocks (track_name, level_required, feature_name, feature_type, unlock_data) VALUES
-- Core Master Track
('core_master', 2, 'advanced_plank_variations', 'feature', '{"description": "Unlock advanced plank exercise variations"}'),
('core_master', 3, 'core_insights_dashboard', 'feature', '{"description": "Access detailed core strength analytics"}'),
('core_master', 5, 'core_master_badge', 'reward', '{"badge_color": "bronze", "description": "Bronze Core Master badge"}'),
('core_master', 7, 'exclusive_core_themes', 'theme', '{"themes": ["core_champion", "steel_abs"], "description": "Exclusive core-focused timer themes"}'),
('core_master', 10, 'core_master_legend', 'privilege', '{"privileges": ["mentor_eligibility", "challenge_creation"], "description": "Legend status with mentoring privileges"}'),

-- Consistency Champion Track  
('consistency_champion', 2, 'streak_protection', 'feature', '{"description": "One-time streak protection from missed days"}'),
('consistency_champion', 3, 'habit_insights', 'feature', '{"description": "Advanced habit formation analytics"}'),
('consistency_champion', 5, 'consistency_badge', 'reward', '{"badge_color": "bronze", "description": "Bronze Consistency badge"}'),
('consistency_champion', 7, 'premium_reminders', 'feature', '{"description": "Smart adaptive workout reminders"}'),
('consistency_champion', 10, 'consistency_legend', 'privilege', '{"privileges": ["community_leader", "featured_stories"], "description": "Legend status with leadership privileges"}'),

-- Endurance Expert Track
('endurance_expert', 2, 'endurance_challenges', 'feature', '{"description": "Access to specialized endurance challenges"}'),
('endurance_expert', 3, 'performance_predictions', 'feature', '{"description": "AI-powered performance forecasting"}'),
('endurance_expert', 5, 'endurance_badge', 'reward', '{"badge_color": "bronze", "description": "Bronze Endurance Expert badge"}'),
('endurance_expert', 7, 'endurance_themes', 'theme', '{"themes": ["marathon_mind", "iron_will"], "description": "Exclusive endurance-focused themes"}'),
('endurance_expert', 10, 'endurance_legend', 'privilege', '{"privileges": ["training_plan_creator", "expert_advice"], "description": "Legend status with expert privileges"}'),

-- Form Perfectionist Track
('form_perfectionist', 2, 'form_analysis', 'feature', '{"description": "Detailed form breakdown and tips"}'),
('form_perfectionist', 3, 'technique_library', 'feature', '{"description": "Access to premium technique guides"}'),
('form_perfectionist', 5, 'perfectionist_badge', 'reward', '{"badge_color": "bronze", "description": "Bronze Form Perfectionist badge"}'),
('form_perfectionist', 7, 'precision_themes', 'theme', '{"themes": ["perfect_form", "precision_master"], "description": "Precision-focused timer themes"}'),
('form_perfectionist', 10, 'form_legend', 'privilege', '{"privileges": ["technique_reviewer", "form_mentor"], "description": "Legend status with teaching privileges"}'),

-- Community Leader Track  
('community_leader', 2, 'post_highlights', 'feature', '{"description": "Ability to highlight community posts"}'),
('community_leader', 3, 'group_challenges', 'feature', '{"description": "Create and manage group challenges"}'),
('community_leader', 5, 'leader_badge', 'reward', '{"badge_color": "bronze", "description": "Bronze Community Leader badge"}'),
('community_leader', 7, 'moderation_tools', 'privilege', '{"privileges": ["content_moderation", "user_reports"], "description": "Community moderation privileges"}'),
('community_leader', 10, 'community_legend', 'privilege', '{"privileges": ["featured_leader", "event_hosting", "community_awards"], "description": "Legend status with full leadership privileges"}');

-- Create trigger for updating updated_at
CREATE OR REPLACE FUNCTION update_user_status_tracks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_status_tracks_updated_at
  BEFORE UPDATE ON public.user_status_tracks
  FOR EACH ROW
  EXECUTE FUNCTION update_user_status_tracks_updated_at();