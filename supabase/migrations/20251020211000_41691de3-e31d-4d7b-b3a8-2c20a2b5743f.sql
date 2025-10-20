-- Create achievement category enum
CREATE TYPE achievement_category AS ENUM (
  'Milestones',
  'Consistency', 
  'Momentum',
  'Performance',
  'Social',
  'Special'
);

-- Create achievement rarity enum
CREATE TYPE achievement_rarity AS ENUM (
  'Common',
  'Uncommon',
  'Rare',
  'Epic'
);

-- Create achievements table
CREATE TABLE public.achievements (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  category achievement_category NOT NULL,
  rarity achievement_rarity NOT NULL,
  points INTEGER NOT NULL DEFAULT 0,
  criteria TEXT NOT NULL,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_secret BOOLEAN NOT NULL DEFAULT false,
  related_exercise_categories TEXT[] DEFAULT '{}',
  badge_file_name TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlock_criteria JSONB DEFAULT NULL,
  is_disabled BOOLEAN DEFAULT false,
  disabled_reason TEXT DEFAULT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Anyone can view non-secret achievements
CREATE POLICY "Anyone can view non-secret achievements"
ON public.achievements
FOR SELECT
USING (
  is_secret = false
);

-- RLS Policy: Users can view secret achievements they've earned
CREATE POLICY "Users can view earned secret achievements"
ON public.achievements
FOR SELECT
USING (
  is_secret = true 
  AND EXISTS (
    SELECT 1 FROM public.user_achievements ua
    WHERE ua.user_id = auth.uid()
    AND ua.achievement_type = achievements.id
  )
);

-- RLS Policy: Admins can manage all achievements
CREATE POLICY "Admins can manage achievements"
ON public.achievements
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles ur
    WHERE ur.user_id = auth.uid()
    AND ur.role = 'admin'::app_role
  )
);

-- Create indexes for performance
CREATE INDEX idx_achievements_category ON public.achievements(category);
CREATE INDEX idx_achievements_rarity ON public.achievements(rarity);
CREATE INDEX idx_achievements_is_secret ON public.achievements(is_secret);
CREATE INDEX idx_achievements_is_premium ON public.achievements(is_premium);
CREATE INDEX idx_achievements_points ON public.achievements(points DESC);

-- Create updated_at trigger
CREATE TRIGGER update_achievements_updated_at
BEFORE UPDATE ON public.achievements
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();