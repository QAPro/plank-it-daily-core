
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socialActivityManager } from '@/services/socialActivityService';
import { isSocialEnabled } from '@/constants/featureGating';
import { usePrivacySettings } from './usePrivacySettings';

export const useFriendActivityTracking = () => {
  const { user } = useAuth();
  const socialEnabled = isSocialEnabled();
  const { privacySettings } = usePrivacySettings();

  const trackWorkoutActivity = useCallback(async (sessionData: any) => {
    if (!user || !socialEnabled || !privacySettings) return;
    
    // Don't create activity if user has private activity visibility
    if (privacySettings.activity_visibility === 'private') {
      console.log('Activity not shared due to privacy settings');
      return;
    }
    
    try {
      console.log('Tracking workout activity:', sessionData);
      const visibility = privacySettings.activity_visibility === 'public' ? 'public' : 'friends';
      await socialActivityManager.createWorkoutActivity(user.id, sessionData, visibility);
    } catch (error) {
      console.error('Error tracking workout activity:', error);
    }
  }, [user, socialEnabled, privacySettings]);

  const trackAchievementActivity = useCallback(async (achievementData: any) => {
    if (!user || !socialEnabled || !privacySettings) return;

    // Don't create activity if user has private activity visibility or achievements hidden
    if (privacySettings.activity_visibility === 'private' || !privacySettings.show_achievements) {
      console.log('Activity not shared due to privacy settings');
      return;
    }

    try {
      console.log('Tracking achievement activity:', achievementData);
      const visibility = privacySettings.activity_visibility === 'public' ? 'public' : 'friends';
      await socialActivityManager.createAchievementActivity(user.id, achievementData, visibility);
    } catch (error) {
      console.error('Error tracking achievement activity:', error);
    }
  }, [user, socialEnabled, privacySettings]);

  const trackLevelUpActivity = useCallback(async (levelData: any) => {
    if (!user || !socialEnabled || !privacySettings) return;

    // Don't create activity if user has private activity visibility
    if (privacySettings.activity_visibility === 'private') {
      console.log('Activity not shared due to privacy settings');
      return;
    }

    try {
      console.log('Tracking level up activity:', levelData);
      const visibility = privacySettings.activity_visibility === 'public' ? 'public' : 'friends';
      await socialActivityManager.createLevelUpActivity(user.id, levelData, visibility);
    } catch (error) {
      console.error('Error tracking level up activity:', error);
    }
  }, [user, socialEnabled, privacySettings]);

  const trackStreakMilestoneActivity = useCallback(async (streakData: any) => {
    if (!user || !socialEnabled || !privacySettings) return;

    // Don't create activity if user has private activity visibility or streak hidden
    if (privacySettings.activity_visibility === 'private' || !privacySettings.show_streak) {
      console.log('Activity not shared due to privacy settings');
      return;
    }

    // Only track milestone streaks (every 7 days)
    if (streakData.streak_length % 7 === 0 && streakData.streak_length >= 7) {
      try {
        console.log('Tracking streak milestone activity:', streakData);
        const visibility = privacySettings.activity_visibility === 'public' ? 'public' : 'friends';
        await socialActivityManager.createStreakMilestoneActivity(user.id, streakData, visibility);
      } catch (error) {
        console.error('Error tracking streak milestone activity:', error);
      }
    }
  }, [user, socialEnabled, privacySettings]);

  const trackPersonalBestActivity = useCallback(async (exerciseId: string, newBest: number, previousBest: number) => {
    if (!user || !socialEnabled || !privacySettings) return;

    // Don't create activity if user has private activity visibility or statistics hidden
    if (privacySettings.activity_visibility === 'private' || !privacySettings.show_statistics) {
      console.log('Activity not shared due to privacy settings');
      return;
    }

    try {
      console.log('Tracking personal best activity:', { exerciseId, newBest, previousBest });
      const visibility = privacySettings.activity_visibility === 'public' ? 'public' : 'friends';
      await socialActivityManager.createPersonalBestActivity(user.id, exerciseId, newBest, previousBest, visibility);
    } catch (error) {
      console.error('Error tracking personal best activity:', error);
    }
  }, [user, socialEnabled, privacySettings]);

  return {
    trackWorkoutActivity,
    trackAchievementActivity,
    trackLevelUpActivity,
    trackStreakMilestoneActivity,
    trackPersonalBestActivity
  };
};
