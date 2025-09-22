import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useSecureServiceWorker } from '@/hooks/useSecureServiceWorker';

export const ServiceWorkerMessageHandler = () => {
  const navigate = useNavigate();
  const { handleServiceWorkerMessage } = useSecureServiceWorker();

  useEffect(() => {
    // Handle messages from service worker (sanitized)
    const handleMessage = async (event: MessageEvent) => {
      try {
        console.log('[App] Received message from service worker:', event.data);
        if (!event || !event.data || typeof event.data !== 'object') return;

        // Only accept messages from our active service worker controller
        const controller = navigator.serviceWorker?.controller || null;
        if (event.source && controller && event.source !== controller) {
          return;
        }

        const { type, url, data, key, value } = event.data as any;

        switch (type) {
          case 'NAVIGATE': {
            if (typeof url !== 'string') return;

            let dest: URL;
            try {
              dest = new URL(url, window.location.origin);
            } catch {
              return;
            }
            if (dest.origin !== window.location.origin) return;

            const pathAndSearch = `${dest.pathname}${dest.search}`;

            // Handle deep link parameters for workout starting
            if (pathAndSearch.includes('exercise-id') || pathAndSearch.includes('quick-start')) {
              window.location.href = pathAndSearch;
              return;
            }

            // Extract tab from URL and navigate
            const tab = dest.searchParams.get('tab');
            if (tab) {
              localStorage.setItem('activeTab', tab);
              window.dispatchEvent(new CustomEvent('tabChange', { detail: { tab } }));
            }
            navigate(pathAndSearch);
            break;
          }

          case 'SHARE_ACHIEVEMENT': {
            console.log('[App] Share achievement triggered:', data);
            if (data?.achievement) {
              toast({
                title: '🎉 Share Your Achievement!',
                description: `Ready to share your "${data.achievement}" achievement?`,
                duration: 5000,
              });
              navigate('/?tab=achievements&share=true');
            }
            break;
          }

          case 'GET_STORAGE': {
            const allowedKeys = new Set(['offline_workout_sessions']);
            const response = {
              type: 'STORAGE_VALUE',
              key,
              value: null as string | null,
            };
            if (key && allowedKeys.has(key)) {
              response.value = localStorage.getItem(key);
            }
            (event.source as any)?.postMessage(response);
            break;
          }

          case 'SET_STORAGE': {
            const allowedKeys = new Set(['offline_workout_sessions']);
            if (key && allowedKeys.has(key) && typeof value === 'string') {
              localStorage.setItem(key, value);
            }
            break;
          }

          case 'LOG_NOTIFICATION_INTERACTION':
          case 'SAVE_OFFLINE_SESSION': {
            // Handle secure operations via authenticated hook
            await handleServiceWorkerMessage({ type, data });
            break;
          }

          default:
            console.log('[App] Unknown message type:', type);
        }
      } catch (err) {
        console.warn('[App] Error handling SW message', err);
      }
    };

    // Register message listener
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleMessage);
      
      return () => {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
      };
    }
  }, [navigate]);

  return null; // This component doesn't render anything
};

export default ServiceWorkerMessageHandler;