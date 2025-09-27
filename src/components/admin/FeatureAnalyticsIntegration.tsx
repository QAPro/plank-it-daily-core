import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useFeatureAnalytics } from "@/hooks/useFeatureAnalytics";
import { Activity, TrendingUp, Users, Zap } from "lucide-react";

interface FeatureAnalyticsIntegrationProps {
  featureName: string;
  onViewDetails?: () => void;
}

/**
 * Embedded analytics component that can be used within the feature flags manager
 * to show real-time analytics for each feature flag
 */
export const FeatureAnalyticsIntegration: React.FC<FeatureAnalyticsIntegrationProps> = ({
  featureName,
  onViewDetails
}) => {
  const { analytics, performance, loading } = useFeatureAnalytics(featureName);

  if (loading) {
    return (
      <Card className="border-l-4 border-l-blue-500">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 animate-pulse" />
            <span>Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card className="border-l-4 border-l-gray-300">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4" />
            <span>No analytics data available</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'outline';
    }
  };

  return (
    <Card className="border-l-4 border-l-green-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Analytics Overview</CardTitle>
          {onViewDetails && (
            <Button variant="ghost" size="sm" onClick={onViewDetails}>
              View Details
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Active Users</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>24h: {analytics.active_users_24h}</span>
                <span>7d: {analytics.active_users_7d}</span>
              </div>
              <Progress 
                value={(analytics.active_users_24h / analytics.active_users_7d) * 100} 
                className="h-1" 
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Adoption</span>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold">{analytics.adoption_rate}%</div>
              <Progress value={analytics.adoption_rate} className="h-1" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Engagement</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold">{analytics.engagement_score}/10</span>
              <Badge variant="outline" className="text-xs">
                ⭐ {analytics.user_satisfaction}/5
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={getImpactColor(analytics.performance_impact)} className="text-xs">
                {analytics.performance_impact} impact
              </Badge>
              {performance && (
                <span className="text-xs text-muted-foreground">
                  {performance.avg_load_time}ms
                </span>
              )}
            </div>
          </div>
        </div>

        {performance && (
          <div className="mt-4 pt-3 border-t">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <div className="font-medium">{performance.error_rate}%</div>
                <div className="text-muted-foreground">Error Rate</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{performance.cpu_usage_increase}%</div>
                <div className="text-muted-foreground">CPU Impact</div>
              </div>
              <div className="text-center">
                <div className="font-medium">{performance.user_drop_off_rate}%</div>
                <div className="text-muted-foreground">Drop-off</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FeatureAnalyticsIntegration;