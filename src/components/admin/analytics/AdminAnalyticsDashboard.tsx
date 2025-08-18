
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import KPICards from "./KPICards";
import UserEngagementCharts from "./UserEngagementCharts";
import FeatureUsageAnalytics from "./FeatureUsageAnalytics";
import WorkoutPerformanceCharts from "./WorkoutPerformanceCharts";
import AdminAuditVisualization from "./AdminAuditVisualization";
import SubscriptionAnalytics from "./SubscriptionAnalytics";
import DateRangeSelector from "./DateRangeSelector";

const AdminAnalyticsDashboard = () => {
  const [daysBack, setDaysBack] = useState<number>(30);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Analytics & Insights</h2>
          <p className="text-sm text-muted-foreground">System-wide usage, engagement, and subscription insights</p>
        </div>
        <DateRangeSelector value={daysBack} onChange={setDaysBack} />
      </div>

      {/* KPI Section */}
      <KPICards />

      {/* Subscription Analytics - New Section */}
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

      {/* Export placeholder (future enhancement) */}
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">
          Export reports (CSV/JSON) coming soon. Let me know your preferred formats/fields.
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminAnalyticsDashboard;
