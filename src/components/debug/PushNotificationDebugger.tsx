import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Loader2, Bell } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export const PushNotificationDebugger: React.FC = () => {
  const { user } = useAuth();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    resubscribe
  } = usePushNotifications();

  const [debugInfo, setDebugInfo] = useState<any>({});
  const [permissionStatus, setPermissionStatus] = useState<string>('');

  useEffect(() => {
    const updateDebugInfo = () => {
      const info = {
        hasUser: !!user,
        userId: user?.id,
        browserSupport: 'serviceWorker' in navigator && 'PushManager' in window,
        serviceWorkerController: !!navigator.serviceWorker.controller,
        notificationPermission: Notification.permission,
        protocol: window.location.protocol,
        isSupported,
        isSubscribed,
        isLoading
      };
      setDebugInfo(info);
      setPermissionStatus(Notification.permission);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [user, isSupported, isSubscribed, isLoading]);

  const handleForceSubscribe = async () => {
    console.log('[PushDebug] Force subscribe attempt');
    console.log('[PushDebug] Debug info:', debugInfo);
    await subscribe();
  };

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications Debug
        </CardTitle>
        <CardDescription>
          Debug push notification subscription issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <h4 className="font-medium">Prerequisites:</h4>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.hasUser)}
              <span>User authenticated: {debugInfo.hasUser ? 'Yes' : 'No'}</span>
              {debugInfo.userId && <Badge variant="outline" className="text-xs">{debugInfo.userId.slice(0, 8)}...</Badge>}
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.browserSupport)}
              <span>Browser support: {debugInfo.browserSupport ? 'Yes' : 'No'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.serviceWorkerController)}
              <span>Service Worker: {debugInfo.serviceWorkerController ? 'Active' : 'Not Ready'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(permissionStatus === 'granted')}
              <span>Permission: </span>
              <Badge variant={
                permissionStatus === 'granted' ? 'default' : 
                permissionStatus === 'denied' ? 'destructive' : 'secondary'
              }>
                {permissionStatus}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2">
              {getStatusIcon(debugInfo.protocol === 'https:')}
              <span>Secure context: {debugInfo.protocol}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Current Status:</h4>
          <div className="flex items-center gap-2 text-sm">
            <span>Subscribed:</span>
            <Badge variant={isSubscribed ? 'default' : 'secondary'}>
              {isSubscribed ? 'Yes' : 'No'}
            </Badge>
          </div>
        </div>

        <div className="space-y-2">
          <Button 
            onClick={handleForceSubscribe}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Subscribing...
              </>
            ) : (
              'Force Subscribe'
            )}
          </Button>
          
          {isSubscribed && (
            <Button 
              onClick={resubscribe}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              {isLoading ? 'Refreshing...' : 'Refresh Subscription'}
            </Button>
          )}
          
          {isSubscribed && (
            <Button 
              onClick={unsubscribe}
              disabled={isLoading}
              variant="destructive"
              className="w-full"
            >
              {isLoading ? 'Unsubscribing...' : 'Unsubscribe'}
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </CardContent>
    </Card>
  );
};