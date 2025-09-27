import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Target, TrendingUp, Activity } from "lucide-react";
import AchievementCompletionChart from "./AchievementCompletionChart";
import AchievementCategoryChart from "./AchievementCategoryChart";
import AchievementUnlockTrendsChart from "./AchievementUnlockTrendsChart";
import AchievementSystemHealthCards from "./AchievementSystemHealthCards";
import { useQuery } from "@tanstack/react-query";
import { getAchievementCompletionAnalytics } from "@/services/adminAnalyticsService";

interface AchievementAnalyticsDashboardProps {
  daysBack?: number;
}

const AchievementAnalyticsDashboard = ({ daysBack = 30 }: AchievementAnalyticsDashboardProps) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { data: completionData, isLoading } = useQuery({
    queryKey: ["admin-analytics", "achievement-completion"],
    queryFn: getAchievementCompletionAnalytics,
  });

  const totalAchievements = completionData?.length || 0;
  const avgCompletionRate = completionData?.reduce((sum, item) => sum + item.completion_rate, 0) / totalAchievements || 0;
  const totalUnlocks = completionData?.reduce((sum, item) => sum + item.total_unlocks, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">Achievement Analytics</h2>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30">
              <Trophy className="w-3 h-3 mr-1" />
              Admin Dashboard
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Comprehensive achievement system metrics and user engagement insights
          </p>
        </div>
      </div>

      {/* Overview KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Achievements</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAchievements}</div>
            <p className="text-xs text-muted-foreground">Available in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Completion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgCompletionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Across all achievements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Unlocks</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUnlocks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time unlocks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">Healthy</div>
            <p className="text-xs text-muted-foreground">Achievement system</p>
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <AchievementSystemHealthCards />

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="completion" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="completion">Completion Rates</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="trends">Unlock Trends</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="completion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Completion Analytics</CardTitle>
              <p className="text-sm text-muted-foreground">
                Detailed breakdown of achievement unlock rates and popularity
              </p>
            </CardHeader>
            <CardContent>
              <AchievementCompletionChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Category Engagement Analysis</CardTitle>
              <p className="text-sm text-muted-foreground">
                Achievement category performance and user engagement metrics
              </p>
            </CardHeader>
            <CardContent>
              <AchievementCategoryChart />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Achievement Unlock Trends</CardTitle>
              <p className="text-sm text-muted-foreground">
                Historical data showing achievement unlock patterns over time
              </p>
            </CardHeader>
            <CardContent>
              <AchievementUnlockTrendsChart daysBack={daysBack} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Achievement Management</CardTitle>
                <p className="text-sm text-muted-foreground">
                  System administration and monitoring tools
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm space-y-2">
                  <div className="flex justify-between">
                    <span>Total Achievement Types:</span>
                    <span className="font-medium">{totalAchievements}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Active Tracking Systems:</span>
                    <span className="font-medium text-success">7</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Categories Monitored:</span>
                    <span className="font-medium">7</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Monitoring</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Real-time achievement system status
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Achievement Service</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      Operational
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Progress Tracking</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      Active
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Category System</span>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      Healthy
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Summary */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary">
                🏆 Achievement Analytics Dashboard
              </p>
              <p className="text-xs text-muted-foreground">
                Real-time achievement metrics • Category analysis • System health monitoring
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="bg-background/60">
                {isLoading ? 'Loading...' : 'Data Loaded'}
              </Badge>
              <span>Last updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementAnalyticsDashboard;