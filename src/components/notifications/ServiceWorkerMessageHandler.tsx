import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export const ServiceWorkerMessageHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle messages from service worker
    const handleMessage = (event: MessageEvent) => {
      console.log('[App] Received message from service worker:', event.data);
      
      const { type, url, data } = event.data;
      
      switch (type) {
        case 'NAVIGATE':
          console.log('[App] Navigating to:', url);
          
          // Handle deep link parameters for workout starting
          if (url.includes('exercise-id') || url.includes('quick-start')) {
            // For workout deep links, navigate to root with parameters
            window.location.href = url;
            return;
          }
          
          // Extract tab from URL and navigate
          if (url.includes('?tab=')) {
            const urlParams = new URLSearchParams(url.split('?')[1]);
            const tab = urlParams.get('tab');
            if (tab) {
              // Set the active tab in localStorage or state management
              localStorage.setItem('activeTab', tab);
              // Trigger a custom event to update the UI
              window.dispatchEvent(new CustomEvent('tabChange', { detail: { tab } }));
            }
          }
          navigate(url);
          break;
          
        case 'SHARE_ACHIEVEMENT':
          console.log('[App] Share achievement triggered:', data);
          // Handle achievement sharing
          if (data?.achievement) {
            toast({
              title: "🎉 Share Your Achievement!",
              description: `Ready to share your "${data.achievement}" achievement?`,
              duration: 5000,
            });
            // Could open share dialog or navigate to achievements with share mode
            navigate('/?tab=achievements&share=true');
          }
          break;
          
        default:
          console.log('[App] Unknown message type:', type);
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