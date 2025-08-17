
import { useQuery } from "@tanstack/react-query";
import { Users, BarChart, Clock, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getActiveUsersMetrics, getUserEngagementSummary, ActiveUsersMetric, UserEngagementSummary } from "@/services/adminAnalyticsService";

const StatCard = ({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) => (
  <Card>
    <CardContent className="p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-muted-foreground">{title}</div>
        <div className="text-2xl font-semibold">{value}</div>
      </div>
      <div className="text-muted-foreground">{icon}</div>
    </CardContent>
  </Card>
);

const KPICards = () => {
  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["admin-analytics", "engagement-summary"],
    queryFn: getUserEngagementSummary,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  const { data: activeMetrics, isLoading: loadingActive } = useQuery({
    queryKey: ["admin-analytics", "active-users-metrics"],
    queryFn: getActiveUsersMetrics,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });

  if (loadingSummary || loadingActive) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const dau = activeMetrics?.find((m: ActiveUsersMetric) => m.metric_type === "daily_active_users")?.metric_value ?? 0;
  const wau = activeMetrics?.find((m: ActiveUsersMetric) => m.metric_type === "weekly_active_users")?.metric_value ?? 0;
  const mau = activeMetrics?.find((m: ActiveUsersMetric) => m.metric_type === "monthly_active_users")?.metric_value ?? 0;

  const s: UserEngagementSummary | null = summary ?? null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <StatCard title="Total Users" value={s?.total_users ?? 0} icon={<Users className="w-6 h-6" />} />
      <StatCard title="Total Sessions" value={s?.total_sessions ?? 0} icon={<BarChart className="w-6 h-6" />} />
      <StatCard title="Avg Session (min)" value={((s?.avg_session_duration ?? 0) / 60).toFixed(1)} icon={<Clock className="w-6 h-6" />} />
      <StatCard title="Avg Sessions/User" value={(s?.avg_sessions_per_user ?? 0).toFixed(2)} icon={<Target className="w-6 h-6" />} />
      <StatCard title="DAU" value={dau} icon={<Users className="w-6 h-6" />} />
      <StatCard title="WAU" value={wau} icon={<Users className="w-6 h-6" />} />
      <StatCard title="MAU" value={mau} icon={<Users className="w-6 h-6" />} />
    </div>
  );
};

export default KPICards;
