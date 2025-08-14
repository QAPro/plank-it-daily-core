import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { awardXP } from '@/services/levelProgressionService';
import { useLevelProgression } from './useLevelProgression';
import { useFriendActivityTracking } from './useFriendActivityTracking';

export const useXPTracking = () => {
  const { user } = useAuth();
  const { refetch } = useLevelProgression();
  const { 
    trackWorkoutActivity, 
    trackAchievementActivity, 
    trackLevelUpActivity, 
    trackStreakMilestoneActivity 
  } = useFriendActivityTracking();
  
  const [xpNotification, setXpNotification] = useState<{
    amount: number;
    description: string;
    isVisible: boolean;
  }>({ 
    amount: 0, 
    description: '', 
    isVisible: false 
  });
  const [levelUpData, setLevelUpData] = useState<{
    isVisible: boolean;
    oldLevel: number;
    newLevel: any;
    unlocks: any[];
  }>({
    isVisible: false,
    oldLevel: 0,
    newLevel: null,
    unlocks: []
  });

  const trackXP = useCallback(async (source: string, data: any) => {
    if (!user) return;

    try {
      const result = await awardXP(user.id, source, data);
      
      if (result.xpAmount > 0) {
        // Show XP notification
        setXpNotification({
          amount: result.xpAmount,
          description: `${source === 'workout' ? 'Workout completed' : source}`,
          isVisible: true
        });

        // Handle level up
        if (result.leveledUp && result.newLevel) {
          setTimeout(() => {
            setLevelUpData({
              isVisible: true,
              oldLevel: result.newLevel!.current_level - 1,
              newLevel: result.newLevel!,
              unlocks: [] // Will be populated with actual unlocks
            });
          }, 1000);

          // Track level up activity for friends
          await trackLevelUpActivity({
            old_level: result.newLevel.current_level - 1,
            new_level: result.newLevel.current_level,
            level_title: result.newLevel.level_title
          });
        }

        // Track friend activities based on source
        switch (source) {
          case 'workout':
            await trackWorkoutActivity(data);
            break;
          case 'achievement':
            await trackAchievementActivity(data);
            break;
          case 'streak':
            await trackStreakMilestoneActivity(data);
            break;
        }

        // Refresh level data
        await refetch();
      }
    } catch (error) {
      console.error('Error tracking XP:', error);
    }
  }, [user, refetch, trackWorkoutActivity, trackAchievementActivity, trackLevelUpActivity, trackStreakMilestoneActivity]);

  const hideXPNotification = useCallback(() => {
    setXpNotification(prev => ({ ...prev, isVisible: false }));
  }, []);

  const hideLevelUpCelebration = useCallback(() => {
    setLevelUpData(prev => ({ ...prev, isVisible: false }));
  }, []);

  return {
    trackXP,
    xpNotification,
    hideXPNotification,
    levelUpData,
    hideLevelUpCelebration
  };
};
