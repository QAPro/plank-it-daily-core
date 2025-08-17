
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getFeatureFlagAnalytics, FeatureFlagAnalytics } from "@/services/adminAnalyticsService";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const FeatureUsageAnalytics = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "feature-usage"],
    queryFn: getFeatureFlagAnalytics,
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Flag Adoption</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-48 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feature Flag Adoption</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Failed to load feature usage</div>
        </CardContent>
      </Card>
    );
  }

  const rows = (data ?? []) as FeatureFlagAnalytics[];
  const chartData = rows.map((r) => ({
    feature: r.feature_name,
    adoption: Number(r.adoption_rate ?? 0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Flag Adoption</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="feature" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Adoption"]} />
              <Bar dataKey="adoption" name="Adoption %" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureUsageAnalytics;
