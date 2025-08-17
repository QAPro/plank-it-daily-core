
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getWorkoutCompletionAnalytics, WorkoutCompletionAnalytics } from "@/services/adminAnalyticsService";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const WorkoutPerformanceCharts = ({ daysBack }: { daysBack: number }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "workout-performance", daysBack],
    queryFn: () => getWorkoutCompletionAnalytics(daysBack),
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workout Performance</CardTitle>
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
          <CardTitle>Workout Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Failed to load workout analytics</div>
        </CardContent>
      </Card>
    );
  }

  const rows = ((data ?? []) as WorkoutCompletionAnalytics[])
    .sort((a, b) => b.total_attempts - a.total_attempts)
    .slice(0, 10);

  const chartData = rows.map((r) => ({
    exercise: r.exercise_name,
    attempts: r.total_attempts,
    completion: Number(r.completion_rate ?? 0),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Exercises by Attempts (Last {daysBack} days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="exercise" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="attempts" name="Attempts" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkoutPerformanceCharts;
