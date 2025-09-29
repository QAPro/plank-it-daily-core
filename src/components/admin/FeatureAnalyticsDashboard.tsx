import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeatureAdoptionTrends } from "@/hooks/useFeatureAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Users, Activity, Target } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FeatureAnalyticsDashboard: React.FC = () => {
  const { isAdmin } = useAdmin();
  const [selectedTimeframe, setSelectedTimeframe] = useState("30");
  const [searchFeature, setSearchFeature] = useState("");
  
  const { data: adoptionTrends, isLoading: trendsLoading } = useFeatureAdoptionTrends(parseInt(selectedTimeframe));

  if (!isAdmin) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Access denied. Admin privileges required.</p>
        </CardContent>
      </Card>
    );
  }

  // Real feature metrics from Supabase database
  const { data: featureMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['feature-metrics'],
    queryFn: async () => {
      const { data: flags } = await supabase.from('feature_flags').select('feature_name').eq('is_enabled', true);
      if (!flags || flags.length === 0) {
        return [{
          feature_name: "No Features Available",
          total_users: 0,
          active_users_24h: 0,
          active_users_7d: 0,
          active_users_30d: 0,
          adoption_rate: 0,
          engagement_score: 0,
          performance_impact: "unknown" as const,
          user_satisfaction: 0,
          placeholder_message: "No active feature flags found. Create feature flags to see analytics."
        }];
      }

      // Fetch analytics for each feature using the database function
      const featureAnalytics = await Promise.all(
        flags.map(async (flag) => {
          const { data, error } = await supabase.rpc('get_feature_analytics', { 
            _feature_name: flag.feature_name 
          });
          
          if (error || !data || data.length === 0) {
            return {
              feature_name: flag.feature_name,
              total_users: 0,
              active_users_24h: 0,
              active_users_7d: 0,
              active_users_30d: 0,
              adoption_rate: 0,
              engagement_score: 0,
              performance_impact: "unknown" as const,
              user_satisfaction: 0,
              placeholder_message: "Analytics integration required - Connect to real usage tracking system"
            };
          }
          
          return {
            ...(data[0] as any),
            placeholder_message: data[0]?.total_users === 0 ? "Analytics integration required - Connect to real usage tracking system" : undefined
          };
        })
      );

      return featureAnalytics;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const performanceIntegrationNote = {
    message: "Performance monitoring requires APM tool integration (New Relic, DataDog, etc.)",
    features: [
      "Load time monitoring",
      "Error rate tracking", 
      "CPU usage analysis",
      "Memory consumption metrics"
    ]
  };

  const getPerformanceColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredMetrics = (featureMetrics || []).filter(metric =>
    metric.feature_name.toLowerCase().includes(searchFeature.toLowerCase())
  );

  const hasPlaceholderData = filteredMetrics.some((m: any) => m.placeholder_message);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Feature Analytics Dashboard</h2>
          <p className="text-muted-foreground">Monitor feature adoption, performance, and user engagement</p>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Search features..."
            value={searchFeature}
            onChange={(e) => setSearchFeature(e.target.value)}
            className="w-64"
          />
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 days</SelectItem>
              <SelectItem value="30">30 days</SelectItem>
              <SelectItem value="90">90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="adoption">Adoption Trends</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="ab-testing">A/B Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Features</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredMetrics.length}</div>
                <p className="text-xs text-muted-foreground">Active features</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Adoption Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredMetrics.length > 0 
                    ? (filteredMetrics.reduce((sum, m) => sum + m.adoption_rate, 0) / filteredMetrics.length).toFixed(1)
                    : '0'}%
                </div>
                <p className="text-xs text-muted-foreground">Across all features</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users (24h)</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredMetrics.reduce((sum, m) => sum + m.active_users_24h, 0)}
                </div>
                <p className="text-xs text-muted-foreground">Daily active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Engagement</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {filteredMetrics.length > 0 
                    ? (filteredMetrics.reduce((sum, m) => sum + m.engagement_score, 0) / filteredMetrics.length).toFixed(1)
                    : '0'}
                </div>
                <p className="text-xs text-muted-foreground">Out of 10</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Feature Performance Overview</CardTitle>
              <p className="text-sm text-muted-foreground">
                Real feature usage data from your application
              </p>
            </CardHeader>
            <CardContent>
              {metricsLoading ? (
                <div className="p-8 text-center">
                  <Activity className="w-8 h-8 mx-auto animate-pulse text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground">Loading feature analytics...</p>
                </div>
              ) : hasPlaceholderData ? (
                <div className="p-8 text-center bg-blue-50 border border-blue-200 rounded-lg">
                  <Activity className="w-12 h-12 mx-auto text-blue-500 mb-4" />
                  <h4 className="font-medium text-blue-800 mb-2">
                    📊 Analytics Integration Required
                  </h4>
                  <p className="text-sm text-blue-700 mb-4">
                    Connect usage tracking to see real feature analytics and user engagement metrics
                  </p>
                  <div className="text-xs text-blue-600 space-y-1">
                    <div>• Recommended: Google Analytics, Mixpanel, or custom event tracking</div>
                    <div>• Database stores usage events in feature_usage_events table</div>
                    <div>• Use get_feature_analytics() function for real-time data</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredMetrics.map((metric) => (
                    <div key={metric.feature_name} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${getPerformanceColor(metric.performance_impact)}`} />
                        <div>
                          <h4 className="font-medium">{metric.feature_name.replace(/_/g, ' ')}</h4>
                          <div className="flex gap-4 text-sm text-muted-foreground">
                            <span>{metric.total_users} total users</span>
                            <span>{metric.active_users_24h} active (24h)</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">{metric.adoption_rate}% adoption</Badge>
                        <Badge variant="secondary">Engagement: {metric.engagement_score}/10</Badge>
                        <Badge variant="outline">⭐ {metric.user_satisfaction}/5</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adoption" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Adoption Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={adoptionTrends || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="adoption_rate" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Performance monitoring integration required
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
                  <h4 className="font-medium text-amber-800 mb-2">
                    📊 Performance Monitoring Required
                  </h4>
                  <p className="text-sm text-amber-700 mb-3">
                    {performanceIntegrationNote.message}
                  </p>
                  <div className="space-y-1">
                    {performanceIntegrationNote.features.map((feature, index) => (
                      <div key={index} className="text-xs text-amber-600">
                        • {feature}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                View results from configured A/B tests
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-center">
                  <h4 className="font-medium text-blue-800 mb-2">
                    🧪 No A/B Tests Configured
                  </h4>
                  <p className="text-sm text-blue-700">
                    Create A/B test experiments to see results here. Visit the Experiments tab to get started.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FeatureAnalyticsDashboard;