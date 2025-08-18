
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import KPICards from "./KPICards";
import UserEngagementCharts from "./UserEngagementCharts";
import FeatureUsageAnalytics from "./FeatureUsageAnalytics";
import WorkoutPerformanceCharts from "./WorkoutPerformanceCharts";
import AdminAuditVisualization from "./AdminAuditVisualization";
import SubscriptionAnalytics from "./SubscriptionAnalytics";
import OnboardingFunnel from "./OnboardingFunnel";
import DevicePlatformAnalytics from "./DevicePlatformAnalytics";
import RetentionCohortChart from "./RetentionCohortChart";
import AnalyticsFilterPanel from "./filters/AnalyticsFilterPanel";
import { useAnalyticsFilters } from "@/hooks/useAnalyticsFilters";

const AdminAnalyticsDashboard = () => {
  const { filters, apiParams } = useAnalyticsFilters();
  
  // Extract date parameters for components
  const daysBack = apiParams.days_back || 30;
  const monthsBack = Math.max(1, Math.min(12, Math.ceil(daysBack / 30)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Insights</h2>
          <p className="text-sm text-muted-foreground">System-wide usage, engagement, and subscription insights</p>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      <AnalyticsFilterPanel />

      {/* KPI Section */}
      <KPICards />

      {/* Subscription Analytics */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Subscription Metrics</h3>
        <SubscriptionAnalytics />
      </div>

      {/* Charts */}
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

      {/* Export placeholder */}
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Export reports (CSV/JSON) coming soon. Let me know your preferred formats/fields.
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsDashboard;
