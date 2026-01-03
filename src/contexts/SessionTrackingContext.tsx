import { createContext, useContext, ReactNode } from 'react';
import { useEnhancedSessionTracking } from '@/hooks/useEnhancedSessionTracking';

// Create context with the hook's return type
const SessionTrackingContext = createContext<ReturnType<typeof useEnhancedSessionTracking> | null>(null);

export const SessionTrackingProvider = ({ children }: { children: ReactNode }) => {
  const sessionTracking = useEnhancedSessionTracking();
  
  return (
    <SessionTrackingContext.Provider value={sessionTracking}>
      {children}
    </SessionTrackingContext.Provider>
  );
};

export const useSessionTracking = () => {
  const context = useContext(SessionTrackingContext);
  if (!context) {
    throw new Error('useSessionTracking must be used within SessionTrackingProvider');
  }
  return context;
};
