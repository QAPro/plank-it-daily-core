
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
  | 'priority_support';

export const FEATURE_REQUIREMENTS: Record<FeatureName, SubscriptionTier> = {
  advanced_stats: 'premium',
  smart_recommendations: 'premium',
  social_challenges: 'premium',
  custom_workouts: 'pro',
  priority_support: 'pro',
};
