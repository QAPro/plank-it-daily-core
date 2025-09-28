import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

export const PushNotificationDebug = () => {
  const { user, loading } = useAuth();
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [swStatus, setSwStatus] = useState<string>('checking');
  const [vapidKeyStatus, setVapidKeyStatus] = useState<string>('not-checked');
  const [subscriptionCheck, setSubscriptionCheck] = useState<string>('not-checked');
  
  console.log('[PushNotificationDebug] Rendering debug info');
  
  const checkBrowserSupport = () => {
    return {
      serviceWorker: 'serviceWorker' in navigator,
      pushManager: 'PushManager' in window,
      notification: 'Notification' in window,
      isSecure: window.location.protocol === 'https:' || window.location.hostname === 'localhost'
    };
  };

  const support = checkBrowserSupport();

  useEffect(() => {
    // Check notification permission
    if ('Notification' in window) {
      setPermissionStatus(Notification.permission);
    }
    
    // Check service worker status
    if ('serviceWorker' in navigator) {
      checkServiceWorkerStatus();
    }
  }, []);

  const checkServiceWorkerStatus = async () => {
    try {
      if (navigator.serviceWorker.controller) {
        setSwStatus('active');
      } else {
        setSwStatus('waiting');
        const registration = await navigator.serviceWorker.ready;
        setSwStatus(registration.active ? 'ready' : 'not-ready');
      }
    } catch (error) {
      setSwStatus('error');
      console.error('[Debug] SW Error:', error);
    }
  };

  const testVapidKey = async () => {
    setVapidKeyStatus('testing');
    try {
      const { data, error } = await supabase.functions.invoke('get-vapid-public-key');
      if (error) {
        setVapidKeyStatus(`error: ${error.message}`);
      } else if (data?.publicKey) {
        setVapidKeyStatus('success');
      } else {
        setVapidKeyStatus('no-key-returned');
      }
    } catch (error) {
      setVapidKeyStatus(`exception: ${error}`);
    }
  };

  const checkCurrentSubscription = async () => {
    setSubscriptionCheck('checking');
    try {
      if (!('serviceWorker' in navigator)) {
        setSubscriptionCheck('no-sw-support');
        return;
      }
      
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setSubscriptionCheck(subscription ? 'subscribed' : 'not-subscribed');
    } catch (error) {
      setSubscriptionCheck(`error: ${error}`);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status.includes('success') || status === 'active' || status === 'ready' || status === 'subscribed') {
      return <Badge className="bg-green-500">{status}</Badge>;
    } else if (status.includes('error') || status === 'denied') {
      return <Badge variant="destructive">{status}</Badge>;
    } else if (status.includes('waiting') || status.includes('checking') || status.includes('testing')) {
      return <Badge variant="outline">{status}</Badge>;
    }
    return <Badge variant="secondary">{status}</Badge>;
  };
  
  return (
    <Card className="m-4 border-blue-200">
      <CardHeader>
        <CardTitle className="text-blue-700">Push Notification Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <h4 className="font-semibold mb-2">Authentication</h4>
          <div className="space-y-1 text-sm">
            <p>User: {user ? <Badge variant="secondary">Authenticated</Badge> : <Badge variant="destructive">Not Authenticated</Badge>}</p>
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
            <p>User ID: {user?.id || 'None'}</p>
            <p>Email: {user?.email || 'None'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Browser Support</h4>
          <div className="space-y-1 text-sm">
            <p>Service Worker: {support.serviceWorker ? <Badge>Supported</Badge> : <Badge variant="destructive">Not Supported</Badge>}</p>
            <p>Push Manager: {support.pushManager ? <Badge>Supported</Badge> : <Badge variant="destructive">Not Supported</Badge>}</p>
            <p>Notifications: {support.notification ? <Badge>Supported</Badge> : <Badge variant="destructive">Not Supported</Badge>}</p>
            <p>Secure Context: {support.isSecure ? <Badge>HTTPS/Localhost</Badge> : <Badge variant="destructive">Insecure</Badge>}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Environment</h4>
          <div className="space-y-1 text-sm">
            <p>Protocol: {window.location.protocol}</p>
            <p>Host: {window.location.host}</p>
            <p>User Agent: {navigator.userAgent.substring(0, 50)}...</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Notification Permission</h4>
          <div className="space-y-1 text-sm">
            <p>Permission: {getStatusBadge(permissionStatus)}</p>
            <p>Can Request: {permissionStatus === 'default' ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Service Worker Status</h4>
          <div className="space-y-1 text-sm">
            <p>Controller: {navigator.serviceWorker?.controller ? <Badge>Active</Badge> : <Badge variant="outline">None</Badge>}</p>
            <p>Status: {getStatusBadge(swStatus)}</p>
            <Button onClick={checkServiceWorkerStatus} size="sm" variant="outline" className="mt-1">
              Recheck SW
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">VAPID Key Test</h4>
          <div className="space-y-1 text-sm">
            <p>Status: {getStatusBadge(vapidKeyStatus)}</p>
            <Button onClick={testVapidKey} size="sm" variant="outline" className="mt-1">
              Test VAPID Key
            </Button>
          </div>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Push Subscription Check</h4>
          <div className="space-y-1 text-sm">
            <p>Status: {getStatusBadge(subscriptionCheck)}</p>
            <Button onClick={checkCurrentSubscription} size="sm" variant="outline" className="mt-1">
              Check Subscription
            </Button>
          </div>
        </div>

        {!user && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Action Required:</strong> You must be signed in to enable push notifications.
            </p>
          </div>
        )}

        {!support.isSecure && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">
              <strong>Security Issue:</strong> Push notifications require HTTPS or localhost.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};