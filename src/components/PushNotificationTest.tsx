import { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';
import { logInfo } from '@/utils/productionLogger';

export const PushNotificationTest = () => {
  logInfo('PushNotificationTest component rendering');
  
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  logInfo('PushNotificationTest hook values', {
    isSupported,
    isSubscribed,
    isLoading
  });

  useEffect(() => {
    logInfo('PushNotificationTest component mounted', {
      isSupported,
      isSubscribed,
      isLoading
    });
  }, [isSupported, isSubscribed, isLoading]);

  const handleSubscribe = async () => {
    logInfo('PushNotificationTest subscribe button clicked');
    const result = await subscribe();
    logInfo('PushNotificationTest subscribe result', { result });
  };

  const handleUnsubscribe = async () => {
    logInfo('PushNotificationTest unsubscribe button clicked');
    const result = await unsubscribe();
    logInfo('PushNotificationTest unsubscribe result', { result });
  };

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-2">
          <p>Supported: {isSupported ? 'Yes' : 'No'}</p>
          <p>Subscribed: {isSubscribed ? 'Yes' : 'No'}</p>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={handleSubscribe} 
            disabled={isLoading || !isSupported || isSubscribed}
          >
            {isLoading ? 'Loading...' : 'Subscribe'}
          </Button>
          
          <Button 
            onClick={handleUnsubscribe}
            disabled={isLoading || !isSupported || !isSubscribed}
            variant="outline"
          >
            {isLoading ? 'Loading...' : 'Unsubscribe'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};