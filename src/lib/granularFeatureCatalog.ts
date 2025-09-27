/**
 * Granular Feature Catalog
 * Complete mapping of all surgical feature flags implemented across the application
 */

export interface GranularFeature {
  name: string;
  description: string;
  category: 'core' | 'ui' | 'social' | 'analytics' | 'audio' | 'data' | 'navigation' | 'premium';
  components: string[];
  dependencies?: string[];
  impact: 'high' | 'medium' | 'low';
}

export const GRANULAR_FEATURE_CATALOG: Record<string, GranularFeature> = {
  // === CORE FEATURES ===
  main_dashboard: {
    name: "Main Dashboard",
    description: "Primary application dashboard with tab management",
    category: "core",
    components: ["Dashboard"],
    impact: "high"
  },
  plank_timer: {
    name: "Plank Timer",
    description: "Core timer functionality for plank exercises",
    category: "core", 
    components: ["PlankTimer"],
    impact: "high"
  },
  timer_setup: {
    name: "Timer Setup",
    description: "Timer configuration and preset selection interface",
    category: "core",
    components: ["TimerSetup"],
    impact: "high"
  },
  session_celebration: {
    name: "Session Completion Celebration",
    description: "Post-workout celebration and achievement display",
    category: "core",
    components: ["SessionCompletionCelebration"],
    impact: "medium"
  },
  achievement_notifications: {
    name: "Achievement Notifications",
    description: "Pop-up notifications when achievements are unlocked",
    category: "core",
    components: ["AchievementNotification"],
    impact: "medium"
  },

  // === UI & NAVIGATION ===
  mobile_navigation: {
    name: "Mobile Bottom Navigation",
    description: "Mobile-specific bottom navigation bar",
    category: "navigation",
    components: ["MobileBottomNav"],
    impact: "high"
  },
  desktop_navigation: {
    name: "Desktop Tab Navigation",
    description: "Desktop tab navigation system",
    category: "navigation", 
    components: ["TabNavigation"],
    impact: "high"
  },
  exercise_cards: {
    name: "Exercise Cards",
    description: "Basic exercise display cards",
    category: "ui",
    components: ["ExerciseCard"],
    impact: "medium"
  },
  enhanced_exercise_cards: {
    name: "Enhanced Exercise Cards",
    description: "Advanced exercise cards with performance data and recommendations",
    category: "ui",
    components: ["EnhancedExerciseCard"],
    dependencies: ["exercise_cards"],
    impact: "medium"
  },
  exercise_filters: {
    name: "Exercise Filtering System",
    description: "Advanced filtering and search for exercises",
    category: "ui",
    components: ["ExerciseFilters"],
    impact: "medium"
  },

  // === ANALYTICS & TRACKING ===
  stats_dashboard: {
    name: "Statistics Dashboard",
    description: "User performance statistics and metrics",
    category: "analytics",
    components: ["StatsDashboard"],
    impact: "medium"
  },
  advanced_analytics: {
    name: "Advanced Analytics Dashboard",
    description: "Detailed user analytics and performance insights",
    category: "analytics",
    components: ["UserAnalyticsDashboard"],
    dependencies: ["stats_dashboard"],
    impact: "low"
  },
  progress_charts: {
    name: "Progress Charts",
    description: "Visual progress tracking charts and graphs",
    category: "analytics",
    components: ["PerformanceTrendChart", "WeeklyProgressChart"],
    dependencies: ["stats_dashboard"],
    impact: "medium"
  },
  session_history: {
    name: "Session History",
    description: "Historical workout session tracking and display",
    category: "analytics",
    components: ["SessionHistory"],
    impact: "medium"
  },

  // === ACHIEVEMENTS & GAMIFICATION ===
  achievements_gallery: {
    name: "Achievements Gallery",
    description: "Basic achievements display and management",
    category: "core",
    components: ["AchievementsGallery"],
    impact: "medium"
  },
  enhanced_achievements_gallery: {
    name: "Enhanced Achievements Gallery",
    description: "Advanced achievements with search, categories, and enhanced UI",
    category: "premium",
    components: ["EnhancedAchievementsGallery"],
    dependencies: ["achievements_gallery"],
    impact: "low"
  },
  streak_tracking: {
    name: "Streak Display",
    description: "Workout streak tracking and motivation",
    category: "core",
    components: ["StreakDisplay"],
    impact: "medium"
  },
  streak_milestones: {
    name: "Streak Milestones",
    description: "Special celebrations for streak achievements",
    category: "premium",
    components: ["StreakMilestone"],
    dependencies: ["streak_tracking"],
    impact: "low"
  },

  // === SOCIAL FEATURES ===
  social_sharing: {
    name: "Social Sharing",
    description: "Share achievements and progress on social platforms",
    category: "social",
    components: ["SocialShareButtons", "EnhancedSocialShareButtons"],
    impact: "low"
  },
  friend_system: {
    name: "Friends System",
    description: "User connections and friend management",
    category: "social",
    components: ["FriendsList"],
    impact: "low"
  },
  friend_search: {
    name: "Friend Search",
    description: "Search and discover other users to connect with",
    category: "social",
    components: ["FriendSearch"],
    dependencies: ["friend_system"],
    impact: "low"
  },
  activity_feed: {
    name: "Activity Feed",
    description: "Social activity stream from friends",
    category: "social", 
    components: ["FriendActivityFeed"],
    dependencies: ["friend_system"],
    impact: "low"
  },
  competition_features: {
    name: "Competition Features",
    description: "Competitive workout features and challenges",
    category: "social",
    components: ["CompeteTab"],
    impact: "low"
  },
  leaderboards: {
    name: "Challenge Leaderboards",
    description: "Competitive ranking displays",
    category: "social",
    components: ["ChallengeLeaderboard"],
    dependencies: ["competition_features"],
    impact: "low"
  },

  // === AUDIO & MULTIMEDIA ===
  background_music_player: {
    name: "Background Music Player",
    description: "Workout background music and audio controls",
    category: "audio",
    components: ["BackgroundMusicPlayer"],
    impact: "low"
  },
  victory_playlists: {
    name: "Victory Playlist Manager",
    description: "Custom playlist management for workout completion",
    category: "audio",
    components: ["VictoryPlaylistManager"],
    dependencies: ["background_music_player"],
    impact: "low"
  },

  // === COACHING & GUIDANCE ===
  timer_tips: {
    name: "Timer Tips",
    description: "Contextual tips during workout sessions",
    category: "ui",
    components: ["TimerTips"],
    impact: "low"
  },
  coaching_overlay: {
    name: "Coaching Overlay",
    description: "Real-time coaching messages and guidance",
    category: "premium",
    components: ["CoachingOverlay"],
    dependencies: ["timer_tips"],
    impact: "low"
  },
  recommendations_dashboard: {
    name: "Recommendations Dashboard",
    description: "Personalized workout recommendations",
    category: "premium",
    components: ["RecommendationsDashboard"],
    impact: "medium"
  },
  predictive_recommendations: {
    name: "Predictive Quick Start",
    description: "AI-powered workout predictions and quick start",
    category: "premium",
    components: ["PredictiveQuickStart"],
    dependencies: ["recommendations_dashboard"],
    impact: "low"
  },

  // === CUSTOMIZATION & SETTINGS ===
  custom_workouts: {
    name: "Custom Workout Manager",
    description: "User-created custom workout routines",
    category: "premium",
    components: ["CustomWorkoutManager"],
    impact: "medium"
  },
  weekly_goal_settings: {
    name: "Weekly Goal Settings",
    description: "Personal goal setting and management",
    category: "ui",
    components: ["WeeklyGoalSettings"],
    impact: "low"
  },

  // === DATA & EXPORT ===
  export_data: {
    name: "Data Export",
    description: "Export user data and workout history",
    category: "data",
    components: ["DataPortabilityHelper"],
    impact: "low"
  }
};

// Helper functions for feature management
export const getFeaturesByCategory = (category: string) => {
  return Object.entries(GRANULAR_FEATURE_CATALOG)
    .filter(([_, feature]) => feature.category === category)
    .reduce((acc, [key, feature]) => ({ ...acc, [key]: feature }), {});
};

export const getFeatureDependencies = (featureName: string): string[] => {
  const feature = GRANULAR_FEATURE_CATALOG[featureName];
  return feature?.dependencies || [];
};

export const getFeatureComponents = (featureName: string): string[] => {
  const feature = GRANULAR_FEATURE_CATALOG[featureName];
  return feature?.components || [];
};

export const getAllFeatureNames = (): string[] => {
  return Object.keys(GRANULAR_FEATURE_CATALOG);
};

export const getHighImpactFeatures = (): string[] => {
  return Object.entries(GRANULAR_FEATURE_CATALOG)
    .filter(([_, feature]) => feature.impact === 'high')
    .map(([name, _]) => name);
};

// Feature validation
export const validateFeatureDependencies = (enabledFeatures: string[]): { valid: boolean; issues: string[] } => {
  const issues: string[] = [];
  
  for (const featureName of enabledFeatures) {
    const dependencies = getFeatureDependencies(featureName);
    for (const dependency of dependencies) {
      if (!enabledFeatures.includes(dependency)) {
        issues.push(`Feature '${featureName}' requires '${dependency}' to be enabled`);
      }
    }
  }
  
  return {
    valid: issues.length === 0,
    issues
  };
};