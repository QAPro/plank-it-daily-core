import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Target,
  AlertTriangle,
  Zap,
  Clock,
  BarChart3
} from "lucide-react";
import { useABTestStatistics } from "@/hooks/useABTesting";
import { ABTestExperiment } from "@/services/abTestingService";

interface RealTimeAnalyticsDashboardProps {
  experiment: ABTestExperiment;
}

export const RealTimeAnalyticsDashboard = ({ experiment }: RealTimeAnalyticsDashboardProps) => {
  const { statistics, loading, refetch } = useABTestStatistics(experiment.id);
  const [realTimeData, setRealTimeData] = useState<any[]>([]);
  const [isLive, setIsLive] = useState(false);

  // Real-time updates disabled - WebSocket integration needed
  // External integrations required:
  // - WebSocket infrastructure for live data streaming
  // - Analytics platforms (Google Analytics, Mixpanel, Amplitude)
  // - Real-time event processing system

  const controlStats = statistics.find(s => s.variant === 'control');
  const variantStats = statistics.find(s => s.variant === 'variant_a');

  // Calculate lift and significance
  const lift = controlStats && variantStats 
    ? ((variantStats.conversion_rate - controlStats.conversion_rate) / controlStats.conversion_rate) * 100
    : 0;

  const isSignificant = variantStats?.statistical_significance && variantStats.p_value && variantStats.p_value < 0.05;

  // Placeholder data - requires external analytics integration
  const funnelData = [];
  const cohortData = [];
  const pieData = [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading real-time analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Live Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLive && (
            <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-green-700 dark:text-green-300">Live</span>
            </div>
          )}
          <h3 className="text-lg font-semibold">Real-Time Analytics</h3>
        </div>
        <Badge variant="outline" className="gap-1">
          <Clock className="h-3 w-3" />
          Last updated: {new Date().toLocaleTimeString()}
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Lift</p>
                <p className={`text-2xl font-bold ${lift > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {lift > 0 ? '+' : ''}{lift.toFixed(2)}%
                </p>
              </div>
              {lift > 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Significance</p>
                <p className={`text-2xl font-bold ${isSignificant ? 'text-green-600' : 'text-orange-600'}`}>
                  {isSignificant ? 'Yes' : 'No'}
                </p>
              </div>
              {isSignificant ? (
                <Target className="h-4 w-4 text-green-600" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">
                  {((controlStats?.total_users || 0) + (variantStats?.total_users || 0)).toLocaleString()}
                </p>
              </div>
              <Users className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">P-Value</p>
                <p className="text-2xl font-bold">
                  {variantStats?.p_value?.toFixed(3) || '—'}
                </p>
              </div>
              <BarChart3 className="h-4 w-4 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-Time Conversion Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Conversion Trends
          </CardTitle>
          <CardDescription>
            Live conversion rates over time (updates every 30 seconds)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-sm font-medium">Real-time analytics not yet implemented</p>
                <p className="text-xs">Requires WebSocket integration and streaming analytics platform</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              User journey from visit to conversion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="text-sm font-medium">Funnel analysis not yet implemented</p>
                  <p className="text-xs">Requires user behavior tracking and analytics platform integration</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Traffic Distribution</CardTitle>
            <CardDescription>
              Current experiment traffic allocation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <p className="text-sm font-medium">Traffic distribution visualization not yet implemented</p>
                  <p className="text-xs">Requires real-time traffic analytics integration</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cohort Retention Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Cohort Retention Analysis</CardTitle>
          <CardDescription>
            User retention by variant over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-sm font-medium">Cohort retention analysis not yet implemented</p>
                <p className="text-xs">Requires user segmentation data and retention tracking system</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Early Stopping Recommendation */}
      {isSignificant && Math.abs(lift) > 10 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Zap className="h-5 w-5 text-orange-600" />
              <div>
                <h4 className="font-semibold text-orange-800 dark:text-orange-200">
                  Early Stopping Recommendation
                </h4>
                <p className="text-sm text-orange-700 dark:text-orange-300">
                  This experiment has reached statistical significance with a substantial lift of {lift.toFixed(1)}%. 
                  Consider stopping early to implement the winning variant.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};