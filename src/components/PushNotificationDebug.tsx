import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const PushNotificationDebug = () => {
  const { user, loading } = useAuth();
  
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
          <h4 className="font-semibold mb-2">Service Worker Status</h4>
          <div className="space-y-1 text-sm">
            <p>Controller: {navigator.serviceWorker?.controller ? <Badge>Active</Badge> : <Badge variant="outline">None</Badge>}</p>
            <p>Ready State: {navigator.serviceWorker ? 'Available' : 'Not Available'}</p>
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