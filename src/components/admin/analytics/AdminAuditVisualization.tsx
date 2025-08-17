
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getAdminActivitySummary, AdminActivitySummary } from "@/services/adminAnalyticsService";

const AdminAuditVisualization = ({ daysBack }: { daysBack: number }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "admin-audit", daysBack],
    queryFn: () => getAdminActivitySummary(daysBack),
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Failed to load admin activity</div>
        </CardContent>
      </Card>
    );
  }

  const rows = (data ?? []) as AdminActivitySummary[];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Admin Activity (Last {daysBack} days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows.length === 0 && <div className="text-sm text-muted-foreground">No admin activity found.</div>}
          {rows.map((r) => (
            <div key={r.action_type} className="flex items-center justify-between border rounded-md p-3">
              <div>
                <div className="font-medium">{r.action_type.replace(/_/g, " ")}</div>
                <div className="text-xs text-muted-foreground">Last: {r.last_action_at ? new Date(r.last_action_at).toLocaleString() : "—"}</div>
              </div>
              <div className="text-xl font-semibold">{r.action_count}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminAuditVisualization;
