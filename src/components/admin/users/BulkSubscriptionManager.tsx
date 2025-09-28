
import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminUserService, AdminUserSummary } from "@/services/adminUserService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

type TierFilter = "any" | "free" | "premium";

const BulkSubscriptionManager: React.FC = () => {
  const { toast } = useToast();
  const { user: currentAdmin } = useAuth();
  const [tier, setTier] = useState<TierFilter>("any");
  const [createdAfter, setCreatedAfter] = useState<string>("");

  const filters = useMemo(() => {
    return {
      tier,
      createdAfter: createdAfter || undefined,
    };
  }, [tier, createdAfter]);

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ["admin", "segment-users", filters],
    queryFn: () =>
      adminUserService.findUsersBySegment({
        tier: tier === "any" ? undefined : tier,
        createdAfter: createdAfter ? new Date(createdAfter).toISOString() : undefined,
      }),
    staleTime: 10_000,
  });

  const total = users.length;
  const preview = users.slice(0, 10);

  const bulkChangeTierMutation = useMutation({
    mutationFn: async (newTier: "free" | "premium") => {
      if (!currentAdmin?.id) throw new Error("Not authenticated");
      return adminUserService.bulkChangeTier(users.map(u => u.id), newTier, `Bulk set to ${newTier}`);
    },
    onSuccess: (count) => {
      toast({ title: "Bulk operation complete", description: `Updated ${count} users.` });
      refetch();
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[BulkSubscriptionManager] bulk change tier error", err);
        toast({ title: "Bulk failed", description: "Could not update user tiers.", variant: "destructive" });
      },
    },
  });

  const bulkGrantLifetimeMutation = useMutation({
    mutationFn: async () => {
      if (!currentAdmin?.id) throw new Error("Not authenticated");
      return adminUserService.bulkGrantLifetime(users.map(u => u.id), currentAdmin.id, "Bulk grant lifetime");
    },
    onSuccess: (count) => {
      toast({ title: "Lifetime granted", description: `Granted lifetime to ${count} users.` });
      refetch();
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[BulkSubscriptionManager] bulk grant lifetime error", err);
        toast({ title: "Bulk failed", description: "Could not grant lifetime access.", variant: "destructive" });
      },
    },
  });

  const bulkRevokeLifetimeMutation = useMutation({
    mutationFn: async () => {
      return adminUserService.bulkRevokeLifetime(users.map(u => u.id), "Bulk revoke lifetime");
    },
    onSuccess: (count) => {
      toast({ title: "Lifetime revoked", description: `Revoked lifetime for ${count} users.` });
      refetch();
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[BulkSubscriptionManager] bulk revoke lifetime error", err);
        toast({ title: "Bulk failed", description: "Could not revoke lifetime access.", variant: "destructive" });
      },
    },
  });

  const disabled = isLoading || users.length === 0 || bulkChangeTierMutation.isPending || bulkGrantLifetimeMutation.isPending || bulkRevokeLifetimeMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk Subscription Operations</CardTitle>
        <CardDescription>Target a user segment and apply subscription changes in bulk</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <Label className="text-sm">Tier</Label>
            <Select value={tier} onValueChange={(v: TierFilter) => setTier(v)}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">Any</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="premium">Premium</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-sm">Created After</Label>
            <Input type="date" value={createdAfter} onChange={(e) => setCreatedAfter(e.target.value)} className="mt-1" />
          </div>
          <div className="flex items-end">
            <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="text-sm text-muted-foreground">
          {isLoading ? "Loading users..." : `Matched users: ${total}${total > 0 ? " (showing first 10 below)" : ""}`}
        </div>

        {/* Preview table */}
        {total > 0 && (
          <div className="rounded border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead className="text-right">ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.map((u: AdminUserSummary) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.full_name || "—"}</TableCell>
                    <TableCell>{u.email || "—"}</TableCell>
                    <TableCell>{u.username || "—"}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{u.id}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => bulkChangeTierMutation.mutate("premium")} disabled={disabled}>
            Set All to Premium
          </Button>
          <Button variant="outline" onClick={() => bulkChangeTierMutation.mutate("free")} disabled={disabled}>
            Set All to Free
          </Button>
          <Button variant="secondary" onClick={() => bulkGrantLifetimeMutation.mutate()} disabled={disabled}>
            Grant Lifetime
          </Button>
          <Button variant="destructive" onClick={() => bulkRevokeLifetimeMutation.mutate()} disabled={disabled}>
            Revoke Lifetime
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkSubscriptionManager;
