
export type FeatureCategory = 
  | 'core_features'
  | 'social_features' 
  | 'premium_features'
  | 'admin_features'
  | 'beta_features'
  | 'analytics_features'
  | 'ui_features';

export interface FeatureCatalogItem {
  name: string;
  displayName: string;
  description: string;
  category: FeatureCategory;
  defaultAudience: string;
  defaultRolloutPercentage: number;
  dependencies?: string[];
  isTemplate?: boolean;
}

export const FEATURE_CATEGORIES: Record<FeatureCategory, { label: string; icon: string }> = {
  core_features: { label: 'Core Features', icon: '⚡' },
  social_features: { label: 'Social Features', icon: '👥' },
  premium_features: { label: 'Premium Features', icon: '💎' },
  admin_features: { label: 'Admin Features', icon: '🔧' },
  beta_features: { label: 'Beta Features', icon: '🧪' },
  analytics_features: { label: 'Analytics Features', icon: '📊' },
  ui_features: { label: 'UI Features', icon: '🎨' },
};

export const FEATURE_CATALOG: FeatureCatalogItem[] = [
  // Core Features
  {
    name: 'advanced_stats',
    displayName: 'Advanced Statistics',
    description: 'Detailed performance analytics and insights for users',
    category: 'core_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'smart_recommendations',
    displayName: 'Smart Recommendations',
    description: 'AI-powered workout recommendations based on user performance',
    category: 'core_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 80,
  },
  {
    name: 'custom_workouts',
    displayName: 'Custom Workouts',
    description: 'Allow users to create and customize their own workout routines',
    category: 'core_features',
    defaultAudience: 'pro',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'priority_support',
    displayName: 'Priority Support',
    description: 'Enhanced customer support for premium users',
    category: 'core_features',
    defaultAudience: 'pro',
    defaultRolloutPercentage: 100,
  },

  // Social Features
  {
    name: 'social_challenges',
    displayName: 'Social Challenges',
    description: 'Community-driven challenges and competitions',
    category: 'social_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 90,
  },
  {
    name: 'friend_system',
    displayName: 'Friend System',
    description: 'Add friends and share workout achievements',
    category: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'activity_feed',
    displayName: 'Activity Feed',
    description: 'View friend activities and social interactions',
    category: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'basic_social_sharing',
    displayName: 'Basic Social Sharing',
    description: 'Share achievements on social media platforms',
    category: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'workout_posting',
    displayName: 'Workout Posting',
    description: 'Post workout completions to activity feed',
    category: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'league_sharing',
    displayName: 'League Sharing',
    description: 'Share league and competition results with special graphics',
    category: 'social_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 90,
  },
  {
    name: 'competition_graphics',
    displayName: 'Competition Graphics',
    description: 'Enhanced sharing templates for competitions',
    category: 'social_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 90,
  },
  {
    name: 'leaderboards',
    displayName: 'Leaderboards',
    description: 'Competitive rankings and achievements',
    category: 'social_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 85,
  },

  // Premium Features
  {
    name: 'premium_exercises',
    displayName: 'Premium Exercise Library',
    description: 'Access to advanced and specialized exercises',
    category: 'premium_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'offline_mode',
    displayName: 'Offline Mode',
    description: 'Download workouts for offline use',
    category: 'premium_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 75,
  },
  {
    name: 'personal_trainer_ai',
    displayName: 'AI Personal Trainer',
    description: 'Advanced AI coaching and form correction',
    category: 'premium_features',
    defaultAudience: 'pro',
    defaultRolloutPercentage: 60,
  },

  // Admin Features
  {
    name: 'admin_dashboard',
    displayName: 'Admin Dashboard',
    description: 'Administrative interface for app management',
    category: 'admin_features',
    defaultAudience: 'admin',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'user_management',
    displayName: 'User Management',
    description: 'Manage user accounts and permissions',
    category: 'admin_features',
    defaultAudience: 'admin',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'analytics_dashboard',
    displayName: 'Analytics Dashboard',
    description: 'Advanced analytics and reporting tools',
    category: 'admin_features',
    defaultAudience: 'admin',
    defaultRolloutPercentage: 100,
  },

  // Beta Features
  {
    name: 'new_ui_design',
    displayName: 'New UI Design',
    description: 'Updated user interface with modern design',
    category: 'beta_features',
    defaultAudience: 'beta',
    defaultRolloutPercentage: 30,
  },
  {
    name: 'voice_commands',
    displayName: 'Voice Commands',
    description: 'Control workouts using voice commands',
    category: 'beta_features',
    defaultAudience: 'beta',
    defaultRolloutPercentage: 20,
  },
  {
    name: 'ar_workout_mode',
    displayName: 'AR Workout Mode',
    description: 'Augmented reality workout experience',
    category: 'beta_features',
    defaultAudience: 'beta',
    defaultRolloutPercentage: 10,
  },

  // Analytics Features
  {
    name: 'detailed_performance_tracking',
    displayName: 'Detailed Performance Tracking',
    description: 'Advanced metrics and performance analysis',
    category: 'analytics_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 90,
  },
  {
    name: 'goal_tracking',
    displayName: 'Goal Tracking',
    description: 'Set and track fitness goals with progress insights',
    category: 'analytics_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },

  // UI Features
  {
    name: 'dark_mode',
    displayName: 'Dark Mode',
    description: 'Dark theme option for better viewing experience',
    category: 'ui_features',
    defaultAudience: 'all',
    defaultRolloutPercentage: 100,
  },
  {
    name: 'custom_themes',
    displayName: 'Custom Themes',
    description: 'Personalized color themes and customization',
    category: 'ui_features',
    defaultAudience: 'premium',
    defaultRolloutPercentage: 80,
  },
];

export const getFeaturesByCategory = (category: FeatureCategory) => 
  FEATURE_CATALOG.filter(feature => feature.category === category);

export const getFeatureByName = (name: string) =>
  FEATURE_CATALOG.find(feature => feature.name === name);

export const getAllFeatureNames = () =>
  FEATURE_CATALOG.map(feature => feature.name);
