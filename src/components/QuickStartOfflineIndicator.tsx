
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Download, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import { useOfflineCapability } from '@/hooks/useOfflineCapability';
import { motion, AnimatePresence } from 'framer-motion';

const QuickStartOfflineIndicator: React.FC = () => {
  const { 
    offlineStatus, 
    isSyncing, 
    syncOfflineSessions,
    clearOfflineData,
    isQuickStartAvailable 
  } = useOfflineCapability();

  if (offlineStatus.isOnline && offlineStatus.pendingSessions === 0) {
    return null; // Don't show indicator when online with no pending sessions
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4"
      >
        <Card className={`border-2 ${
          offlineStatus.isOnline 
            ? 'border-green-200 bg-green-50' 
            : 'border-orange-200 bg-orange-50'
        }`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {offlineStatus.isOnline ? (
                  <Wifi className="w-5 h-5 text-green-600" />
                ) : (
                  <WifiOff className="w-5 h-5 text-orange-600" />
                )}
                
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">
                      {offlineStatus.isOnline ? 'Connected' : 'Offline Mode'}
                    </span>
                    
                    {offlineStatus.hasCachedData && (
                      <Badge variant="secondary" className="text-xs">
                        <Download className="w-3 h-3 mr-1" />
                        Cached
                      </Badge>
                    )}
                    
                    {isQuickStartAvailable && (
                      <Badge variant="default" className="text-xs">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Quick Start Ready
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mt-1">
                    {offlineStatus.isOnline ? (
                      offlineStatus.pendingSessions > 0 
                        ? `${offlineStatus.pendingSessions} workout${offlineStatus.pendingSessions !== 1 ? 's' : ''} pending sync`
                        : 'All workouts synced'
                    ) : (
                      isQuickStartAvailable 
                        ? 'Workouts available offline'
                        : 'Limited offline functionality'
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {offlineStatus.pendingSessions > 0 && offlineStatus.isOnline && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={syncOfflineSessions}
                    disabled={isSyncing}
                    className="text-xs"
                  >
                    {isSyncing ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Sync Now
                      </>
                    )}
                  </Button>
                )}
                
                {!offlineStatus.isOnline && !isQuickStartAvailable && (
                  <div className="flex items-center text-orange-600">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    <span className="text-xs">Cache data when online</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Offline Instructions */}
            {!offlineStatus.isOnline && isQuickStartAvailable && (
              <div className="mt-3 p-2 bg-white rounded border border-orange-200">
                <p className="text-xs text-muted-foreground">
                  💡 <strong>Offline Mode:</strong> Your last workout settings are cached. 
                  Complete workouts will sync automatically when connection returns.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default QuickStartOfflineIndicator;