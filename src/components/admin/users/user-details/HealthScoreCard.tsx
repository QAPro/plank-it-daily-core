
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminUserService } from "@/services/adminUserService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, ThumbsUp } from "lucide-react";

type Health = { health_score: number; risk_factors: any; recommendations: any };

const HealthScoreCard: React.FC<{ userId: string }> = ({ userId }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-user-health", userId],
    queryFn: () => adminUserService.getUserSubscriptionHealth(userId),
    staleTime: 30_000,
  });

  const h = data as Health | null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Subscription Health</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="h-16 rounded bg-muted animate-pulse" />
        ) : !h ? (
          <div className="text-sm text-muted-foreground">No active subscription.</div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">Health Score</div>
              <div className="font-semibold">{h.health_score}/100</div>
            </div>
            <Progress value={h.health_score} />
            <div className="grid md:grid-cols-2 gap-3">
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  Risk Factors
                </div>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {Array.isArray(h.risk_factors) && h.risk_factors.length > 0 ? (
                    h.risk_factors.map((r: string, i: number) => <li key={i} className="capitalize">{r.replaceAll("_", " ")}</li>)
                  ) : (
                    <li>None</li>
                  )}
                </ul>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1 text-sm font-medium">
                  <ThumbsUp className="w-4 h-4 text-primary" />
                  Recommendations
                </div>
                <ul className="list-disc pl-5 text-sm text-muted-foreground">
                  {Array.isArray(h.recommendations) && h.recommendations.length > 0 ? (
                    h.recommendations.map((r: string, i: number) => <li key={i} className="capitalize">{r.replaceAll("_", " ")}</li>)
                  ) : (
                    <li>No recommendations</li>
                  )}
                </ul>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default HealthScoreCard;
