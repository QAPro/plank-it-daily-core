
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { getOnboardingAnalytics, OnboardingAnalyticsRow } from "@/services/adminAnalyticsService";

const OnboardingFunnel = ({ daysBack }: { daysBack: number }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "onboarding-funnel", daysBack],
    queryFn: () => getOnboardingAnalytics(daysBack),
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Onboarding Funnel</CardTitle>
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
          <CardTitle>Onboarding Funnel</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Failed to load onboarding analytics</div>
        </CardContent>
      </Card>
    );
  }

  const rows = (data ?? []) as OnboardingAnalyticsRow[];
  const chartData = rows.map((r) => ({
    step: r.step_name.replace(/_/g, " "),
    completion_rate: Number(r.completion_rate || 0),
    drop_off_rate: Number(r.drop_off_rate || 0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Onboarding Funnel (Last {daysBack} days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="step" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(v: number) => [`${v}%`, "Rate"]} />
              <Legend />
              <Bar dataKey="completion_rate" name="Completion %" fill="hsl(var(--chart-1))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="drop_off_rate" name="Drop-off %" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default OnboardingFunnel;
