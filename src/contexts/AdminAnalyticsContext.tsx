
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logDebug, logInfo, logError } from '@/utils/productionLogger';

interface DrillDownState {
  type: 'user' | 'exercise' | 'cohort' | 'timeframe' | null;
  value: string | null;
  metadata?: Record<string, any>;
}

interface RealTimeMetrics {
  activeUsers: number;
  sessionsToday: number;
  lastUpdated: Date;
}

interface AdminAnalyticsContextType {
  drillDownState: DrillDownState;
  setDrillDown: (type: DrillDownState['type'], value: string, metadata?: Record<string, any>) => void;
  clearDrillDown: () => void;
  realTimeMetrics: RealTimeMetrics;
  isRealTimeEnabled: boolean;
  toggleRealTime: () => void;
}

const AdminAnalyticsContext = createContext<AdminAnalyticsContextType | undefined>(undefined);

interface AdminAnalyticsProviderProps {
  children: ReactNode;
}

export const AdminAnalyticsProvider = ({ children }: AdminAnalyticsProviderProps) => {
  const [drillDownState, setDrillDownState] = useState<DrillDownState>({
    type: null,
    value: null,
    metadata: undefined
  });

  const [realTimeMetrics, setRealTimeMetrics] = useState<RealTimeMetrics>({
    activeUsers: 0,
    sessionsToday: 0,
    lastUpdated: new Date()
  });

  const [isRealTimeEnabled, setIsRealTimeEnabled] = useState(false);

  const setDrillDown = (type: DrillDownState['type'], value: string, metadata?: Record<string, any>) => {
    logDebug('Setting drill down:', { type, value, metadata });
    setDrillDownState({ type, value, metadata });
  };

  const clearDrillDown = () => {
    logDebug('Clearing drill down');
    setDrillDownState({ type: null, value: null, metadata: undefined });
  };

  const toggleRealTime = () => {
    const newValue = !isRealTimeEnabled;
    setIsRealTimeEnabled(newValue);
    logDebug('Real-time toggled:', { enabled: newValue });
  };

  // Real-time metrics updates
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const updateRealTimeMetrics = async () => {
      try {
        const { data: activeUsers } = await supabase.rpc('get_active_users_metrics');
        const todayActiveUsers = activeUsers?.find(m => m.metric_type === 'daily_active_users');
        
        const { data: todaySessions, error } = await supabase
          .from('user_sessions')
          .select('id', { count: 'exact' })
          .gte('completed_at', new Date().toISOString().split('T')[0]);

        if (!error) {
          setRealTimeMetrics({
            activeUsers: todayActiveUsers?.metric_value || 0,
            sessionsToday: todaySessions?.length || 0,
            lastUpdated: new Date()
          });
        }
      } catch (error) {
        logError('Error updating real-time metrics:', { error });
      }
    };

    // Update immediately
    updateRealTimeMetrics();

    // Set up interval for real-time updates
    const interval = setInterval(updateRealTimeMetrics, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [isRealTimeEnabled]);

  // Real-time database subscriptions
  useEffect(() => {
    if (!isRealTimeEnabled) return;

    const channel = supabase
      .channel('admin-analytics-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_sessions'
        },
        (payload) => {
          logInfo('New session detected:', { payload });
          setRealTimeMetrics(prev => ({
            ...prev,
            sessionsToday: prev.sessionsToday + 1,
            lastUpdated: new Date()
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isRealTimeEnabled]);

  return (
    <AdminAnalyticsContext.Provider value={{
      drillDownState,
      setDrillDown,
      clearDrillDown,
      realTimeMetrics,
      isRealTimeEnabled,
      toggleRealTime
    }}>
      {children}
    </AdminAnalyticsContext.Provider>
  );
};

export const useAdminAnalytics = () => {
  const context = useContext(AdminAnalyticsContext);
  if (context === undefined) {
    throw new Error('useAdminAnalytics must be used within an AdminAnalyticsProvider');
  }
  return context;
};
