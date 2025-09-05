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
    resubscribe,
    forceSubscribeIgnorePermission,
    forceRequestPermission,
    nuclearReset,
    directPermissionRequest,
    alternativeSubscribe
  } = usePushNotifications();

  const [debugInfo, setDebugInfo] = useState<any>({});
  const [permissionStatus, setPermissionStatus] = useState<string>('');
  const [browserInfo, setBrowserInfo] = useState<any>({});
  const [lastAction, setLastAction] = useState<string>('');

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
      
      // Enhanced browser detection
      const browserInfo = {
        userAgent: navigator.userAgent,
        isChrome: /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor),
        isEdge: /Edg/.test(navigator.userAgent),
        isFirefox: /Firefox/.test(navigator.userAgent),
        isSafari: /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor),
        isPrivateMode: false, // Will be detected separately
        pushManagerExists: 'PushManager' in window,
        serviceWorkerExists: 'serviceWorker' in navigator
      };
      setBrowserInfo(browserInfo);
    };

    updateDebugInfo();
    const interval = setInterval(updateDebugInfo, 1000);
    return () => clearInterval(interval);
  }, [user, isSupported, isSubscribed, isLoading]);

  const handleForceSubscribe = async () => {
    setLastAction('Force Subscribe Clicked');
    console.log('[PushDebug] Force subscribe button CLICKED!');
    console.log('[PushDebug] Debug info:', debugInfo);
    console.log('[PushDebug] Browser info:', browserInfo);
    console.log('[PushDebug] isLoading:', isLoading);
    console.log('[PushDebug] forceSubscribeIgnorePermission function:', typeof forceSubscribeIgnorePermission);
    
    try {
      const result = await forceSubscribeIgnorePermission();
      console.log('[PushDebug] Force subscribe completed:', result);
      setLastAction(`Force Subscribe Result: ${result ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error('[PushDebug] Force subscribe failed:', error);
      setLastAction(`Force Subscribe Error: ${error}`);
    }
  };

  const handleForceResetPermission = async () => {
    setLastAction('Force Reset Permission Clicked');
    console.log('[PushDebug] Force reset permission button CLICKED!');
    console.log('[PushDebug] Current permission:', Notification.permission);
    console.log('[PushDebug] Debug info:', debugInfo);
    console.log('[PushDebug] Browser info:', browserInfo);
    console.log('[PushDebug] isLoading:', isLoading);
    console.log('[PushDebug] forceRequestPermission function:', typeof forceRequestPermission);
    
    try {
      const result = await forceRequestPermission();
      console.log('[PushDebug] Force reset permission completed:', result);
      setLastAction(`Force Reset Result: ${result ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error('[PushDebug] Force reset permission failed:', error);
      setLastAction(`Force Reset Error: ${error}`);
    }
  };

  const handleNuclearReset = async () => {
    setLastAction('Nuclear Reset Clicked');
    console.log('[PushDebug] Nuclear reset button CLICKED!');
    
    if (confirm('This will completely reset all push notification data and service workers. You will need to reload the page after this. Continue?')) {
      try {
        const result = await nuclearReset();
        console.log('[PushDebug] Nuclear reset completed:', result);
        setLastAction(`Nuclear Reset Result: ${result ? 'Success - Please reload page' : 'Failed'}`);
      } catch (error) {
        console.error('[PushDebug] Nuclear reset failed:', error);
        setLastAction(`Nuclear Reset Error: ${error}`);
      }
    }
  };

  const handleDirectPermission = async () => {
    setLastAction('Direct Permission Clicked');
    console.log('[PushDebug] Direct permission button CLICKED!');
    
    try {
      const result = await directPermissionRequest();
      console.log('[PushDebug] Direct permission completed:', result);
      setLastAction(`Direct Permission Result: ${result ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error('[PushDebug] Direct permission failed:', error);
      setLastAction(`Direct Permission Error: ${error}`);
    }
  };

  const handleAlternativeSubscribe = async () => {
    setLastAction('Alternative Subscribe Clicked');
    console.log('[PushDebug] Alternative subscribe button CLICKED!');
    
    try {
      const result = await alternativeSubscribe();
      console.log('[PushDebug] Alternative subscribe completed:', result);
      setLastAction(`Alternative Subscribe Result: ${result ? 'Success' : 'Failed'}`);
    } catch (error) {
      console.error('[PushDebug] Alternative subscribe failed:', error);
      setLastAction(`Alternative Subscribe Error: ${error}`);
    }
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
          <div className="text-xs text-muted-foreground mb-2">
            Debug: isLoading={String(isLoading)}, lastAction: {lastAction}
          </div>

          <div className="text-xs bg-muted p-2 rounded mb-2">
            <div>Browser: {browserInfo.isChrome ? 'Chrome' : browserInfo.isEdge ? 'Edge' : browserInfo.isFirefox ? 'Firefox' : browserInfo.isSafari ? 'Safari' : 'Unknown'}</div>
            <div>Permission API: {String(Notification.permission)}</div>
            <div>SW Controller: {String(!!navigator.serviceWorker.controller)}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleDirectPermission}
              disabled={isLoading}
              variant="outline"
              className="text-xs h-8"
              style={{ pointerEvents: 'auto', zIndex: 10 }}
              type="button"
            >
              Direct Permission
            </Button>
            
            <Button 
              onClick={handleForceResetPermission}
              disabled={isLoading}
              variant="secondary"
              className="text-xs h-8"
              style={{ pointerEvents: 'auto', zIndex: 10 }}
              type="button"
            >
              Force Reset
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleAlternativeSubscribe}
              disabled={isLoading}
              variant="default"
              className="text-xs h-8"
              style={{ pointerEvents: 'auto', zIndex: 10 }}
              type="button"
            >
              Alternative Subscribe
            </Button>
            
            <Button 
              onClick={handleForceSubscribe}
              disabled={isLoading}
              variant="default"
              className="text-xs h-8"
              style={{ pointerEvents: 'auto', zIndex: 10 }}
              type="button"
            >
              Force Subscribe
            </Button>
          </div>
          
          <Button 
            onClick={handleNuclearReset}
            disabled={isLoading}
            variant="destructive"
            className="w-full text-xs h-8"
            style={{ pointerEvents: 'auto', zIndex: 10 }}
            type="button"
          >
            🚨 Nuclear Reset (Clear Everything)
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

        <div className="space-y-2 bg-muted/50 p-3 rounded-lg border">
          <h4 className="font-medium text-sm">Troubleshooting Tips:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Try hard refresh: Ctrl+F5 (PC) or Cmd+Shift+R (Mac)</li>
            <li>• Test in incognito/private mode for clean state</li>
            <li>• Clear site data: DevTools → Application → Storage → Clear</li>
            <li>• Check browser notification settings for this site</li>
            <li>• Ensure HTTPS connection (required for notifications)</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </CardContent>
    </Card>
  );
};