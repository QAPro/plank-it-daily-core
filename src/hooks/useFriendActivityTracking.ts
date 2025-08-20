
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socialActivityManager } from '@/services/socialActivityService';
import { isSocialEnabled } from '@/constants/featureGating';

export const useFriendActivityTracking = () => {
  const { user } = useAuth();
  const socialEnabled = isSocialEnabled();

  const trackWorkoutActivity = useCallback(async (sessionData: any) => {
    if (!user || !socialEnabled) return;
    
    try {
      console.log('Tracking workout activity:', sessionData);
      await socialActivityManager.createWorkoutActivity(user.id, sessionData);
    } catch (error) {
      console.error('Error tracking workout activity:', error);
    }
  }, [user, socialEnabled]);

  const trackAchievementActivity = useCallback(async (achievementData: any) => {
    if (!user || !socialEnabled) return;

    try {
      console.log('Tracking achievement activity:', achievementData);
      await socialActivityManager.createAchievementActivity(user.id, achievementData);
    } catch (error) {
      console.error('Error tracking achievement activity:', error);
    }
  }, [user, socialEnabled]);

  const trackLevelUpActivity = useCallback(async (levelData: any) => {
    if (!user || !socialEnabled) return;

    try {
      console.log('Tracking level up activity:', levelData);
      await socialActivityManager.createLevelUpActivity(user.id, levelData);
    } catch (error) {
      console.error('Error tracking level up activity:', error);
    }
  }, [user, socialEnabled]);

  const trackStreakMilestoneActivity = useCallback(async (streakData: any) => {
    if (!user || !socialEnabled) return;

    // Only track milestone streaks (every 7 days)
    if (streakData.streak_length % 7 === 0 && streakData.streak_length >= 7) {
      try {
        console.log('Tracking streak milestone activity:', streakData);
        await socialActivityManager.createStreakMilestoneActivity(user.id, streakData);
      } catch (error) {
        console.error('Error tracking streak milestone activity:', error);
      }
    }
  }, [user, socialEnabled]);

  const trackPersonalBestActivity = useCallback(async (exerciseId: string, newBest: number, previousBest: number) => {
    if (!user || !socialEnabled) return;

    try {
      console.log('Tracking personal best activity:', { exerciseId, newBest, previousBest });
      await socialActivityManager.createPersonalBestActivity(user.id, exerciseId, newBest, previousBest);
    } catch (error) {
      console.error('Error tracking personal best activity:', error);
    }
  }, [user, socialEnabled]);

  return {
    trackWorkoutActivity,
    trackAchievementActivity,
    trackLevelUpActivity,
    trackStreakMilestoneActivity,
    trackPersonalBestActivity
  };
};
