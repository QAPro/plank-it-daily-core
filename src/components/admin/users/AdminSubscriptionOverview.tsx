
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adminUserService } from "@/services/adminUserService";
import { Badge } from "@/components/ui/badge";

const StatCard = ({ title, value, hint }: { title: string; value: number; hint?: string }) => (
  <Card className="bg-card">
    <CardHeader className="pb-2">
      <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="text-3xl font-bold">{value}</div>
      {hint ? <div className="text-xs text-muted-foreground mt-1">{hint}</div> : null}
    </CardContent>
  </Card>
);

const AdminSubscriptionOverview: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "subscription-overview"],
    queryFn: () => adminUserService.getSubscriptionSummary(),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card><CardContent className="h-20 animate-pulse" /></Card>
        <Card><CardContent className="h-20 animate-pulse" /></Card>
        <Card><CardContent className="h-20 animate-pulse" /></Card>
        <Card><CardContent className="h-20 animate-pulse" /></Card>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <h3 className="text-lg font-semibold">Subscription Status</h3>
        <Badge variant="outline">Live</Badge>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Premium Users" value={data?.premiumUsers ?? 0} hint="Current premium tier" />
        <StatCard title="Free Users" value={data?.freeUsers ?? 0} hint="Current free tier" />
        <StatCard title="Active Subscriptions" value={data?.activeSubscriptions ?? 0} hint="Status: active" />
        <StatCard title="Canceled (7d)" value={data?.canceledLast7d ?? 0} hint="Recent cancellations" />
      </div>
    </div>
  );
};

export default AdminSubscriptionOverview;
