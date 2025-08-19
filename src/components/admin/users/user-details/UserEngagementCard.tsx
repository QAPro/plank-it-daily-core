
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminUserService, UserEngagementMetrics } from "@/services/adminUserService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Stat: React.FC<{ label: string; value: string | number }> = ({ label, value }) => (
  <div className="rounded border p-3">
    <div className="text-xs text-muted-foreground">{label}</div>
    <div className="font-medium">{value}</div>
  </div>
);

const UserEngagementCard: React.FC<{ userId: string }> = ({ userId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-engagement", userId],
    queryFn: () => adminUserService.getUserEngagementMetrics(userId),
    staleTime: 30_000,
  });

  const em = data as UserEngagementMetrics | null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Engagement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 rounded bg-muted animate-pulse" />)}
          </div>
        ) : !em ? (
          <div className="text-sm text-muted-foreground">No engagement data.</div>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="text-sm text-muted-foreground">Status:</div>
              <Badge variant="outline" className="capitalize">{em.engagement_status}</Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <Stat label="Total Sessions" value={em.total_sessions} />
              <Stat label="Last Session" value={em.last_session_date ? new Date(em.last_session_date).toLocaleDateString() : "—"} />
              <Stat label="Avg Duration (s)" value={Math.round(em.avg_session_duration)} />
              <Stat label="Total Duration (min)" value={Math.round(em.total_duration / 60)} />
              <Stat label="Current Streak" value={em.current_streak} />
              <Stat label="Longest Streak" value={em.longest_streak} />
              <Stat label="Joined" value={new Date(em.registration_date).toLocaleDateString()} />
              <Stat label="Tier" value={em.subscription_tier || "—"} />
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default UserEngagementCard;
