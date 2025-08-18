
import { supabase } from "@/integrations/supabase/client";

export interface RegistrationTrend {
  date: string;
  new_users: number;
  cumulative_users: number;
}

export interface ActiveUsersMetric {
  metric_type: string;
  metric_value: number;
  period_label: string;
}

export interface FeatureFlagAnalytics {
  feature_name: string;
  total_evaluations: number;
  enabled_evaluations: number;
  adoption_rate: number;
  unique_users: number;
}

export interface WorkoutCompletionAnalytics {
  exercise_name: string;
  total_attempts: number;
  avg_duration: number;
  completion_rate: number;
  popularity_rank: number;
}

export interface UserEngagementSummary {
  total_users: number;
  active_today: number;
  active_this_week: number;
  avg_sessions_per_user: number;
  avg_session_duration: number;
  total_sessions: number;
}

export interface AdminActivitySummary {
  action_type: string;
  action_count: number;
  last_action_at: string;
}

// New analytics types
export interface RetentionCohort {
  cohort_month: string;
  cohort_size: number;
  week_1_retention: number;
  week_2_retention: number;
  week_4_retention: number;
  week_8_retention: number;
  week_12_retention: number;
}

export interface OnboardingAnalyticsRow {
  step_name: string;
  total_users: number;
  completed_users: number;
  completion_rate: number;
  avg_time_to_complete: number;
  drop_off_rate: number;
}

export interface DevicePlatformAnalyticsRow {
  platform_type: string;
  device_category: string;
  user_count: number;
  session_count: number;
  avg_session_duration: number;
  bounce_rate: number;
}

export const getUserRegistrationTrends = async (daysBack = 30): Promise<RegistrationTrend[]> => {
  const { data, error } = await supabase.rpc("get_user_registration_trends", { days_back: daysBack });
  if (error) throw error;
  return (data ?? []) as RegistrationTrend[];
};

export const getActiveUsersMetrics = async (): Promise<ActiveUsersMetric[]> => {
  const { data, error } = await supabase.rpc("get_active_users_metrics");
  if (error) throw error;
  return (data ?? []) as ActiveUsersMetric[];
};

export const getFeatureFlagAnalytics = async (): Promise<FeatureFlagAnalytics[]> => {
  const { data, error } = await supabase.rpc("get_feature_flag_analytics");
  if (error) throw error;
  return (data ?? []) as FeatureFlagAnalytics[];
};

export const getWorkoutCompletionAnalytics = async (daysBack = 30): Promise<WorkoutCompletionAnalytics[]> => {
  const { data, error } = await supabase.rpc("get_workout_completion_analytics", { days_back: daysBack });
  if (error) throw error;
  return (data ?? []) as WorkoutCompletionAnalytics[];
};

export const getUserEngagementSummary = async (): Promise<UserEngagementSummary | null> => {
  const { data, error } = await supabase.rpc("get_user_engagement_summary");
  if (error) throw error;
  const arr = (data ?? []) as UserEngagementSummary[];
  return arr.length > 0 ? arr[0] : null;
};

export const getAdminActivitySummary = async (daysBack = 7): Promise<AdminActivitySummary[]> => {
  const { data, error } = await supabase.rpc("get_admin_activity_summary", { days_back: daysBack });
  if (error) throw error;
  return (data ?? []) as AdminActivitySummary[];
};

// New RPC wrappers
export const getUserRetentionCohorts = async (monthsBack = 6): Promise<RetentionCohort[]> => {
  const { data, error } = await supabase.rpc("get_user_retention_cohorts", { months_back: monthsBack });
  if (error) throw error;
  return (data ?? []) as RetentionCohort[];
};

export const getOnboardingAnalytics = async (daysBack = 30): Promise<OnboardingAnalyticsRow[]> => {
  const { data, error } = await supabase.rpc("get_onboarding_analytics", { days_back: daysBack });
  if (error) throw error;
  return (data ?? []) as OnboardingAnalyticsRow[];
};

export const getDevicePlatformAnalytics = async (daysBack = 30): Promise<DevicePlatformAnalyticsRow[]> => {
  const { data, error } = await supabase.rpc("get_device_platform_analytics", { days_back: daysBack });
  if (error) throw error;
  return (data ?? []) as DevicePlatformAnalyticsRow[];
};
