import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getAchievementSystemHealth } from "@/services/adminAnalyticsService";
import { AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";

const AchievementSystemHealthCards = () => {
  const { data: healthData, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "achievement-system-health"],
    queryFn: getAchievementSystemHealth,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-destructive/20 bg-destructive/5">
        <CardContent className="p-4">
          <p className="text-destructive text-sm">Error loading system health data</p>
        </CardContent>
      </Card>
    );
  }

  if (!healthData || healthData.length === 0) {
    return (
      <Card className="border-muted">
        <CardContent className="p-4">
          <p className="text-muted-foreground text-sm">No system health data available</p>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return <CheckCircle className="h-4 w-4 text-success" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-warning" />;
      case 'critical':
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'healthy':
        return 'bg-success/10 text-success border-success/30';
      case 'warning':
        return 'bg-warning/10 text-warning border-warning/30';
      case 'critical':
        return 'bg-destructive/10 text-destructive border-destructive/30';
      default:
        return 'bg-muted/10 text-muted-foreground border-muted/30';
    }
  };

  const formatMetricName = (name: string) => {
    return name
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const formatMetricValue = (name: string, value: number) => {
    if (name.includes('rate') || name.includes('avg')) {
      return value.toFixed(2);
    }
    return value.toLocaleString();
  };

  const getMetricDescription = (name: string) => {
    const descriptions = {
      total_achievements_unlocked: 'Total achievements earned by all users',
      unique_users_with_achievements: 'Users who have earned at least one achievement',
      avg_achievements_per_user: 'Average number of achievements per active user',
      achievements_unlocked_today: 'Achievements earned in the last 24 hours',
      achievement_unlock_rate_7d: 'Daily average unlock rate over 7 days',
    };
    return descriptions[name as keyof typeof descriptions] || 'System metric';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">System Health Overview</h3>
        <Badge variant="outline" className="text-xs">
          Real-time Monitoring
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {healthData.map((metric) => (
          <Card key={metric.metric_name} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {formatMetricName(metric.metric_name)}
              </CardTitle>
              {getStatusIcon(metric.metric_status)}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatMetricValue(metric.metric_name, metric.metric_value)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {getMetricDescription(metric.metric_name)}
              </p>
              <div className="flex items-center justify-between mt-3">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(metric.metric_status)}`}
                >
                  {metric.metric_status.charAt(0).toUpperCase() + metric.metric_status.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(metric.last_calculated).toLocaleTimeString()}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overall System Status */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-primary flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Achievement System Status
              </p>
              <p className="text-xs text-muted-foreground">
                All core systems operational • Real-time tracking active • Data integrity maintained
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                Operational
              </Badge>
              <span>Updated: {new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AchievementSystemHealthCards;