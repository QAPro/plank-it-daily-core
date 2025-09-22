import React, { useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export const PushNotificationTest = () => {
  console.log('[PushNotificationTest] Component rendering...');
  
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  console.log('[PushNotificationTest] Hook values:', {
    isSupported,
    isSubscribed,
    isLoading
  });

  useEffect(() => {
    console.log('[PushNotificationTest] Component mounted', {
      isSupported,
      isSubscribed,
      isLoading
    });
  }, [isSupported, isSubscribed, isLoading]);

  const handleSubscribe = async () => {
    console.log('[PushNotificationTest] Subscribe button clicked');
    const result = await subscribe();
    console.log('[PushNotificationTest] Subscribe result:', result);
  };

  const handleUnsubscribe = async () => {
    console.log('[PushNotificationTest] Unsubscribe button clicked');
    const result = await unsubscribe();
    console.log('[PushNotificationTest] Unsubscribe result:', result);
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