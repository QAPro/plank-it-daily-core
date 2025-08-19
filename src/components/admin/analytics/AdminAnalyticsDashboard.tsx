
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import EnhancedKPICards from "./EnhancedKPICards";
import UserEngagementCharts from "./UserEngagementCharts";
import FeatureUsageAnalytics from "./FeatureUsageAnalytics";
import WorkoutPerformanceCharts from "./WorkoutPerformanceCharts";
import AdminAuditVisualization from "./AdminAuditVisualization";
import EnhancedSubscriptionAnalyticsDashboard from "./EnhancedSubscriptionAnalyticsDashboard";
import OnboardingFunnel from "./OnboardingFunnel";
import DevicePlatformAnalytics from "./DevicePlatformAnalytics";
import RetentionCohortChart from "./RetentionCohortChart";
import AnalyticsFilterPanel from "./filters/AnalyticsFilterPanel";
import ExportControls from "./ExportControls";
import { useAnalyticsFilters } from "@/hooks/useAnalyticsFilters";
import { AdminAnalyticsProvider } from "@/contexts/AdminAnalyticsContext";
import DrillDownPanel from "./DrillDownPanel";
import RealTimeMetricsWidget from "./RealTimeMetricsWidget";
import { PartialErrorBanner } from "@/components/ui/error-state";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp } from "lucide-react";

const AdminAnalyticsDashboard = () => {
  const { filters, apiParams } = useAnalyticsFilters();
  const [partialErrors, setPartialErrors] = useState<string[]>([]);
  
  // Extract date parameters for components
  const daysBack = apiParams.days_back || 30;
  const monthsBack = Math.max(1, Math.min(12, Math.ceil(daysBack / 30)));

  const dismissPartialError = (index: number) => {
    setPartialErrors(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AdminAnalyticsProvider>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">Analytics & Insights</h2>
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                <Zap className="w-3 h-3 mr-1" />
                Enhanced
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              System-wide usage, engagement, and subscription insights with real-time updates
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3" />
              <span>Interactive charts • Click elements for drill-down analysis</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RealTimeMetricsWidget />
            <ExportControls apiParams={apiParams} />
          </div>
        </div>

        {/* Partial Error Banners */}
        {partialErrors.map((error, index) => (
          <PartialErrorBanner
            key={index}
            message={error}
            onDismiss={() => dismissPartialError(index)}
          />
        ))}

        {/* Advanced Filter Panel */}
        <AnalyticsFilterPanel />

        {/* Drill-down Panel (appears when drill-down is active) */}
        <DrillDownPanel />

        {/* Enhanced KPI Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Key Performance Indicators</h3>
            <Badge variant="secondary" className="text-xs">
              Live Data • Click cards to explore
            </Badge>
          </div>
          <EnhancedKPICards />
        </div>

        {/* Enhanced Subscription Analytics */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Subscription Analytics & Revenue</h3>
          <EnhancedSubscriptionAnalyticsDashboard />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UserEngagementCharts daysBack={daysBack} />
          <FeatureUsageAnalytics />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WorkoutPerformanceCharts daysBack={daysBack} />
          <AdminAuditVisualization daysBack={daysBack} />
        </div>

        {/* Enhanced analytics sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <OnboardingFunnel daysBack={daysBack} />
          <DevicePlatformAnalytics daysBack={daysBack} />
        </div>

        <RetentionCohortChart monthsBack={monthsBack} />

        {/* Enhanced Export information card */}
        <Card className="border-orange-200 bg-gradient-to-r from-orange-50 to-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-orange-800">
                  📊 Advanced Analytics Dashboard
                </p>
                <p className="text-xs text-orange-700">
                  Export data in CSV/JSON • Real-time updates • Interactive drill-downs • Accessible design
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-orange-600">
                <Badge variant="outline" className="bg-white/60">
                  {Object.keys(filters).length > 0 ? 'Filtered View' : 'All Data'}
                </Badge>
                <span>Last updated: {new Date().toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminAnalyticsProvider>
  );
};

export default AdminAnalyticsDashboard;
