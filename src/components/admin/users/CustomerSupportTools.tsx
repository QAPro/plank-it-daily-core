import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { adminUserService } from "@/services/adminUserService";
import { subscriptionService, BillingTransaction } from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";
import { Crown, RefreshCw, ShieldAlert } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  userId: string;
};

const CustomerSupportTools = ({ userId }: Props) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: currentAdmin } = useAuth();

  const { data: health } = useQuery({
    queryKey: ["admin-user-health", userId],
    queryFn: () => adminUserService.getUserSubscriptionHealth(userId),
    staleTime: 30_000,
  });

  const { data: billing = [] } = useQuery({
    queryKey: ["admin-user-billing", userId],
    queryFn: () => subscriptionService.getBillingHistory(userId),
    staleTime: 30_000,
  });

  const forcePremium = useMutation({
    mutationFn: () => adminUserService.changeUserTier(userId, "premium", "Support action: set premium"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-active-sub", userId] });
      qc.invalidateQueries({ queryKey: ["subscription-tier", userId] });
      toast({ title: "Updated", description: "User set to Premium." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[CustomerSupportTools] set premium error", err);
        toast({ title: "Failed", description: "Could not set to Premium.", variant: "destructive" });
      },
    },
  });

  const forceFree = useMutation({
    mutationFn: () => adminUserService.changeUserTier(userId, "free", "Support action: set free"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription-tier", userId] });
      toast({ title: "Updated", description: "User set to Free." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[CustomerSupportTools] set free error", err);
        toast({ title: "Failed", description: "Could not set to Free.", variant: "destructive" });
      },
    },
  });

  const grantLifetime = useMutation({
    mutationFn: () => adminUserService.grantLifetimeAccess(userId, currentAdmin?.id || userId, "Support action: grant lifetime"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-lifetime", userId] });
      toast({ title: "Granted", description: "Lifetime access granted." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[CustomerSupportTools] grant lifetime error", err);
        toast({ title: "Failed", description: "Could not grant lifetime.", variant: "destructive" });
      },
    },
  });

  const revokeLifetime = useMutation({
    mutationFn: () => adminUserService.revokeLifetimeAccess(userId, "Support action: revoke lifetime"),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-lifetime", userId] });
      toast({ title: "Revoked", description: "Lifetime access revoked." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[CustomerSupportTools] revoke lifetime error", err);
        toast({ title: "Failed", description: "Could not revoke lifetime.", variant: "destructive" });
      },
    },
  });

  const refreshStatus = useMutation({
    mutationFn: async () => {
      // Triggers edge function subscription check for current user context
      // For cross-user refresh, rely on admin tools above (tier/lifetime) for now.
      await (await import("@/integrations/supabase/client")).supabase.functions.invoke("check-subscription");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-active-sub", userId] });
      toast({ title: "Refreshed", description: "Subscription status refresh invoked." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[CustomerSupportTools] refresh status error", err);
        toast({ title: "Failed", description: "Could not refresh status.", variant: "destructive" });
      },
    },
  });

  const score = health?.health_score ?? 0;
  const riskFactors = Array.isArray(health?.risk_factors) ? health?.risk_factors : [];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-primary" />
          Customer Support Tools
        </CardTitle>
        <CardDescription>Diagnostics and quick resolution actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Health */}
        <div className="rounded border p-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Health Score</div>
            <Badge variant={score >= 70 ? "default" : score >= 40 ? "secondary" : "destructive"}>{score}</Badge>
          </div>
          {riskFactors && riskFactors.length > 0 && (
            <div className="text-xs text-muted-foreground mt-2">
              Risks: {riskFactors.join(", ")}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="rounded border p-3 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-primary" />
            <div className="font-semibold">Quick Actions</div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => forcePremium.mutate()} disabled={forcePremium.isPending}>
              Set Premium
            </Button>
            <Button variant="outline" onClick={() => forceFree.mutate()} disabled={forceFree.isPending}>
              Set Free
            </Button>
            <Button variant="secondary" onClick={() => grantLifetime.mutate()} disabled={grantLifetime.isPending}>
              Grant Lifetime
            </Button>
            <Button variant="destructive" onClick={() => revokeLifetime.mutate()} disabled={revokeLifetime.isPending}>
              Revoke Lifetime
            </Button>
            <Button variant="outline" onClick={() => refreshStatus.mutate()} disabled={refreshStatus.isPending}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh Status
            </Button>
          </div>
        </div>

        {/* Billing history */}
        <div className="rounded border p-3">
          <div className="font-medium mb-2">Recent Billing</div>
          {billing.length === 0 ? (
            <div className="text-sm text-muted-foreground">No billing transactions.</div>
          ) : (
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(billing as BillingTransaction[]).slice(0, 5).map((t) => (
                    <TableRow key={t.id}>
                      <TableCell className="capitalize">{t.transaction_type}</TableCell>
                      <TableCell className="capitalize">{t.status}</TableCell>
                      <TableCell>${(t.amount_cents / 100).toFixed(2)}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {new Date(t.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerSupportTools;
