
-- Phase 1: Database Schema Enhancement
-- Add new achievement categories and enhance existing tables

-- Add new achievement types to support expanded categories
ALTER TABLE user_achievements 
ADD COLUMN IF NOT EXISTS points INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS rarity TEXT DEFAULT 'common',
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- Create index for better performance on achievement queries
CREATE INDEX IF NOT EXISTS idx_user_achievements_category ON user_achievements(category);
CREATE INDEX IF NOT EXISTS idx_user_achievements_type ON user_achievements(achievement_type);
CREATE INDEX IF NOT EXISTS idx_user_achievements_earned_at ON user_achievements(earned_at);

-- Create user_achievement_progress table for tracking incremental progress
CREATE TABLE IF NOT EXISTS user_achievement_progress (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    achievement_id TEXT NOT NULL,
    current_progress INTEGER DEFAULT 0,
    target_progress INTEGER NOT NULL,
    progress_data JSONB DEFAULT '{}',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT now(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, achievement_id)
);

-- Enable RLS on the new table
ALTER TABLE user_achievement_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_achievement_progress
CREATE POLICY "Users can view own achievement progress" 
    ON user_achievement_progress 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own achievement progress" 
    ON user_achievement_progress 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own achievement progress" 
    ON user_achievement_progress 
    FOR UPDATE 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own achievement progress" 
    ON user_achievement_progress 
    FOR DELETE 
    USING (auth.uid() = user_id);

-- Create weekly_stats table for consistency achievements
CREATE TABLE IF NOT EXISTS user_weekly_stats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    week_start DATE NOT NULL,
    sessions_count INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    days_active INTEGER DEFAULT 0,
    average_duration DECIMAL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, week_start)
);

-- Enable RLS on weekly stats
ALTER TABLE user_weekly_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weekly stats
CREATE POLICY "Users can view own weekly stats" 
    ON user_weekly_stats 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own weekly stats" 
    ON user_weekly_stats 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own weekly stats" 
    ON user_weekly_stats 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create monthly_stats table for performance achievements
CREATE TABLE IF NOT EXISTS user_monthly_stats (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    month_start DATE NOT NULL,
    sessions_count INTEGER DEFAULT 0,
    total_duration INTEGER DEFAULT 0,
    improvement_percentage DECIMAL DEFAULT 0,
    exercises_tried INTEGER DEFAULT 0,
    personal_bests INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE(user_id, month_start)
);

-- Enable RLS on monthly stats
ALTER TABLE user_monthly_stats ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for monthly stats
CREATE POLICY "Users can view own monthly stats" 
    ON user_monthly_stats 
    FOR SELECT 
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own monthly stats" 
    ON user_monthly_stats 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own monthly stats" 
    ON user_monthly_stats 
    FOR UPDATE 
    USING (auth.uid() = user_id);

-- Create function to update weekly stats
CREATE OR REPLACE FUNCTION update_user_weekly_stats()
RETURNS TRIGGER AS $$
DECLARE
    week_start_date DATE;
BEGIN
    -- Calculate the start of the week (Monday)
    week_start_date := date_trunc('week', NEW.completed_at::date);
    
    -- Insert or update weekly stats
    INSERT INTO user_weekly_stats (user_id, week_start, sessions_count, total_duration, days_active)
    VALUES (
        NEW.user_id, 
        week_start_date, 
        1, 
        NEW.duration_seconds,
        1
    )
    ON CONFLICT (user_id, week_start)
    DO UPDATE SET
        sessions_count = user_weekly_stats.sessions_count + 1,
        total_duration = user_weekly_stats.total_duration + NEW.duration_seconds,
        days_active = CASE 
            WHEN NEW.completed_at::date != (
                SELECT MAX(completed_at::date) 
                FROM user_sessions 
                WHERE user_id = NEW.user_id 
                AND date_trunc('week', completed_at::date) = week_start_date
                AND completed_at < NEW.completed_at
            ) THEN user_weekly_stats.days_active + 1
            ELSE user_weekly_stats.days_active
        END,
        average_duration = (user_weekly_stats.total_duration + NEW.duration_seconds) / (user_weekly_stats.sessions_count + 1),
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for weekly stats
DROP TRIGGER IF EXISTS trigger_update_weekly_stats ON user_sessions;
CREATE TRIGGER trigger_update_weekly_stats
    AFTER INSERT ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_weekly_stats();

-- Create function to update monthly stats
CREATE OR REPLACE FUNCTION update_user_monthly_stats()
RETURNS TRIGGER AS $$
DECLARE
    month_start_date DATE;
    exercises_tried_count INTEGER;
BEGIN
    -- Calculate the start of the month
    month_start_date := date_trunc('month', NEW.completed_at::date);
    
    -- Count unique exercises tried this month
    SELECT COUNT(DISTINCT exercise_id) INTO exercises_tried_count
    FROM user_sessions
    WHERE user_id = NEW.user_id
    AND date_trunc('month', completed_at::date) = month_start_date;
    
    -- Insert or update monthly stats
    INSERT INTO user_monthly_stats (user_id, month_start, sessions_count, total_duration, exercises_tried)
    VALUES (
        NEW.user_id, 
        month_start_date, 
        1, 
        NEW.duration_seconds,
        exercises_tried_count
    )
    ON CONFLICT (user_id, month_start)
    DO UPDATE SET
        sessions_count = user_monthly_stats.sessions_count + 1,
        total_duration = user_monthly_stats.total_duration + NEW.duration_seconds,
        exercises_tried = exercises_tried_count,
        updated_at = now();
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for monthly stats
DROP TRIGGER IF EXISTS trigger_update_monthly_stats ON user_sessions;
CREATE TRIGGER trigger_update_monthly_stats
    AFTER INSERT ON user_sessions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_monthly_stats();
