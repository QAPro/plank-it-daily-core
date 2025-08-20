
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { adminUserService, BillingHistoryItem } from "@/services/adminUserService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/utils/price";
import { Receipt } from "lucide-react";

const BillingHistoryList: React.FC<{ userId: string }> = ({ userId }) => {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-user-billing-history", userId],
    queryFn: () => adminUserService.getUserBillingHistory(userId),
    staleTime: 30_000,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Recent Billing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {isLoading ? (
          <div className="space-y-2">
            {[1,2,3].map(i => <div key={i} className="h-12 rounded bg-muted animate-pulse" />)}
          </div>
        ) : (data as BillingHistoryItem[]).length === 0 ? (
          <div className="text-sm text-muted-foreground">No recent transactions.</div>
        ) : (
          <div className="space-y-2">
            {(data as BillingHistoryItem[]).map((t) => (
              <div key={t.transaction_id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                    <Receipt className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <div className="font-medium">{t.description || "Subscription Payment"}</div>
                    <div className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{formatPrice(t.amount_cents)}</div>
                  <Badge
                    variant={
                      t.status === "succeeded" || t.status === "completed"
                        ? "default"
                        : t.status === "pending"
                        ? "secondary"
                        : "destructive"
                    }
                    className="capitalize"
                  >
                    {t.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BillingHistoryList;
