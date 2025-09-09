import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ServiceWorkerMessage {
  type: string;
  data?: any;
}

export const useSecureServiceWorker = () => {
  const { user } = useAuth();

  // Handle secure communication from Service Worker
  const handleServiceWorkerMessage = useCallback(async (message: ServiceWorkerMessage) => {
    if (!user) return;

    try {
      switch (message.type) {
        case 'LOG_NOTIFICATION_INTERACTION':
          await logNotificationInteraction(message.data);
          break;
        
        case 'SAVE_OFFLINE_SESSION':
          await saveOfflineSession(message.data);
          break;
        
        default:
          console.warn('Unknown service worker message type:', message.type);
      }
    } catch (error) {
      console.error('Error handling service worker message:', error);
    }
  }, [user]);

  // Secure notification interaction logging
  const logNotificationInteraction = useCallback(async (data: any) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('log-notification-interaction', {
        body: {
          ...data,
          user_id: user.id
        }
      });

      if (error) {
        console.error('Failed to log notification interaction:', error);
      }
    } catch (error) {
      console.error('Error logging notification interaction:', error);
    }
  }, [user]);

  // Secure offline session saving
  const saveOfflineSession = useCallback(async (sessionData: any) => {
    if (!user) return;

    try {
      const { error } = await supabase.functions.invoke('secure-session-save', {
        body: sessionData
      });

      if (error) {
        console.error('Failed to save offline session:', error);
        throw error;
      }

      // Notify service worker of successful sync
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_SUCCESS',
          sessionId: sessionData.id
        });
      }
    } catch (error) {
      console.error('Error saving offline session:', error);
      // Notify service worker of failed sync
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_FAILED',
          sessionId: sessionData.id,
          error: error.message
        });
      }
    }
  }, [user]);

  return {
    handleServiceWorkerMessage,
    logNotificationInteraction,
    saveOfflineSession
  };
};