
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { awardXP } from '@/services/levelProgressionService';
import { useLevelProgression } from './useLevelProgression';

export const useXPTracking = () => {
  const { user } = useAuth();
  const { refetch } = useLevelProgression();
  
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
    console.log('trackXP called - User object:', user);
    console.log('trackXP called - User ID:', user?.id);
    if (!user) {
      console.error('trackXP FAILED: No user object available');
      return;
    }
    console.log('trackXP proceeding with user:', user.id);

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
              unlocks: []
            });
          }, 1000);
        }

        // Refresh level data
        await refetch();
      }
    } catch (error) {
      console.error('Error tracking XP:', error);
    }
  }, [user, refetch]);

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
