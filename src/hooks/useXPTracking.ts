
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { awardXP } from '@/services/levelProgressionService';
import { EnhancedXPService } from '@/services/enhancedXPService';
import { HiddenAchievementEngine } from '@/services/hiddenAchievementService';
import { SeasonalAchievementEngine } from '@/services/seasonalAchievementService';
import { useLevelProgression } from './useLevelProgression';
import { toast } from '@/hooks/use-toast';

export interface XPTrackingResult {
  success: boolean;
  error?: string;
  xpAwarded?: number;
}

export const useXPTracking = () => {
  const { user, loading } = useAuth();
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

  const trackXP = useCallback(async (source: string, data: any): Promise<XPTrackingResult> => {
    console.log('🎯 trackXP called', { source, data, hasUser: !!user, userId: user?.id, loading });
    
    // Check if user is available
    if (!user?.id) {
      const errorMsg = 'XP tracking failed: User not authenticated';
      console.error('❌ trackXP FAILED:', errorMsg, { 
        hasUser: !!user, 
        userId: user?.id, 
        loading 
      });
      
      // Show error toast to user
      toast({
        title: "XP Award Failed",
        description: "Unable to award XP. Please ensure you're logged in.",
        variant: "destructive"
      });
      
      return { success: false, error: errorMsg };
    }
    
    console.log('✅ trackXP proceeding with user:', user.id);

    try {
      // Calculate enhanced XP with bonuses
      const enhancedXP = await EnhancedXPService.calculateEnhancedXP(source, data, user.id);
      
      // Award the enhanced XP amount
      const result = await awardXP(user.id, source, { 
        ...data, 
        calculated_xp: enhancedXP.totalXP 
      });
      
      if (enhancedXP.totalXP > 0) {
        // Show enhanced XP notification with bonuses
        let description = enhancedXP.description;
        
        // Add bonus indicators
        if (enhancedXP.bonuses.length > 0) {
          const bonusText = enhancedXP.bonuses
            .map(b => `+${b.amount} ${b.type.replace('_', ' ')}`)
            .join(', ');
          description += ` (${bonusText})`;
        }

        if (enhancedXP.multiplier > 1.0) {
          description += ` [${enhancedXP.multiplier}x Day!]`;
        }

        setXpNotification({
          amount: enhancedXP.totalXP,
          description,
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

        // Check for hidden and seasonal achievements
        const hiddenEngine = new HiddenAchievementEngine(user.id);
        const seasonalEngine = new SeasonalAchievementEngine(user.id);
        
        try {
          await Promise.all([
            hiddenEngine.checkHiddenAchievements(),
            seasonalEngine.checkSeasonalAchievements()
          ]);
        } catch (error) {
          console.error('Error checking special achievements:', error);
        }

        // Refresh level data
        await refetch();
        
        console.log('✅ XP tracking completed successfully', { 
          source, 
          xpAwarded: enhancedXP.totalXP 
        });
        
        return { 
          success: true, 
          xpAwarded: enhancedXP.totalXP 
        };
      } else {
        console.log('⚠️ No XP awarded (0 XP calculated)', { source, data });
        return { success: true, xpAwarded: 0 };
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error tracking XP';
      console.error('❌ Error tracking XP:', error, { source, data });
      
      toast({
        title: "XP Award Error",
        description: "Something went wrong while awarding XP. We'll try to fix this automatically.",
        variant: "destructive"
      });
      
      return { success: false, error: errorMsg };
    }
  }, [user, refetch, loading]);

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
