import { useQuery } from "@tanstack/react-query";
import { adminUserService, SubscriptionTimelineEvent } from "@/services/adminUserService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, AlertOctagon, CreditCard } from "lucide-react";

const EventIcon = ({ type }: { type: string }) => {
  if (type === "subscription_created") return <CheckCircle className="w-4 h-4 text-primary" />;
  if (type === "payment_success") return <CreditCard className="w-4 h-4 text-green-600" />;
  if (type === "payment_failed") return <AlertOctagon className="w-4 h-4 text-destructive" />;
  return <Clock className="w-4 h-4 text-muted-foreground" />;
};

const SubscriptionTimeline = ({ userId }: { userId: string }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-user-subscription-timeline", userId],
    queryFn: () => adminUserService.getUserSubscriptionTimeline(userId),
    staleTime: 30_000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subscription Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}
          </div>
        ) : (data as SubscriptionTimelineEvent[]).length === 0 ? (
          <div className="text-sm text-muted-foreground">No timeline events found.</div>
        ) : (
          <div className="space-y-2">
            {(data as SubscriptionTimelineEvent[]).map((e, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded border">
                <div className="mt-0.5">
                  <EventIcon type={e.event_type} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="font-medium">{e.event_description || e.event_type}</div>
                    {e.status ? <Badge variant="outline" className="capitalize">{e.status}</Badge> : null}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(e.event_date).toLocaleString()}
                    {e.plan_name ? <> • Plan: {e.plan_name}</> : null}
                    {typeof e.amount_cents === "number" ? <> • Amount: ${(e.amount_cents / 100).toFixed(2)}</> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SubscriptionTimeline;
