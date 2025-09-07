import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2, Bell, ExternalLink, Info } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { isInIframe, openInNewTab } from '@/utils/iframe';
import { EnhancedPushNotificationDebug } from './EnhancedPushNotificationDebug';
import { ServiceWorkerDebugger } from './ServiceWorkerDebugger';

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
  
  const inIframe = isInIframe();

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
        isLoading,
        inIframe
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
    // Removed polling interval to stop console spam
  }, [user, isSupported, isSubscribed, isLoading]);

  const handleForceSubscribe = async () => {
    setLastAction('Force Subscribe Clicked');
    
    try {
      const result = await forceSubscribeIgnorePermission();
      setLastAction(`Force Subscribe Result: ${result ? 'Success' : 'Failed'}`);
    } catch (error) {
      setLastAction(`Force Subscribe Error: ${error}`);
    }
  };

  const handleForceResetPermission = async () => {
    setLastAction('Force Reset Permission Clicked');
    
    try {
      const result = await forceRequestPermission();
      setLastAction(`Force Reset Result: ${result ? 'Success' : 'Failed'}`);
    } catch (error) {
      setLastAction(`Force Reset Error: ${error}`);
    }
  };

  const handleNuclearReset = async () => {
    setLastAction('Nuclear Reset Clicked');
    
    if (confirm('This will completely reset all push notification data and service workers. You will need to reload the page after this. Continue?')) {
      try {
        const result = await nuclearReset();
        setLastAction(`Nuclear Reset Result: ${result ? 'Success - Please reload page' : 'Failed'}`);
      } catch (error) {
        setLastAction(`Nuclear Reset Error: ${error}`);
      }
    }
  };

  const handleDirectPermission = async () => {
    setLastAction('Direct Permission Clicked');
    
    try {
      const result = await directPermissionRequest();
      setLastAction(`Direct Permission Result: ${result ? 'Success' : 'Failed'}`);
    } catch (error) {
      setLastAction(`Direct Permission Error: ${error}`);
    }
  };

  const handleAlternativeSubscribe = async () => {
    setLastAction('Alternative Subscribe Clicked');
    
    try {
      const result = await alternativeSubscribe();
      setLastAction(`Alternative Subscribe Result: ${result ? 'Success' : 'Failed'}`);
    } catch (error) {
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

  // Only show in development mode
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="space-y-4">
      <EnhancedPushNotificationDebug />
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Legacy Debug Tools
          </CardTitle>
          <CardDescription>
            Raw debugging tools and manual controls
          </CardDescription>
        </CardHeader>
      <CardContent className="space-y-4">
        {inIframe && (
          <Alert className="border-orange-200 bg-orange-50">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Iframe Mode Detected:</strong> Push notifications are blocked in preview environments. 
              <Button 
                variant="link" 
                size="sm" 
                onClick={openInNewTab}
                className="h-auto p-0 ml-1 text-orange-600 hover:text-orange-800"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open in standalone tab
              </Button>
              to test notifications.
            </AlertDescription>
          </Alert>
        )}
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
            
            <div className="flex items-center gap-2">
              {getStatusIcon(!inIframe)}
              <span>Standalone mode: {inIframe ? 'No (in iframe)' : 'Yes'}</span>
              {inIframe && <Badge variant="destructive" className="text-xs">Preview Mode</Badge>}
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

        {/* Service Worker Debugger */}
        <ServiceWorkerDebugger />

        <div className="space-y-2 bg-muted/50 p-3 rounded-lg border">
          <h4 className="font-medium text-sm">Troubleshooting Tips:</h4>
          <ul className="text-xs space-y-1 text-muted-foreground">
            <li>• Check browser console for [SW] service worker logs</li>
            <li>• Try hard refresh: Ctrl+F5 (PC) or Cmd+Shift+R (Mac)</li>
            <li>• Test in incognito/private mode for clean state</li>
            <li>• Clear site data: DevTools → Application → Storage → Clear</li>
            <li>• Check browser notification settings for this site</li>
            <li>• Ensure HTTPS connection (required for notifications)</li>
            <li>• iOS: Add to home screen for better notification support</li>
            <li>• Android: Check app-specific notification settings</li>
          </ul>
        </div>

        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
        </div>
      </CardContent>
    </Card>
    </div>
  );
};