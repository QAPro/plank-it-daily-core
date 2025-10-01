// Google Analytics 4 utility functions
// TypeScript wrapper for gtag with proper type safety

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

// Event names for Inner Fire app tracking
export const AnalyticsEvents = {
  // User journey
  USER_REGISTERED: 'user_registered',
  USER_LOGIN: 'user_login',
  
  // Workout events
  WORKOUT_STARTED: 'workout_started',
  WORKOUT_COMPLETED: 'workout_completed',
  WORKOUT_ABANDONED: 'workout_abandoned',
  
  // Achievement events
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  STREAK_MILESTONE: 'streak_milestone',
  PERSONAL_RECORD: 'personal_record',
  
  // Engagement
  PWA_INSTALLED: 'pwa_installed',
  SOCIAL_SHARE: 'social_share',
  FEATURE_USED: 'feature_used',
  
  // Navigation
  PAGE_VIEW: 'page_view',
} as const;

export type AnalyticsEventName = typeof AnalyticsEvents[keyof typeof AnalyticsEvents];

interface EventParams {
  [key: string]: any;
}

/**
 * Send a custom event to Google Analytics
 */
export const trackEvent = (
  eventName: AnalyticsEventName | string,
  params?: EventParams
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, params);
  }
};

/**
 * Track page views (for SPA navigation)
 */
export const trackPageView = (path: string, title?: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-LJ1EWTY29V', {
      page_path: path,
      page_title: title,
    });
  }
};

/**
 * Set user properties
 */
export const setUserProperties = (properties: EventParams): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('set', 'user_properties', properties);
  }
};

/**
 * Track workout completion with detailed metrics
 */
export const trackWorkoutCompletion = (
  exerciseName: string,
  duration: number,
  difficulty: number
): void => {
  trackEvent(AnalyticsEvents.WORKOUT_COMPLETED, {
    exercise_name: exerciseName,
    duration_seconds: duration,
    difficulty_level: difficulty,
    value: duration, // Use duration as the event value
  });
};

/**
 * Track achievement unlocks
 */
export const trackAchievement = (
  achievementName: string,
  achievementType: string
): void => {
  trackEvent(AnalyticsEvents.ACHIEVEMENT_UNLOCKED, {
    achievement_name: achievementName,
    achievement_type: achievementType,
  });
};

/**
 * Track PWA installation
 */
export const trackPWAInstall = (): void => {
  trackEvent(AnalyticsEvents.PWA_INSTALLED);
};

/**
 * Track social sharing
 */
export const trackSocialShare = (platform: string, contentType: string): void => {
  trackEvent(AnalyticsEvents.SOCIAL_SHARE, {
    platform,
    content_type: contentType,
  });
};

/**
 * Set user ID for cross-device tracking
 */
export const setUserId = (userId: string): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-LJ1EWTY29V', {
      user_id: userId,
    });
  }
};

/**
 * Consent management for GDPR compliance
 */
export const updateConsent = (
  analytics: boolean = true,
  advertising: boolean = false
): void => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'update', {
      analytics_storage: analytics ? 'granted' : 'denied',
      ad_storage: advertising ? 'granted' : 'denied',
    });
  }
};
