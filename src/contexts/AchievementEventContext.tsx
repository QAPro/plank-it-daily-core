import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface AchievementEvent {
  type: 'earned' | 'progress_updated' | 'session_completed';
  achievementId?: string;
  timestamp: Date;
  metadata?: any;
}

interface AchievementEventContextType {
  lastEvent: AchievementEvent | null;
  broadcastEvent: (event: Omit<AchievementEvent, 'timestamp'>) => void;
}

const AchievementEventContext = createContext<AchievementEventContextType | undefined>(undefined);

export const AchievementEventProvider = ({ children }: { children: ReactNode }) => {
  const [lastEvent, setLastEvent] = useState<AchievementEvent | null>(null);

  const broadcastEvent = useCallback((event: Omit<AchievementEvent, 'timestamp'>) => {
    const fullEvent: AchievementEvent = {
      ...event,
      timestamp: new Date()
    };
    setLastEvent(fullEvent);
  }, []);

  return (
    <AchievementEventContext.Provider value={{ lastEvent, broadcastEvent }}>
      {children}
    </AchievementEventContext.Provider>
  );
};

export const useAchievementEvents = () => {
  const context = useContext(AchievementEventContext);
  if (context === undefined) {
    throw new Error('useAchievementEvents must be used within an AchievementEventProvider');
  }
  return context;
};
