
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getUserRetentionCohorts, RetentionCohort } from "@/services/adminAnalyticsService";

const retentionClass = (value: number) => {
  if (value >= 60) return "bg-emerald-600/20 text-emerald-600";
  if (value >= 40) return "bg-emerald-500/15 text-emerald-600";
  if (value >= 20) return "bg-amber-500/15 text-amber-600";
  if (value > 0) return "bg-red-500/15 text-red-600";
  return "bg-muted text-muted-foreground";
};

const RetentionCohortChart = ({ monthsBack }: { monthsBack: number }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "retention-cohorts", monthsBack],
    queryFn: () => getUserRetentionCohorts(monthsBack),
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Retention Cohorts</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Retention Cohorts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Failed to load retention cohorts</div>
        </CardContent>
      </Card>
    );
  }

  const rows = (data ?? []) as RetentionCohort[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Retention Cohorts (Last {monthsBack} months)</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="text-sm text-muted-foreground">No cohort data available.</div>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left">
                  <th className="p-2 sticky left-0 bg-background">Cohort</th>
                  <th className="p-2">Size</th>
                  <th className="p-2">Week 1</th>
                  <th className="p-2">Week 2</th>
                  <th className="p-2">Week 4</th>
                  <th className="p-2">Week 8</th>
                  <th className="p-2">Week 12</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.cohort_month} className="border-t">
                    <td className="p-2 sticky left-0 bg-background">{r.cohort_month}</td>
                    <td className="p-2">{r.cohort_size}</td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded ${retentionClass(Number(r.week_1_retention || 0))}`}>
                        {Number(r.week_1_retention || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded ${retentionClass(Number(r.week_2_retention || 0))}`}>
                        {Number(r.week_2_retention || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded ${retentionClass(Number(r.week_4_retention || 0))}`}>
                        {Number(r.week_4_retention || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded ${retentionClass(Number(r.week_8_retention || 0))}`}>
                        {Number(r.week_8_retention || 0).toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-2">
                      <span className={`px-2 py-1 rounded ${retentionClass(Number(r.week_12_retention || 0))}`}>
                        {Number(r.week_12_retention || 0).toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 text-xs text-muted-foreground">
              Percentage of cohort active in each time window after signup.
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RetentionCohortChart;
