import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RefreshCw, AlertTriangle, CheckCircle, Settings, Trash2 } from 'lucide-react';
import { logger } from '@/utils/productionLogger';

export const ServiceWorkerDebugPanel = () => {
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [swStatus, setSwStatus] = useState<string>('unknown');
  const [cacheStatus, setCacheStatus] = useState<string[]>([]);
  const [swBypass, setSwBypass] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check if service worker is bypassed
    const bypass = localStorage.getItem('sw-bypass') === 'true';
    setSwBypass(bypass);

    checkServiceWorkerStatus();
    checkCacheStatus();
  }, []);

  const checkServiceWorkerStatus = async () => {
    if (!('serviceWorker' in navigator)) {
      setSwStatus('not_supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      setSwRegistration(registration || null);
      
      if (!registration) {
        setSwStatus('not_registered');
      } else if (registration.active) {
        setSwStatus('active');
      } else if (registration.installing) {
        setSwStatus('installing');
      } else if (registration.waiting) {
        setSwStatus('waiting');
      } else {
        setSwStatus('unknown');
      }
    } catch (error) {
      logger.error('Failed to check service worker status', { error: error.message });
      setSwStatus('error');
    }
  };

  const checkCacheStatus = async () => {
    if (!('caches' in window)) {
      setCacheStatus(['Cache API not supported']);
      return;
    }

    try {
      const cacheNames = await caches.keys();
      setCacheStatus(cacheNames.length > 0 ? cacheNames : ['No caches found']);
    } catch (error) {
      logger.error('Failed to check cache status', { error: error.message });
      setCacheStatus(['Error checking caches']);
    }
  };

  const toggleServiceWorkerBypass = (enabled: boolean) => {
    setSwBypass(enabled);
    if (enabled) {
      localStorage.setItem('sw-bypass', 'true');
      logger.info('Service worker bypass enabled');
    } else {
      localStorage.removeItem('sw-bypass');
      logger.info('Service worker bypass disabled');
    }
    
    // Suggest page reload
    if (confirm('Service worker bypass setting changed. Reload page to apply changes?')) {
      window.location.reload();
    }
  };

  const updateServiceWorker = async () => {
    if (!swRegistration) return;
    
    setIsUpdating(true);
    try {
      await swRegistration.update();
      logger.info('Service worker update triggered');
      
      // Check for waiting SW
      if (swRegistration.waiting) {
        swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      
      await checkServiceWorkerStatus();
    } catch (error) {
      logger.error('Failed to update service worker', { error: error.message });
    } finally {
      setIsUpdating(false);
    }
  };

  const clearAllCaches = async () => {
    if (!('caches' in window)) return;
    
    if (!confirm('Clear all service worker caches? This will remove offline data.')) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
      logger.info('All caches cleared', { clearedCaches: cacheNames });
      await checkCacheStatus();
    } catch (error) {
      logger.error('Failed to clear caches', { error: error.message });
    }
  };

  const unregisterServiceWorker = async () => {
    if (!swRegistration) return;
    
    if (!confirm('Unregister service worker? This will disable offline functionality.')) {
      return;
    }

    try {
      await swRegistration.unregister();
      logger.info('Service worker unregistered');
      await checkServiceWorkerStatus();
    } catch (error) {
      logger.error('Failed to unregister service worker', { error: error.message });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'installing':
      case 'waiting':
        return <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'installing':
      case 'waiting': return 'secondary';
      default: return 'destructive';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Service Worker Debug Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Bypass Toggle */}
        <Alert className={swBypass ? "border-orange-200 bg-orange-50" : ""}>
          <AlertTriangle className={`h-4 w-4 ${swBypass ? "text-orange-600" : "text-blue-600"}`} />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <strong>Service Worker Bypass Mode</strong>
                <p className="text-sm">
                  {swBypass 
                    ? "Service worker registration is disabled for debugging" 
                    : "Service worker will register normally"
                  }
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="sw-bypass"
                  checked={swBypass}
                  onCheckedChange={toggleServiceWorkerBypass}
                />
                <Label htmlFor="sw-bypass">Bypass</Label>
              </div>
            </div>
          </AlertDescription>
        </Alert>

        {/* Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Registration Status</span>
                {getStatusIcon(swStatus)}
              </div>
              <Badge variant={getStatusColor(swStatus)} className="capitalize">
                {swStatus.replace('_', ' ')}
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cache Status</span>
                <Badge variant="outline">{cacheStatus.length} caches</Badge>
              </div>
              <div className="text-xs space-y-1">
                {cacheStatus.slice(0, 3).map((cache, index) => (
                  <div key={index} className="truncate">{cache}</div>
                ))}
                {cacheStatus.length > 3 && (
                  <div className="text-muted-foreground">
                    +{cacheStatus.length - 3} more...
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Worker Actions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Service Worker Actions</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={updateServiceWorker}
              disabled={!swRegistration || isUpdating}
              size="sm"
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
              Update SW
            </Button>
            
            <Button
              onClick={clearAllCaches}
              size="sm"
              variant="outline"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Clear Caches
            </Button>
            
            <Button
              onClick={unregisterServiceWorker}
              disabled={!swRegistration}
              size="sm"
              variant="destructive"
            >
              Unregister SW
            </Button>
          </div>
        </div>

        {/* Refresh Actions */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Debug Actions</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => {
                checkServiceWorkerStatus();
                checkCacheStatus();
              }}
              size="sm"
              variant="outline"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Status
            </Button>
            
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
            >
              Reload Page
            </Button>
          </div>
        </div>

        {/* SW Registration Details */}
        {swRegistration && (
          <Card>
            <CardContent className="p-3">
              <div className="text-xs font-mono space-y-1">
                <div><strong>Scope:</strong> {swRegistration.scope}</div>
                <div><strong>Update Via Cache:</strong> {swRegistration.updateViaCache}</div>
                {swRegistration.active && (
                  <div><strong>Script URL:</strong> {swRegistration.active.scriptURL}</div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </CardContent>
    </Card>
  );
};