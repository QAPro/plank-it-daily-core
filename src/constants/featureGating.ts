
export type SubscriptionTier = 'free' | 'premium' | 'pro';

export const TIER_ORDER: SubscriptionTier[] = ['free', 'premium', 'pro'];

export const isTierAtLeast = (current: SubscriptionTier, required: SubscriptionTier) => {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required);
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
  | 'ai_recommendations';

export const FEATURE_REQUIREMENTS: Record<FeatureName, SubscriptionTier> = {
  advanced_stats: 'premium',
  smart_recommendations: 'premium',
  social_challenges: 'premium',
  custom_workouts: 'pro',
  priority_support: 'pro',
  analytics_dashboard: 'premium',
  detailed_performance_tracking: 'premium',
  goal_tracking: 'premium',
  ai_recommendations: 'premium',
};
