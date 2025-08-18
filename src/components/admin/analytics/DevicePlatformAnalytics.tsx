
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { getDevicePlatformAnalytics, DevicePlatformAnalyticsRow } from "@/services/adminAnalyticsService";

const DevicePlatformAnalytics = ({ daysBack }: { daysBack: number }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-analytics", "device-platform", daysBack],
    queryFn: () => getDevicePlatformAnalytics(daysBack),
    refetchInterval: 120_000,
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Device & Platform Analytics</CardTitle>
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
          <CardTitle>Device & Platform Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Failed to load device/platform analytics</div>
        </CardContent>
      </Card>
    );
  }

  const rows = (data ?? []) as DevicePlatformAnalyticsRow[];

  // Aggregate by platform for the chart
  const byPlatform = Object.values(
    rows.reduce<Record<string, { platform: string; users: number; sessions: number }>>((acc, r) => {
      const key = r.platform_type || "Other";
      const current = acc[key] || { platform: key, users: 0, sessions: 0 };
      current.users += Number(r.user_count || 0);
      current.sessions += Number(r.session_count || 0);
      acc[key] = current;
      return acc;
    }, {})
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Device & Platform Analytics (Last {daysBack} days)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byPlatform}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="platform" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="users" name="Users" fill="hsl(var(--chart-3))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="sessions" name="Sessions" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device category breakdown table */}
        <div className="mt-4 overflow-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="p-2">Platform</th>
                <th className="p-2">Device</th>
                <th className="p-2">Users</th>
                <th className="p-2">Sessions</th>
                <th className="p-2">Avg Session (s)</th>
                <th className="p-2">Bounce Rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, idx) => (
                <tr key={`${r.platform_type}-${r.device_category}-${idx}`} className="border-t">
                  <td className="p-2">{r.platform_type}</td>
                  <td className="p-2">{r.device_category}</td>
                  <td className="p-2">{r.user_count}</td>
                  <td className="p-2">{r.session_count}</td>
                  <td className="p-2">{Number(r.avg_session_duration || 0).toFixed(1)}</td>
                  <td className="p-2">{Number(r.bounce_rate || 0).toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 text-xs text-muted-foreground">
            Bounce Rate = sessions shorter than 30s / total sessions.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DevicePlatformAnalytics;
