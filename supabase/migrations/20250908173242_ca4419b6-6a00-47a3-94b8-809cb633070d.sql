-- Hook Model Analytics Database Schema
-- Table for tracking complete Trigger→Action→Reward→Investment cycles
CREATE TABLE public.hook_cycle_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  cycle_start_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  cycle_completed_at TIMESTAMP WITH TIME ZONE,
  trigger_type TEXT NOT NULL, -- 'notification', 'reminder', 'social', 'habit'
  trigger_data JSONB DEFAULT '{}',
  action_taken BOOLEAN DEFAULT false,
  action_type TEXT, -- 'workout_started', 'workout_completed', 'goal_set'
  action_duration_seconds INTEGER,
  reward_given TEXT, -- 'xp', 'achievement', 'social_recognition'
  reward_data JSONB DEFAULT '{}',
  investment_actions JSONB DEFAULT '{}', -- customizations, social connections, etc.
  cycle_success_score NUMERIC DEFAULT 0, -- 0-100 score of cycle effectiveness
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for storing what combinations work best per user
CREATE TABLE public.user_success_correlations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  correlation_type TEXT NOT NULL, -- 'trigger_time', 'reward_type', 'message_style'
  correlation_key TEXT NOT NULL, -- specific value like '18:00', 'xp_bonus', 'encouraging'
  success_rate NUMERIC NOT NULL DEFAULT 0, -- 0-100 percentage
  sample_size INTEGER NOT NULL DEFAULT 1,
  confidence_level NUMERIC DEFAULT 0, -- statistical confidence
  last_updated TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, correlation_type, correlation_key)
);

-- Table for tracking user experience obstacles and drop-offs
CREATE TABLE public.friction_point_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  session_id UUID,
  friction_type TEXT NOT NULL, -- 'load_time', 'ui_confusion', 'technical_error'
  friction_location TEXT NOT NULL, -- screen/component where friction occurred
  friction_data JSONB DEFAULT '{}',
  time_to_resolve_seconds INTEGER,
  resolution_method TEXT, -- how user overcame friction
  impact_score INTEGER DEFAULT 1, -- 1-10 severity
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for A/B testing hook model improvements
CREATE TABLE public.optimization_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_name TEXT NOT NULL UNIQUE,
  experiment_type TEXT NOT NULL, -- 'trigger_timing', 'reward_amount', 'message_tone'
  variant_a_config JSONB NOT NULL DEFAULT '{}',
  variant_b_config JSONB NOT NULL DEFAULT '{}',
  start_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_date TIMESTAMP WITH TIME ZONE,
  target_metric TEXT NOT NULL, -- 'hook_completion', 'retention', 'engagement'
  is_active BOOLEAN DEFAULT true,
  results JSONB DEFAULT '{}',
  winner_variant TEXT, -- 'a' or 'b'
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Table for detailed trigger performance tracking
CREATE TABLE public.trigger_effectiveness_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  notification_id UUID,
  trigger_timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  trigger_type TEXT NOT NULL,
  trigger_content TEXT,
  time_of_day INTEGER NOT NULL, -- hour 0-23
  day_of_week INTEGER NOT NULL, -- 0-6
  user_context JSONB DEFAULT '{}', -- current streak, last workout, mood, etc.
  response_action TEXT, -- 'workout_started', 'dismissed', 'ignored'
  response_timestamp TIMESTAMP WITH TIME ZONE,
  response_delay_seconds INTEGER,
  effectiveness_score NUMERIC DEFAULT 0, -- 0-100
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.hook_cycle_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_success_correlations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.friction_point_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.optimization_experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trigger_effectiveness_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hook_cycle_events
CREATE POLICY "Users can view own hook cycles" ON public.hook_cycle_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own hook cycles" ON public.hook_cycle_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own hook cycles" ON public.hook_cycle_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all hook cycles" ON public.hook_cycle_events
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for user_success_correlations
CREATE POLICY "Users can view own success correlations" ON public.user_success_correlations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage success correlations" ON public.user_success_correlations
  FOR ALL USING (true);

CREATE POLICY "Admins can view all success correlations" ON public.user_success_correlations
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for friction_point_logs
CREATE POLICY "Users can view own friction logs" ON public.friction_point_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create friction logs" ON public.friction_point_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all friction logs" ON public.friction_point_logs
  FOR SELECT USING (is_admin(auth.uid()));

-- RLS Policies for optimization_experiments
CREATE POLICY "Admins can manage experiments" ON public.optimization_experiments
  FOR ALL USING (is_admin(auth.uid()));

CREATE POLICY "Users can view active experiments" ON public.optimization_experiments
  FOR SELECT USING (is_active = true);

-- RLS Policies for trigger_effectiveness_logs
CREATE POLICY "Users can view own trigger logs" ON public.trigger_effectiveness_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create trigger logs" ON public.trigger_effectiveness_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all trigger logs" ON public.trigger_effectiveness_logs
  FOR SELECT USING (is_admin(auth.uid()));

-- Add indexes for performance
CREATE INDEX idx_hook_cycle_events_user_id ON public.hook_cycle_events(user_id);
CREATE INDEX idx_hook_cycle_events_cycle_start ON public.hook_cycle_events(cycle_start_at);
CREATE INDEX idx_user_success_correlations_user_type ON public.user_success_correlations(user_id, correlation_type);
CREATE INDEX idx_friction_point_logs_user_location ON public.friction_point_logs(user_id, friction_location);
CREATE INDEX idx_trigger_effectiveness_user_time ON public.trigger_effectiveness_logs(user_id, trigger_timestamp);
CREATE INDEX idx_trigger_effectiveness_time_day ON public.trigger_effectiveness_logs(time_of_day, day_of_week);

-- Add updated_at triggers
CREATE TRIGGER update_user_success_correlations_updated_at
  BEFORE UPDATE ON public.user_success_correlations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();