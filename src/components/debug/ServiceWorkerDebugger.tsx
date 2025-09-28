import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Copy, RefreshCw, Bell, AlertCircle, CheckCircle } from 'lucide-react';
import { logInfo } from '@/utils/productionLogger';

interface ServiceWorkerDebuggerProps {
  onClose?: () => void;
}

export function ServiceWorkerDebugger({ onClose }: ServiceWorkerDebuggerProps) {
  const [swStatus, setSwStatus] = useState<string>('checking');
  const [swDetails, setSwDetails] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any>(null);
  const [permissionDetails, setPermissionDetails] = useState<any>(null);
  const { toast } = useToast();

  const checkServiceWorkerStatus = async () => {
    setIsLoading(true);
    try {
      if (!('serviceWorker' in navigator)) {
        setSwStatus('not-supported');
        setSwDetails({ error: 'Service Worker not supported in this browser' });
        return;
      }

      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        setSwStatus('not-registered');
        setSwDetails({ error: 'No service worker registered' });
        return;
      }

      const details = {
        scope: registration.scope,
        state: registration.active?.state || 'unknown',
        scriptURL: registration.active?.scriptURL || 'unknown',
        installing: !!registration.installing,
        waiting: !!registration.waiting,
        active: !!registration.active,
        updateFound: !!registration.waiting
      };

      setSwDetails(details);
      
      if (registration.active) {
        setSwStatus('active');
      } else if (registration.installing) {
        setSwStatus('installing');
      } else if (registration.waiting) {
        setSwStatus('waiting');
      } else {
        setSwStatus('inactive');
      }

      // Check notification permission details
      const permission = await checkNotificationPermission();
      setPermissionDetails(permission);

    } catch (error) {
      console.error('Error checking service worker:', error);
      setSwStatus('error');
      setSwDetails({ error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const checkNotificationPermission = async () => {
    const permission = Notification.permission;
    const userAgent = navigator.userAgent;
    const platform = navigator.platform;
    
    // Detect browser and OS
    const isChrome = userAgent.includes('Chrome');
    const isFirefox = userAgent.includes('Firefox');
    const isSafari = userAgent.includes('Safari') && !isChrome;
    const isEdge = userAgent.includes('Edg');
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = userAgent.includes('Android');

    return {
      permission,
      userAgent,
      platform,
      browser: {
        chrome: isChrome,
        firefox: isFirefox,
        safari: isSafari,
        edge: isEdge
      },
      device: {
        mobile: isMobile,
        ios: isIOS,
        android: isAndroid
      },
      maxActions: getMaxNotificationActions(userAgent),
      vibrationSupported: 'vibrate' in navigator
    };
  };

  const getMaxNotificationActions = (userAgent: string) => {
    if (userAgent.includes('Chrome')) return 2;
    if (userAgent.includes('Firefox')) return 0;
    if (userAgent.includes('Safari')) return 0;
    return 'unknown';
  };

  const testDirectNotification = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast({
          title: "Permission Denied",
          description: "Notification permission is required for testing",
          variant: "destructive"
        });
        return;
      }

      const notification = new Notification('Test Direct Notification', {
        body: 'This is a direct browser notification (not through push)',
        icon: '/favicon.ico',
        tag: 'direct-test',
        requireInteraction: false
      });

      notification.onclick = () => {
        logInfo('[Direct] Notification clicked');
        notification.close();
      };

      setTestResults(prev => ({
        ...prev,
        directNotification: {
          success: true,
          timestamp: new Date().toISOString(),
          message: 'Direct notification sent successfully'
        }
      }));

      toast({
        title: "Direct Notification Sent",
        description: "Check if you received the notification"
      });

    } catch (error) {
      console.error('Direct notification error:', error);
      setTestResults(prev => ({
        ...prev,
        directNotification: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const testServiceWorkerNotification = async () => {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error('No service worker registered');
      }

      await registration.showNotification('Test SW Notification', {
        body: 'This is a service worker notification',
        icon: '/favicon.ico',
        tag: 'sw-test',
        data: { test: true, timestamp: Date.now() }
      });

      setTestResults(prev => ({
        ...prev,
        serviceWorkerNotification: {
          success: true,
          timestamp: new Date().toISOString(),
          message: 'Service worker notification sent successfully'
        }
      }));

      toast({
        title: "SW Notification Sent",
        description: "Check if you received the service worker notification"
      });

    } catch (error) {
      console.error('SW notification error:', error);
      setTestResults(prev => ({
        ...prev,
        serviceWorkerNotification: {
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        }
      }));
    }
  };

  const copyDiagnostics = async () => {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      serviceWorker: { status: swStatus, details: swDetails },
      permission: permissionDetails,
      testResults,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(diagnostics, null, 2));
      toast({
        title: "Diagnostics Copied",
        description: "Service worker diagnostics copied to clipboard"
      });
    } catch (error) {
      console.error('Copy failed:', error);
      toast({
        title: "Copy Failed",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    checkServiceWorkerStatus();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'installing':
        return <Badge variant="secondary"><RefreshCw className="w-3 h-3 mr-1" />Installing</Badge>;
      case 'waiting':
        return <Badge variant="secondary"><AlertCircle className="w-3 h-3 mr-1" />Waiting</Badge>;
      case 'error':
      case 'not-supported':
      case 'not-registered':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Error</Badge>;
      default:
        return <Badge variant="outline"><RefreshCw className="w-3 h-3 mr-1" />Checking</Badge>;
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Service Worker Debugger</CardTitle>
            <CardDescription>
              Debug service worker status and notification handling
            </CardDescription>
          </div>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Service Worker Status */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Service Worker Status</h3>
            <div className="flex gap-2">
              {getStatusBadge(swStatus)}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkServiceWorkerStatus}
                disabled={isLoading}
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          
          {swDetails && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <pre>{JSON.stringify(swDetails, null, 2)}</pre>
            </div>
          )}
        </div>

        <Separator />

        {/* Permission Details */}
        {permissionDetails && (
          <div>
            <h3 className="font-semibold mb-3">Browser & Platform Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Permission:</strong> {permissionDetails.permission}
              </div>
              <div>
                <strong>Platform:</strong> {permissionDetails.platform}
              </div>
              <div>
                <strong>Browser:</strong> {Object.entries(permissionDetails.browser).filter(([_, value]) => value).map(([key]) => key).join(', ') || 'Unknown'}
              </div>
              <div>
                <strong>Device:</strong> {Object.entries(permissionDetails.device).filter(([_, value]) => value).map(([key]) => key).join(', ') || 'Desktop'}
              </div>
              <div>
                <strong>Max Actions:</strong> {permissionDetails.maxActions}
              </div>
              <div>
                <strong>Vibration:</strong> {permissionDetails.vibrationSupported ? 'Yes' : 'No'}
              </div>
            </div>
          </div>
        )}

        <Separator />

        {/* Notification Tests */}
        <div>
          <h3 className="font-semibold mb-3">Notification Tests</h3>
          <div className="flex gap-2 mb-4">
            <Button onClick={testDirectNotification} variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Test Direct
            </Button>
            <Button onClick={testServiceWorkerNotification} variant="outline">
              <Bell className="w-4 h-4 mr-2" />
              Test SW
            </Button>
          </div>

          {testResults && (
            <div className="bg-muted p-3 rounded-md text-sm">
              <pre>{JSON.stringify(testResults, null, 2)}</pre>
            </div>
          )}
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex gap-2">
          <Button onClick={copyDiagnostics} variant="outline">
            <Copy className="w-4 h-4 mr-2" />
            Copy Diagnostics
          </Button>
        </div>

        {/* Platform-specific tips */}
        {permissionDetails && (
          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
            <h4 className="font-semibold mb-2">Platform-Specific Tips:</h4>
            <ul className="text-sm space-y-1">
              {permissionDetails.device.ios && (
                <li>• iOS: Add to home screen for better notification support</li>
              )}
              {permissionDetails.device.android && (
                <li>• Android: Check Do Not Disturb and app notification settings</li>
              )}
              {permissionDetails.browser.firefox && (
                <li>• Firefox: Notification actions are not supported</li>
              )}
              {permissionDetails.browser.safari && (
                <li>• Safari: Limited push notification support</li>
              )}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}