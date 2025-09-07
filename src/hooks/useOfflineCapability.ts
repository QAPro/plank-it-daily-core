import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import OfflineCapabilityService from '@/services/offlineCapabilityService';
import { toast } from 'sonner';

export const useOfflineCapability = () => {
  const { user } = useAuth();
  const [offlineStatus, setOfflineStatus] = useState(
    OfflineCapabilityService.getOfflineStatus()
  );
  const [isSyncing, setIsSyncing] = useState(false);

  // Update offline status when connectivity changes
  useEffect(() => {
    const updateStatus = () => {
      setOfflineStatus(OfflineCapabilityService.getOfflineStatus());
    };

    const handleOnline = async () => {
      updateStatus();
      
      // Attempt to sync pending sessions when coming online
      if (offlineStatus.pendingSessions > 0) {
        await syncOfflineSessions();
      }
      
      // Cache fresh data when online
      if (user) {
        OfflineCapabilityService.cacheEssentialWorkoutData(user.id);
      }
    };

    const handleOffline = () => {
      updateStatus();
      toast.info('You\'re now offline. Quick-start workouts are still available!');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    // Update status periodically
    const interval = setInterval(updateStatus, 30000); // Every 30 seconds

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [user, offlineStatus.pendingSessions]);

  // Cache workout data on mount if user is logged in
  useEffect(() => {
    if (user && navigator.onLine) {
      OfflineCapabilityService.cacheEssentialWorkoutData(user.id);
    }
  }, [user]);

  // Listen for service worker sync messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'OFFLINE_SYNC_COMPLETE') {
        const { synced, failed } = event.data.data;
        
        if (synced > 0) {
          toast.success(`Synced ${synced} offline workout${synced !== 1 ? 's' : ''}!`);
        }
        
        if (failed > 0) {
          toast.error(`Failed to sync ${failed} workout${failed !== 1 ? 's' : ''}. Will retry later.`);
        }
        
        setOfflineStatus(OfflineCapabilityService.getOfflineStatus());
        setIsSyncing(false);
      }
    };

    navigator.serviceWorker?.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker?.removeEventListener('message', handleMessage);
    };
  }, []);

  const saveOfflineWorkout = async (exerciseId: string, duration: number) => {
    if (!user) throw new Error('User not logged in');

    const sessionId = await OfflineCapabilityService.saveOfflineWorkoutSession(
      user.id,
      exerciseId,
      duration
    );

    // Update offline cache
    OfflineCapabilityService.updateOfflineCacheAfterWorkout(exerciseId, duration);
    
    // Update status
    setOfflineStatus(OfflineCapabilityService.getOfflineStatus());

    // Show feedback to user
    if (!navigator.onLine) {
      toast.success('Workout saved offline! Will sync when connection returns.');
    }

    return sessionId;
  };

  const syncOfflineSessions = async () => {
    if (isSyncing) return;
    
    setIsSyncing(true);
    
    try {
      const result = await OfflineCapabilityService.syncOfflineSessionsToServer();
      
      if (result.synced > 0) {
        toast.success(`Synced ${result.synced} offline workout${result.synced !== 1 ? 's' : ''}!`);
      }
      
      if (result.failed > 0) {
        toast.error(`Failed to sync ${result.failed} workout${result.failed !== 1 ? 's' : ''}. Will retry later.`);
      }
      
      setOfflineStatus(OfflineCapabilityService.getOfflineStatus());
      
      return result;
    } catch (error) {
      console.error('Error syncing offline sessions:', error);
      toast.error('Failed to sync offline workouts. Will retry automatically.');
      return { synced: 0, failed: 0 };
    } finally {
      setIsSyncing(false);
    }
  };

  const getOfflineQuickStart = () => {
    return OfflineCapabilityService.getOfflineQuickStartData();
  };

  const clearOfflineData = () => {
    OfflineCapabilityService.clearOfflineCache();
    setOfflineStatus(OfflineCapabilityService.getOfflineStatus());
    toast.info('Offline data cleared');
  };

  return {
    offlineStatus,
    isSyncing,
    saveOfflineWorkout,
    syncOfflineSessions,
    getOfflineQuickStart,
    clearOfflineData,
    isQuickStartAvailable: OfflineCapabilityService.isQuickStartAvailableOffline()
  };
};