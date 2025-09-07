
export type SubscriptionTier = 'free' | 'premium';

export const TIER_ORDER: SubscriptionTier[] = ['free', 'premium'];

export const isTierAtLeast = (current: SubscriptionTier, required: SubscriptionTier) => {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required);
};

// Check if AI features are enabled via environment variable
export const isAIEnabled = () => {
  return import.meta.env.VITE_ENABLE_AI_FEATURES === 'true';
};

// Check if social features are enabled via environment variable
export const isSocialEnabled = () => {
  return import.meta.env.VITE_ENABLE_SOCIAL_FEATURES === 'true';
};

// Define feature names and which tier is required for each
export type FeatureName =
  | 'advanced_stats'
  | 'smart_recommendations'
  | 'social_challenges'
  | 'custom_workouts'
  | 'priority_support'
  | 'analytics_dashboard'
  | 'detailed_performance_tracking'
  | 'goal_tracking'
  | 'ai_recommendations'
  | 'friend_system'
  | 'activity_feed'
  | 'basic_social_sharing'
  | 'workout_posting'
  | 'league_sharing'
  | 'competition_graphics';

export const FEATURE_REQUIREMENTS: Record<FeatureName, SubscriptionTier> = {
  advanced_stats: 'premium',
  smart_recommendations: 'premium',
  social_challenges: 'premium',
  custom_workouts: 'premium',
  priority_support: 'premium',
  analytics_dashboard: 'premium',
  detailed_performance_tracking: 'premium',
  goal_tracking: 'premium',
  ai_recommendations: 'premium',
  friend_system: 'free',
  activity_feed: 'free',  
  basic_social_sharing: 'free',
  workout_posting: 'free',
  league_sharing: 'premium',
  competition_graphics: 'premium',
};

// AI-related features that should be disabled when AI is off
export const AI_FEATURES: FeatureName[] = [
  'advanced_stats',
  'smart_recommendations',
  'analytics_dashboard',
  'ai_recommendations',
];

// Social-related features that should be disabled when social is off
export const SOCIAL_FEATURES: FeatureName[] = [
  'social_challenges',
  'friend_system',
  'activity_feed',
  'basic_social_sharing',
  'workout_posting',
  'league_sharing',
  'competition_graphics',
];
