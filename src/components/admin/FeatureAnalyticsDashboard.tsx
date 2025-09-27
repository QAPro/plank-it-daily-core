import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeatureAdoptionTrends } from "@/hooks/useFeatureAnalytics";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingUp, Users, Activity, Target } from "lucide-react";
import { useAdmin } from "@/hooks/useAdmin";

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

  // Mock data for demonstration - in real implementation, this would come from API
  const mockFeatureMetrics = [
    {
      feature_name: "social_features",
      total_users: 1250,
      active_users_24h: 89,
      active_users_7d: 456,
      active_users_30d: 892,
      adoption_rate: 71.2,
      engagement_score: 8.4,
      performance_impact: "low" as const,
      user_satisfaction: 4.2,
    },
    {
      feature_name: "advanced_analytics",
      total_users: 890,
      active_users_24h: 45,
      active_users_7d: 234,
      active_users_30d: 567,
      adoption_rate: 63.7,
      engagement_score: 7.8,
      performance_impact: "medium" as const,
      user_satisfaction: 4.0,
    },
    {
      feature_name: "premium_workouts",
      total_users: 2340,
      active_users_24h: 156,
      active_users_7d: 789,
      active_users_30d: 1456,
      adoption_rate: 89.3,
      engagement_score: 9.1,
      performance_impact: "high" as const,
      user_satisfaction: 4.6,
    },
  ];

  const mockPerformanceData = [
    { feature: "social_features", load_time: 120, error_rate: 0.2, cpu_impact: 5 },
    { feature: "advanced_analytics", load_time: 280, error_rate: 1.1, cpu_impact: 15 },
    { feature: "premium_workouts", load_time: 350, error_rate: 0.8, cpu_impact: 25 },
  ];

  const getPerformanceColor = (impact: string) => {
    switch (impact) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredMetrics = mockFeatureMetrics.filter(metric =>
    metric.feature_name.toLowerCase().includes(searchFeature.toLowerCase())
  );

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
            </CardHeader>
            <CardContent>
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
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mockPerformanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="feature" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="load_time" fill="hsl(var(--primary))" name="Load Time (ms)" />
                    <Bar dataKey="cpu_impact" fill="hsl(var(--destructive))" name="CPU Impact (%)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ab-testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>A/B Testing Results</CardTitle>
              <p className="text-sm text-muted-foreground">
                Compare feature variants and their performance metrics
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Social Features Test</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Control Group</span>
                          <Badge>65% conversion</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Variant A</span>
                          <Badge variant="secondary">72% conversion</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Statistical Significance</span>
                          <Badge variant="outline">95%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Premium Workouts Test</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span>Control Group</span>
                          <Badge>43% retention</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Variant B</span>
                          <Badge variant="secondary">51% retention</Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>Statistical Significance</span>
                          <Badge variant="outline">89%</Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
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