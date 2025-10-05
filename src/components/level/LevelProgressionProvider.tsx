
import { createContext, useContext, ReactNode } from 'react';
import { useXPTracking } from '@/hooks/useXPTracking';
import { useLevelProgression } from '@/hooks/useLevelProgression';
import XPGainNotification from './XPGainNotification';
import LevelUpCelebration from './LevelUpCelebration';

interface LevelProgressionContextType {
  trackXP: (source: string, data: any) => Promise<{ success: boolean; error?: string; xpAwarded?: number }>;
  userLevel: any;
  isFeatureUnlocked: (featureName: string) => boolean;
  getFeatureUnlockLevel: (featureName: string) => number | null;
}

const LevelProgressionContext = createContext<LevelProgressionContextType | undefined>(undefined);

export const useLevelProgressionContext = () => {
  const context = useContext(LevelProgressionContext);
  if (!context) {
    throw new Error('useLevelProgressionContext must be used within a LevelProgressionProvider');
  }
  return context;
};

interface LevelProgressionProviderProps {
  children: ReactNode;
}

export const LevelProgressionProvider = ({ children }: LevelProgressionProviderProps) => {
  const { 
    trackXP, 
    xpNotification, 
    hideXPNotification, 
    levelUpData, 
    hideLevelUpCelebration 
  } = useXPTracking();
  
  const { 
    userLevel, 
    isFeatureUnlocked, 
    getFeatureUnlockLevel,
    getUnlocksForLevel 
  } = useLevelProgression();

  return (
    <LevelProgressionContext.Provider 
      value={{ 
        trackXP, 
        userLevel, 
        isFeatureUnlocked, 
        getFeatureUnlockLevel 
      }}
    >
      {children}
      
      {/* XP Gain Notification */}
      <XPGainNotification
        amount={xpNotification.amount}
        description={xpNotification.description}
        isVisible={xpNotification.isVisible}
        onHide={hideXPNotification}
      />

      {/* Level Up Celebration */}
      <LevelUpCelebration
        isVisible={levelUpData.isVisible}
        oldLevel={levelUpData.oldLevel}
        newLevel={levelUpData.newLevel}
        unlocks={getUnlocksForLevel(levelUpData.newLevel?.current_level || 0)}
        onClose={hideLevelUpCelebration}
      />
    </LevelProgressionContext.Provider>
  );
};
