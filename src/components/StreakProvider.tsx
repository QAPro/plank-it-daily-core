
import { createContext, useContext, useState, ReactNode } from 'react';
import StreakMilestone from './StreakMilestone';

interface Milestone {
  days: number;
  title: string;
  description: string;
}

interface StreakContextType {
  showMilestone: (milestone: Milestone) => void;
}

const StreakContext = createContext<StreakContextType | undefined>(undefined);

export const useStreak = () => {
  const context = useContext(StreakContext);
  if (!context) {
    throw new Error('useStreak must be used within a StreakProvider');
  }
  return context;
};

interface StreakProviderProps {
  children: ReactNode;
}

export const StreakProvider = ({ children }: StreakProviderProps) => {
  const [currentMilestone, setCurrentMilestone] = useState<Milestone | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const showMilestone = (milestone: Milestone) => {
    setCurrentMilestone(milestone);
    setIsVisible(true);
  };

  const hideMilestone = () => {
    setIsVisible(false);
    setTimeout(() => setCurrentMilestone(null), 300); // Wait for animation to complete
  };

  return (
    <StreakContext.Provider value={{ showMilestone }}>
      {children}
      {currentMilestone && (
        <StreakMilestone
          milestone={currentMilestone}
          onClose={hideMilestone}
          isVisible={isVisible}
        />
      )}
    </StreakContext.Provider>
  );
};
