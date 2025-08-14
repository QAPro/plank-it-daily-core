
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendSystemManager } from '@/services/friendSystemService';

export const useFriendActivityTracking = () => {
  const { user } = useAuth();

  const trackWorkoutActivity = useCallback(async (sessionData: any) => {
    if (!user) return;

    try {
      await friendSystemManager.createActivity(user.id, 'workout', {
        exercise_name: sessionData.exercise_name || 'Workout',
        duration_seconds: sessionData.duration_seconds,
        difficulty_level: sessionData.difficulty_level
      });
    } catch (error) {
      console.error('Error tracking workout activity:', error);
    }
  }, [user]);

  const trackAchievementActivity = useCallback(async (achievementData: any) => {
    if (!user) return;

    try {
      await friendSystemManager.createActivity(user.id, 'achievement', {
        achievement_name: achievementData.achievement_name,
        achievement_type: achievementData.achievement_type,
        rarity: achievementData.rarity
      });
    } catch (error) {
      console.error('Error tracking achievement activity:', error);
    }
  }, [user]);

  const trackLevelUpActivity = useCallback(async (levelData: any) => {
    if (!user) return;

    try {
      await friendSystemManager.createActivity(user.id, 'level_up', {
        old_level: levelData.old_level,
        new_level: levelData.new_level,
        level_title: levelData.level_title
      });
    } catch (error) {
      console.error('Error tracking level up activity:', error);
    }
  }, [user]);

  const trackStreakMilestoneActivity = useCallback(async (streakData: any) => {
    if (!user) return;

    // Only track milestone streaks (every 7 days)
    if (streakData.streak_length % 7 === 0 && streakData.streak_length >= 7) {
      try {
        await friendSystemManager.createActivity(user.id, 'streak_milestone', {
          streak_length: streakData.streak_length,
          milestone_type: streakData.streak_length >= 30 ? 'major' : 'minor'
        });
      } catch (error) {
        console.error('Error tracking streak milestone activity:', error);
      }
    }
  }, [user]);

  return {
    trackWorkoutActivity,
    trackAchievementActivity,
    trackLevelUpActivity,
    trackStreakMilestoneActivity
  };
};
