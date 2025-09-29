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

  // Simulate real-time data updates
  useEffect(() => {
    if (experiment.status === 'running') {
      setIsLive(true);
      const interval = setInterval(() => {
        refetch();
        // Simulate adding new data points
        const now = new Date();
        const newDataPoint = {
          time: now.toLocaleTimeString(),
          control_rate: Math.random() * 0.1 + 0.15,
          variant_rate: Math.random() * 0.12 + 0.16,
          sample_size: Math.floor(Math.random() * 100) + 1000
        };
        setRealTimeData(prev => [...prev.slice(-19), newDataPoint]);
      }, 30000); // Update every 30 seconds

      return () => {
        clearInterval(interval);
        setIsLive(false);
      };
    }
  }, [experiment.status, refetch]);

  const controlStats = statistics.find(s => s.variant === 'control');
  const variantStats = statistics.find(s => s.variant === 'variant_a');

  // Calculate lift and significance
  const lift = controlStats && variantStats 
    ? ((variantStats.conversion_rate - controlStats.conversion_rate) / controlStats.conversion_rate) * 100
    : 0;

  const isSignificant = variantStats?.statistical_significance && variantStats.p_value && variantStats.p_value < 0.05;

  // Sample funnel data
  const funnelData = [
    { name: 'Visits', control: 10000, variant: 10000 },
    { name: 'Engagement', control: 7500, variant: 8200 },
    { name: 'Clicks', control: 1500, variant: 1800 },
    { name: 'Conversions', control: controlStats?.conversions || 0, variant: variantStats?.conversions || 0 },
  ];

  // Sample cohort data
  const cohortData = [
    { cohort: 'Day 1', control: 85, variant: 88 },
    { cohort: 'Day 7', control: 72, variant: 79 },
    { cohort: 'Day 14', control: 65, variant: 71 },
    { cohort: 'Day 30', control: 58, variant: 66 },
  ];

  const pieData = [
    { name: 'Control', value: controlStats?.total_users || 0, color: '#8884d8' },
    { name: 'Variant A', value: variantStats?.total_users || 0, color: '#82ca9d' },
  ];

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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={realTimeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis tickFormatter={(value) => `${(value * 100).toFixed(1)}%`} />
                <Tooltip 
                  formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Conversion Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="control_rate" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Control"
                  dot={{ r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="variant_rate" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Variant A"
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={funnelData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" />
                  <Tooltip />
                  <Bar dataKey="control" fill="#8884d8" name="Control" />
                  <Bar dataKey="variant" fill="#82ca9d" name="Variant A" />
                </BarChart>
              </ResponsiveContainer>
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
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
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
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cohortData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="cohort" />
                <YAxis tickFormatter={(value) => `${value}%`} />
                <Tooltip formatter={(value: number) => [`${value}%`, 'Retention Rate']} />
                <Line 
                  type="monotone" 
                  dataKey="control" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="Control"
                />
                <Line 
                  type="monotone" 
                  dataKey="variant" 
                  stroke="#82ca9d" 
                  strokeWidth={2}
                  name="Variant A"
                />
              </LineChart>
            </ResponsiveContainer>
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