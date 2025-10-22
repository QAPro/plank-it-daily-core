export type FeatureCategory = 
  | 'ai_features'
  | 'social_features'
  | 'analytics_features'
  | 'premium_features'
  | 'ui_features'
  | 'competition_features';

export interface GranularFeatureCatalogItem {
  name: string;
  displayName: string;
  description: string;
  category: FeatureCategory;
  parentFeatureName?: string;
  defaultAudience: string;
  defaultRolloutPercentage: number;
  componentPath?: string;
  dependencies?: string[];
  uiComponents?: string[];
}

import { Brain, Users, BarChart3, Crown, Palette, Trophy } from 'lucide-react';

export const GRANULAR_FEATURE_CATEGORIES: Record<FeatureCategory, { label: string; icon: any; color: string }> = {
  ai_features: { label: 'AI Features', icon: Brain, color: 'text-blue-600' },
  social_features: { label: 'Social Features', icon: Users, color: 'text-green-600' },
  analytics_features: { label: 'Analytics Features', icon: BarChart3, color: 'text-orange-600' },
  premium_features: { label: 'Premium Features', icon: Crown, color: 'text-yellow-600' },
  ui_features: { label: 'UI Features', icon: Palette, color: 'text-pink-600' },
  competition_features: { label: 'Competition Features', icon: Trophy, color: 'text-red-600' },
};

export const GRANULAR_FEATURE_CATALOG: GranularFeatureCatalogItem[] = [
  // AI Features
  {
    name: 'ai_features',
    displayName: 'AI Features',
    description: 'All AI-powered features and coaching',
    category: 'ai_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'coaching_overlay',
    displayName: 'AI Coaching Overlay',
    description: 'AI coaching messages during workouts',
    category: 'ai_features',
    parentFeatureName: 'ai_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 90,
    componentPath: 'src/components/timer/CoachingOverlay.tsx',
  },
  {
    name: 'smart_recommendations',
    displayName: 'Smart Recommendations',
    description: 'AI-powered workout recommendations',
    category: 'ai_features',
    parentFeatureName: 'ai_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 85,
  },
  {
    name: 'form_analysis',
    displayName: 'Form Analysis',
    description: 'AI form correction and analysis',
    category: 'ai_features',
    parentFeatureName: 'ai_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 70,
  },
  {
    name: 'ai_insights',
    displayName: 'AI Performance Insights',
    description: 'AI-generated performance insights',
    category: 'ai_features',
    parentFeatureName: 'ai_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 80,
  },

  // Social Features
  {
    name: 'social_features',
    displayName: 'Social Features',
    description: 'All social and community features',
    category: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'friend_system',
    displayName: 'Friend System',
    description: 'Add and manage friends',
    category: 'social_features',
    parentFeatureName: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'activity_feed',
    displayName: 'Activity Feed',
    description: 'View friends activity updates',
    category: 'social_features',
    parentFeatureName: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 95,
  },
  {
    name: 'workout_posting',
    displayName: 'Workout Posting',
    description: 'Post workout completions to feed',
    category: 'social_features',
    parentFeatureName: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 90,
  },
  {
    name: 'friend_reactions',
    displayName: 'Friend Reactions',
    description: 'React to friends activities',
    category: 'social_features',
    parentFeatureName: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 85,
  },
  {
    name: 'activity_comments',
    displayName: 'Activity Comments',
    description: 'Comment on friends activities',
    category: 'social_features',
    parentFeatureName: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 80,
  },

  // Competition Features
  {
    name: 'competition_features',
    displayName: 'Competition Features',
    description: 'All competitive and challenge features',
    category: 'competition_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'social_challenges',
    displayName: 'Social Challenges',
    description: 'Community challenges and competitions',
    category: 'competition_features',
    parentFeatureName: 'competition_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 90,
  },
  {
    name: 'leaderboards',
    displayName: 'Leaderboards',
    description: 'Global and friend leaderboards',
    category: 'competition_features',
    parentFeatureName: 'competition_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 85,
  },
  {
    name: 'league_sharing',
    displayName: 'League Sharing',
    description: 'Share league results with graphics',
    category: 'competition_features',
    parentFeatureName: 'competition_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 80,
  },
  {
    name: 'tournaments',
    displayName: 'Tournaments',
    description: 'Structured tournament competitions',
    category: 'competition_features',
    parentFeatureName: 'competition_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 70,
  },

  // Analytics Features
  {
    name: 'analytics_features',
    displayName: 'Analytics Features',
    description: 'All analytics and tracking features',
    category: 'analytics_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'advanced_stats',
    displayName: 'Advanced Statistics',
    description: 'Detailed performance statistics',
    category: 'analytics_features',
    parentFeatureName: 'analytics_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'goal_tracking',
    displayName: 'Goal Tracking',
    description: 'Set and track fitness goals',
    category: 'analytics_features',
    parentFeatureName: 'analytics_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 95,
  },
  {
    name: 'progress_charts',
    displayName: 'Progress Charts',
    description: 'Visual progress tracking charts',
    category: 'analytics_features',
    parentFeatureName: 'analytics_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 90,
  },
  {
    name: 'performance_insights',
    displayName: 'Performance Insights',
    description: 'Detailed performance analysis',
    category: 'analytics_features',
    parentFeatureName: 'analytics_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 85,
  },

  // UI Features
  {
    name: 'ui_features',
    displayName: 'UI Features',
    description: 'All user interface enhancements',
    category: 'ui_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'timer_tips',
    displayName: 'Timer Tips',
    description: 'Helpful tips during timer workouts',
    category: 'ui_features',
    parentFeatureName: 'ui_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
    componentPath: 'src/components/timer/TimerTips.tsx',
  },
  {
    name: 'dark_mode',
    displayName: 'Dark Mode',
    description: 'Dark theme interface',
    category: 'ui_features',
    parentFeatureName: 'ui_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'custom_themes',
    displayName: 'Custom Themes',
    description: 'Personalized color themes',
    category: 'ui_features',
    parentFeatureName: 'ui_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 80,
  },
  {
    name: 'animated_transitions',
    displayName: 'Animated Transitions',
    description: 'Smooth UI animations',
    category: 'ui_features',
    parentFeatureName: 'ui_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 90,
  },

  // Premium Features
  {
    name: 'premium_features',
    displayName: 'Premium Features',
    description: 'All premium-tier features',
    category: 'premium_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'custom_workouts',
    displayName: 'Custom Workouts',
    description: 'Create custom workout routines',
    category: 'premium_features',
    parentFeatureName: 'premium_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'offline_mode',
    displayName: 'Offline Mode',
    description: 'Download workouts for offline use',
    category: 'premium_features',
    parentFeatureName: 'premium_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 75,
  },
  {
    name: 'priority_support',
    displayName: 'Priority Support',
    description: 'Enhanced customer support',
    category: 'premium_features',
    parentFeatureName: 'premium_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'export_data',
    displayName: 'Data Export',
    description: 'Export workout and progress data',
    category: 'premium_features',
    parentFeatureName: 'premium_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 85,
  },
];

export const getGranularFeaturesByCategory = (category: FeatureCategory) => 
  GRANULAR_FEATURE_CATALOG.filter(feature => feature.category === category);

export const getGranularFeatureByName = (name: string) =>
  GRANULAR_FEATURE_CATALOG.find(feature => feature.name === name);

export const getGranularParentFeatures = () =>
  GRANULAR_FEATURE_CATALOG.filter(feature => !feature.parentFeatureName);

export const getGranularChildFeatures = (parentName: string) =>
  GRANULAR_FEATURE_CATALOG.filter(feature => feature.parentFeatureName === parentName);

export const getAllGranularFeatureNames = () =>
  GRANULAR_FEATURE_CATALOG.map(feature => feature.name);