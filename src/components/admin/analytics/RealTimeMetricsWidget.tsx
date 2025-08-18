
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Radio, Users, Activity, Clock } from 'lucide-react';
import { useAdminAnalytics } from '@/contexts/AdminAnalyticsContext';

const RealTimeMetricsWidget = () => {
  const { realTimeMetrics, isRealTimeEnabled, toggleRealTime } = useAdminAnalytics();

  return (
    <Card className="border-2 border-dashed border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className={`h-4 w-4 ${isRealTimeEnabled ? 'text-green-500 animate-pulse' : 'text-gray-400'}`} />
            <CardTitle className="text-lg">Real-Time Metrics</CardTitle>
            {isRealTimeEnabled && (
              <Badge variant="secondary" className="bg-green-100 text-green-800 animate-pulse">
                LIVE
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Real-time</span>
            <Switch
              checked={isRealTimeEnabled}
              onCheckedChange={toggleRealTime}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Users className="h-5 w-5 mx-auto mb-1 text-blue-600" />
            <p className="text-xl font-bold text-blue-600">{realTimeMetrics.activeUsers}</p>
            <p className="text-xs text-muted-foreground">Active Users Today</p>
          </div>
          <div className="text-center p-3 bg-white/60 rounded-lg">
            <Activity className="h-5 w-5 mx-auto mb-1 text-green-600" />
            <p className="text-xl font-bold text-green-600">{realTimeMetrics.sessionsToday}</p>
            <p className="text-xs text-muted-foreground">Sessions Today</p>
          </div>
        </div>
        
        {isRealTimeEnabled && (
          <div className="text-center p-2 bg-white/40 rounded border">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              Last updated: {realTimeMetrics.lastUpdated.toLocaleTimeString()}
            </div>
          </div>
        )}
        
        {!isRealTimeEnabled && (
          <p className="text-xs text-center text-muted-foreground">
            Enable real-time mode to see live metrics and database updates
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default RealTimeMetricsWidget;
