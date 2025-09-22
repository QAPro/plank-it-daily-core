import React, { useState, useEffect } from 'react';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export const EnhancedPushNotificationTest = () => {
  const { user } = useAuth();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe
  } = usePushNotifications();

  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [swReady, setSwReady] = useState(false);
  
  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    
    // Check service worker readiness
    if ('serviceWorker' in navigator) {
      checkServiceWorker();
    }
  }, []);

  const checkServiceWorker = async () => {
    try {
      if (navigator.serviceWorker.controller) {
        setSwReady(true);
      } else {
        await navigator.serviceWorker.ready;
        setSwReady(true);
      }
    } catch (error) {
      console.error('Service worker check failed:', error);
      setSwReady(false);
    }
  };

  const handleSubscribe = async () => {
    console.log('[EnhancedTest] Subscribe button clicked');
    const result = await subscribe();
    console.log('[EnhancedTest] Subscribe result:', result);
  };

  const handleUnsubscribe = async () => {
    console.log('[EnhancedTest] Unsubscribe button clicked');
    const result = await unsubscribe();
    console.log('[EnhancedTest] Unsubscribe result:', result);
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const canSubscribe = user && isSupported && swReady && permissionStatus !== 'denied' && !isSubscribed;

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Enhanced Push Notifications Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Prerequisites Status */}
        <div>
          <h4 className="font-semibold mb-3">Prerequisites Check</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon(!!user)}
              <span>User Authenticated</span>
              {user && <Badge variant="secondary" className="ml-auto">Yes</Badge>}
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(isSupported)}
              <span>Browser Support</span>
              {isSupported && <Badge variant="secondary" className="ml-auto">Yes</Badge>}
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(swReady)}
              <span>Service Worker</span>
              {swReady && <Badge variant="secondary" className="ml-auto">Ready</Badge>}
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(permissionStatus === 'granted')}
              <span>Permission</span>
              <Badge 
                variant={permissionStatus === 'granted' ? 'default' : 
                         permissionStatus === 'denied' ? 'destructive' : 'outline'}
                className="ml-auto"
              >
                {permissionStatus}
              </Badge>
            </div>
          </div>
        </div>

        {/* Current Status */}
        <div>
          <h4 className="font-semibold mb-3">Current Status</h4>
          <div className="text-sm space-y-2">
            <div className="flex justify-between">
              <span>Subscribed:</span>
              <Badge variant={isSubscribed ? 'default' : 'outline'}>
                {isSubscribed ? 'Yes' : 'No'}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span>Loading:</span>
              <Badge variant={isLoading ? 'secondary' : 'outline'}>
                {isLoading ? 'Yes' : 'No'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!canSubscribe && !isSubscribed && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Cannot subscribe yet:
                </span>
              </div>
              <ul className="mt-1 text-xs text-yellow-700 space-y-1">
                {!user && <li>• Please sign in first</li>}
                {!isSupported && <li>• Browser doesn't support push notifications</li>}
                {!swReady && <li>• Service worker is not ready</li>}
                {permissionStatus === 'denied' && <li>• Notifications are blocked - check browser settings</li>}
              </ul>
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              onClick={handleSubscribe} 
              disabled={isLoading || !canSubscribe}
              className="flex-1"
            >
              {isLoading ? 'Setting up...' : isSubscribed ? 'Already Subscribed' : 'Subscribe to Notifications'}
            </Button>
            
            {isSubscribed && (
              <Button 
                onClick={handleUnsubscribe}
                disabled={isLoading}
                variant="outline"
              >
                {isLoading ? 'Loading...' : 'Unsubscribe'}
              </Button>
            )}
          </div>
        </div>

        {/* Success Message */}
        {isSubscribed && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                Push notifications are enabled! You'll receive notifications for workouts and achievements.
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};