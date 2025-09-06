import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, Loader2, Bell, ExternalLink, Info, Database, Monitor, Smartphone, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { supabase } from '@/integrations/supabase/client';
import { isInIframe, openInNewTab } from '@/utils/iframe';
import { toast } from 'sonner';

interface DatabaseSubscription {
  id: string;
  user_id: string;
  endpoint: string;
  p256dh_key: string;
  auth_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const EnhancedPushNotificationDebug: React.FC = () => {
  const { user } = useAuth();
  const {
    isSupported,
    isSubscribed,
    isLoading,
    subscribe,
    unsubscribe,
    resubscribe,
    forceSubscribeIgnorePermission,
    nuclearReset
  } = usePushNotifications();

  const [debugInfo, setDebugInfo] = useState<any>({});
  const [dbSubscriptions, setDbSubscriptions] = useState<DatabaseSubscription[]>([]);
  const [browserSubscription, setBrowserSubscription] = useState<PushSubscription | null>(null);
  const [lastSync, setLastSync] = useState<string>('');
  const [isRepairing, setIsRepairing] = useState(false);
  
  const inIframe = isInIframe();

  const fetchDatabaseSubscriptions = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true);
      
      if (error) {
        console.error('Failed to fetch DB subscriptions:', error);
        return;
      }
      
      setDbSubscriptions(data || []);
    } catch (error) {
      console.error('Error fetching DB subscriptions:', error);
    }
  };

  const fetchBrowserSubscription = async () => {
    if (!('serviceWorker' in navigator)) return;
    
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setBrowserSubscription(subscription);
    } catch (error) {
      console.error('Error fetching browser subscription:', error);
    }
  };

  const handleRepairSubscription = async () => {
    if (!user) {
      toast.error('Please log in to repair subscription');
      return;
    }
    
    setIsRepairing(true);
    try {
      // First, clean up any existing database entries
      const { error: deleteError } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', user.id);
      
      if (deleteError) {
        console.error('Error cleaning up old subscriptions:', deleteError);
      }
      
      // Unsubscribe from browser
      if (browserSubscription) {
        await browserSubscription.unsubscribe();
      }
      
      // Wait a moment for cleanup
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create fresh subscription
      const result = await subscribe();
      
      if (result) {
        toast.success('Subscription repaired successfully!');
        setLastSync(new Date().toLocaleTimeString());
        await fetchDatabaseSubscriptions();
        await fetchBrowserSubscription();
      } else {
        toast.error('Failed to repair subscription');
      }
    } catch (error) {
      console.error('Error repairing subscription:', error);
      toast.error('Error repairing subscription');
    } finally {
      setIsRepairing(false);
    }
  };

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
        inIframe,
        dbSubscriptionCount: dbSubscriptions.length,
        hasBrowserSubscription: !!browserSubscription,
        subscriptionMismatch: dbSubscriptions.length === 0 && !!browserSubscription
      };
      setDebugInfo(info);
    };

    updateDebugInfo();
    fetchDatabaseSubscriptions();
    fetchBrowserSubscription();
    
    const interval = setInterval(() => {
      updateDebugInfo();
      fetchDatabaseSubscriptions();
      fetchBrowserSubscription();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [user, isSupported, isSubscribed, isLoading, dbSubscriptions.length, browserSubscription]);

  const getStatusIcon = (condition: boolean) => {
    return condition ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-red-500" />
    );
  };

  const syncStatus = dbSubscriptions.length > 0 && !!browserSubscription;
  const hasMismatch = (dbSubscriptions.length === 0 && !!browserSubscription) || 
                     (dbSubscriptions.length > 0 && !browserSubscription);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Enhanced Push Notifications Debug
        </CardTitle>
        <CardDescription>
          Advanced debugging with database sync status
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {inIframe && (
          <Alert className="border-orange-200 bg-orange-50">
            <Info className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>Iframe Mode:</strong> Push notifications blocked in preview. 
              <Button 
                variant="link" 
                size="sm" 
                onClick={openInNewTab}
                className="h-auto p-0 ml-1 text-orange-600"
              >
                <ExternalLink className="h-3 w-3 mr-1" />
                Open standalone
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {hasMismatch && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>Sync Issue Detected:</strong> Browser and database subscriptions are out of sync.
              <Button 
                variant="link" 
                size="sm" 
                onClick={handleRepairSubscription}
                disabled={isRepairing}
                className="h-auto p-0 ml-1 text-red-600"
              >
                {isRepairing ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : <RefreshCw className="h-3 w-3 mr-1" />}
                Repair Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Database Status */}
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Database className="h-4 w-4" />
                Database Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon(dbSubscriptions.length > 0)}
                <span>Stored subscriptions: {dbSubscriptions.length}</span>
              </div>
              {dbSubscriptions.map((sub, index) => (
                <div key={sub.id} className="text-xs bg-muted p-2 rounded">
                  <div>ID: {sub.id.slice(0, 8)}...</div>
                  <div>Endpoint: {sub.endpoint.slice(0, 30)}...</div>
                  <div>Created: {new Date(sub.created_at).toLocaleString()}</div>
                  <Badge variant="outline" className="mt-1">Active</Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Browser Status */}
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Browser Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                {getStatusIcon(!!browserSubscription)}
                <span>Browser subscription: {browserSubscription ? 'Active' : 'None'}</span>
              </div>
              {browserSubscription && (
                <div className="text-xs bg-muted p-2 rounded">
                  <div>Endpoint: {browserSubscription.endpoint.slice(0, 30)}...</div>
                  <div>Expiration: {browserSubscription.expirationTime || 'Never'}</div>
                  <Badge variant="outline" className="mt-1">Active</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sync Status */}
        <Card className={`border-l-4 ${syncStatus ? 'border-l-green-500' : 'border-l-yellow-500'}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Sync Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm">
              {getStatusIcon(syncStatus)}
              <span>Database ↔ Browser: {syncStatus ? 'Synced' : 'Out of Sync'}</span>
              {lastSync && (
                <Badge variant="outline" className="text-xs">
                  Last sync: {lastSync}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              onClick={handleRepairSubscription}
              disabled={isLoading || isRepairing}
              variant={hasMismatch ? "default" : "outline"}
            >
              {isRepairing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Repairing...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Repair Subscription
                </>
              )}
            </Button>
            
            <Button 
              onClick={resubscribe}
              disabled={isLoading || isRepairing}
              variant="outline"
            >
              Force Refresh
            </Button>
          </div>
          
          <Button 
            onClick={nuclearReset}
            disabled={isLoading || isRepairing}
            variant="destructive"
            className="w-full"
          >
            🚨 Nuclear Reset (Clear All Data)
          </Button>
        </div>

        {/* Debug JSON */}
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
          <pre>{JSON.stringify({
            ...debugInfo,
            dbSubscriptions: dbSubscriptions.length,
            browserEndpoint: browserSubscription?.endpoint?.slice(0, 50) + '...' || 'none'
          }, null, 2)}</pre>
        </div>
      </CardContent>
    </Card>
  );
};