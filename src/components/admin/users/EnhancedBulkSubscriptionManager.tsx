import { useMemo, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { adminUserService, AdminUserSummary } from "@/services/adminUserService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Crown, Clock, CheckCircle, XCircle } from "lucide-react";

type TierFilter = "any" | "free" | "premium";

const EnhancedBulkSubscriptionManager: React.FC = () => {
  const { toast } = useToast();
  const { user: currentAdmin } = useAuth();
  const [tier, setTier] = useState<TierFilter>("any");
  const [createdAfter, setCreatedAfter] = useState<string>("");
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  const [confirmationDialog, setConfirmationDialog] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    action: () => void;
  }>({ isOpen: false, title: "", description: "", action: () => {} });
  const [lifetimeDialog, setLifetimeDialog] = useState<{
    isOpen: boolean;
    userId?: string;
    mode: "grant" | "revoke";
  }>({ isOpen: false, mode: "grant" });
  const [customPrice, setCustomPrice] = useState<string>("");
  const [lifetimeReason, setLifetimeReason] = useState<string>("");

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
  const selectedCount = selectedUserIds.size;
  const preview = users.slice(0, 20); // Show more users for better selection

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUserIds(new Set(users.map(u => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const handleSelectUser = (userId: string, checked: boolean) => {
    const newSelected = new Set(selectedUserIds);
    if (checked) {
      newSelected.add(userId);
    } else {
      newSelected.delete(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const getSelectedUsers = () => {
    return users.filter(u => selectedUserIds.has(u.id));
  };

  const showConfirmationDialog = (title: string, description: string, action: () => void) => {
    setConfirmationDialog({
      isOpen: true,
      title,
      description,
      action
    });
  };

  const bulkChangeTierMutation = useMutation({
    mutationFn: async (newTier: "free" | "premium") => {
      if (!currentAdmin?.id) throw new Error("Not authenticated");
      const selectedUsers = Array.from(selectedUserIds);
      return adminUserService.bulkChangeTier(selectedUsers, newTier, `Bulk set to ${newTier} for ${selectedUsers.length} users`);
    },
    onSuccess: (count, tier) => {
      setSelectedUserIds(new Set());
      refetch();
    },
    onError: (err: unknown) => {
      console.error("[EnhancedBulkSubscriptionManager] bulk change tier error", err);
      toast({ title: "Bulk operation failed", description: "Could not update user tiers.", variant: "destructive" });
    },
  });

  const bulkGrantLifetimeMutation = useMutation({
    mutationFn: async () => {
      if (!currentAdmin?.id) throw new Error("Not authenticated");
      const selectedUsers = Array.from(selectedUserIds);
      return adminUserService.bulkGrantLifetime(selectedUsers, currentAdmin.id, `Bulk grant lifetime to ${selectedUsers.length} users`);
    },
    onSuccess: (count) => {
      setSelectedUserIds(new Set());
      refetch();
    },
    onError: (err: unknown) => {
      console.error("[EnhancedBulkSubscriptionManager] bulk grant lifetime error", err);
      toast({ title: "Bulk operation failed", description: "Could not grant lifetime access.", variant: "destructive" });
    },
  });

  const bulkRevokeLifetimeMutation = useMutation({
    mutationFn: async () => {
      const selectedUsers = Array.from(selectedUserIds);
      return adminUserService.bulkRevokeLifetime(selectedUsers, `Bulk revoke lifetime for ${selectedUsers.length} users`);
    },
    onSuccess: (count) => {
      setSelectedUserIds(new Set());
      refetch();
    },
    onError: (err: unknown) => {
      console.error("[EnhancedBulkSubscriptionManager] bulk revoke lifetime error", err);
      toast({ title: "Bulk operation failed", description: "Could not revoke lifetime access.", variant: "destructive" });
    },
  });

  const individualGrantLifetimeMutation = useMutation({
    mutationFn: async ({ userId, customPrice, reason }: { userId: string, customPrice?: number, reason: string }) => {
      if (!currentAdmin?.id) throw new Error("Not authenticated");
      const overrideData = customPrice ? { custom_price: customPrice } : {};
      return adminUserService.grantLifetimeAccess(userId, currentAdmin.id, reason, overrideData);
    },
    onSuccess: () => {
      setLifetimeDialog({ isOpen: false, mode: "grant" });
      setCustomPrice("");
      setLifetimeReason("");
      refetch();
    },
    onError: (err: unknown) => {
      console.error("[EnhancedBulkSubscriptionManager] individual grant lifetime error", err);
      toast({ title: "Operation failed", description: "Could not grant lifetime access.", variant: "destructive" });
    },
  });

  const individualRevokeLifetimeMutation = useMutation({
    mutationFn: async ({ userId, reason }: { userId: string, reason: string }) => {
      return adminUserService.revokeLifetimeAccess(userId, reason);
    },
    onSuccess: () => {
      setLifetimeDialog({ isOpen: false, mode: "revoke" });
      setLifetimeReason("");
      refetch();
    },
    onError: (err: unknown) => {
      console.error("[EnhancedBulkSubscriptionManager] individual revoke lifetime error", err);
      toast({ title: "Operation failed", description: "Could not revoke lifetime access.", variant: "destructive" });
    },
  });

  const disabled = isLoading || users.length === 0;
  const bulkDisabled = disabled || selectedCount === 0 || bulkChangeTierMutation.isPending || bulkGrantLifetimeMutation.isPending || bulkRevokeLifetimeMutation.isPending;

  const handleBulkSetPremium = () => {
    const selectedUsers = getSelectedUsers();
    showConfirmationDialog(
      "Set Selected Users to Premium",
      `Are you sure you want to set ${selectedCount} selected users to Premium tier?\n\nSelected users: ${selectedUsers.slice(0, 5).map(u => u.username || u.email).join(', ')}${selectedCount > 5 ? ` and ${selectedCount - 5} more...` : ''}`,
      () => bulkChangeTierMutation.mutate("premium")
    );
  };

  const handleBulkSetFree = () => {
    const selectedUsers = getSelectedUsers();
    showConfirmationDialog(
      "Set Selected Users to Free",
      `Are you sure you want to set ${selectedCount} selected users to Free tier?\n\nSelected users: ${selectedUsers.slice(0, 5).map(u => u.username || u.email).join(', ')}${selectedCount > 5 ? ` and ${selectedCount - 5} more...` : ''}`,
      () => bulkChangeTierMutation.mutate("free")
    );
  };

  const handleBulkGrantLifetime = () => {
    const selectedUsers = getSelectedUsers();
    showConfirmationDialog(
      "Grant Lifetime Access to Selected Users",
      `Are you sure you want to grant lifetime access to ${selectedCount} selected users?\n\nSelected users: ${selectedUsers.slice(0, 5).map(u => u.username || u.email).join(', ')}${selectedCount > 5 ? ` and ${selectedCount - 5} more...` : ''}`,
      () => bulkGrantLifetimeMutation.mutate()
    );
  };

  const handleBulkRevokeLifetime = () => {
    const selectedUsers = getSelectedUsers();
    showConfirmationDialog(
      "Revoke Lifetime Access from Selected Users",
      `Are you sure you want to revoke lifetime access from ${selectedCount} selected users?\n\nSelected users: ${selectedUsers.slice(0, 5).map(u => u.username || u.email).join(', ')}${selectedCount > 5 ? ` and ${selectedCount - 5} more...` : ''}`,
      () => bulkRevokeLifetimeMutation.mutate()
    );
  };

  const handleIndividualLifetimeAction = (userId: string, mode: "grant" | "revoke") => {
    setLifetimeDialog({ isOpen: true, userId, mode });
    setCustomPrice("");
    setLifetimeReason("");
  };

  const handleLifetimeDialogSubmit = () => {
    if (!lifetimeDialog.userId) return;
    
    if (lifetimeDialog.mode === "grant") {
      const customPriceNum = customPrice ? parseInt(customPrice) : undefined;
      individualGrantLifetimeMutation.mutate({
        userId: lifetimeDialog.userId,
        customPrice: customPriceNum,
        reason: lifetimeReason || "Individual lifetime access grant"
      });
    } else {
      individualRevokeLifetimeMutation.mutate({
        userId: lifetimeDialog.userId,
        reason: lifetimeReason || "Individual lifetime access revocation"
      });
    }
  };

  const renderSubscriptionBadge = (user: AdminUserSummary) => {
    const tier = user.subscription_tier || "free";
    return (
      <Badge variant={tier === "premium" ? "default" : "secondary"}>
        {tier === "premium" ? "Premium" : "Free"}
      </Badge>
    );
  };

  const renderLifetimeStatus = (user: AdminUserSummary) => {
    const status = user.lifetime_access_status;
    
    if (status === "active") {
      return (
        <div className="flex items-center gap-1">
          <Crown className="h-4 w-4 text-yellow-500" />
          <Badge variant="outline" className="text-yellow-700 border-yellow-300">
            Lifetime
          </Badge>
          {user.lifetime_access_data?.custom_price && (
            <span className="text-xs text-muted-foreground">
              (${user.lifetime_access_data.custom_price/100})
            </span>
          )}
        </div>
      );
    } else if (status === "expired") {
      return (
        <div className="flex items-center gap-1">
          <Clock className="h-4 w-4 text-gray-400" />
          <Badge variant="outline" className="text-gray-600">
            Expired
          </Badge>
        </div>
      );
    }
    
    return null;
  };

  const allSelected = selectedCount > 0 && selectedCount === users.length;
  const someSelected = selectedCount > 0 && selectedCount < users.length;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Enhanced User Management</CardTitle>
          <CardDescription>
            Select individual users and perform safe bulk operations on subscription tiers and lifetime access
          </CardDescription>
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

          {/* Summary and Selection */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {isLoading ? "Loading users..." : `Found ${total} users${total > 0 ? ` (showing first ${Math.min(total, 20)})` : ""}`}
            </div>
            {selectedCount > 0 && (
              <Badge variant="outline" className="text-blue-700">
                {selectedCount} selected
              </Badge>
            )}
          </div>

          {/* Enhanced User Table */}
          {total > 0 && (
            <div className="rounded border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allSelected}
                        onCheckedChange={handleSelectAll}
                        {...(someSelected ? { "data-indeterminate": true } : {})}
                      />
                    </TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Subscription</TableHead>
                    <TableHead>Lifetime Access</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((user: AdminUserSummary) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedUserIds.has(user.id)}
                          onCheckedChange={(checked) => handleSelectUser(user.id, !!checked)}
                        />
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{user.username || user.email || "Unnamed"}</div>
                          <div className="text-sm text-muted-foreground">{user.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {renderSubscriptionBadge(user)}
                      </TableCell>
                      <TableCell>
                        {renderLifetimeStatus(user)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(user.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {user.lifetime_access_status === "none" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleIndividualLifetimeAction(user.id, "grant")}
                              disabled={individualGrantLifetimeMutation.isPending}
                            >
                              <Crown className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleIndividualLifetimeAction(user.id, "revoke")}
                              disabled={individualRevokeLifetimeMutation.isPending}
                            >
                              <XCircle className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Bulk Actions */}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleBulkSetPremium} disabled={bulkDisabled}>
              Set Selected to Premium ({selectedCount})
            </Button>
            <Button variant="outline" onClick={handleBulkSetFree} disabled={bulkDisabled}>
              Set Selected to Free ({selectedCount})
            </Button>
            <Button variant="secondary" onClick={handleBulkGrantLifetime} disabled={bulkDisabled}>
              Grant Lifetime to Selected ({selectedCount})
            </Button>
            <Button variant="destructive" onClick={handleBulkRevokeLifetime} disabled={bulkDisabled}>
              Revoke Lifetime from Selected ({selectedCount})
            </Button>
          </div>

          {selectedCount === 0 && !disabled && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              Select users using the checkboxes to enable bulk operations. Individual lifetime access actions are available in the Actions column.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmationDialog.isOpen} onOpenChange={(open) => setConfirmationDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{confirmationDialog.title}</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {confirmationDialog.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmationDialog(prev => ({ ...prev, isOpen: false }))}>
              Cancel
            </Button>
            <Button onClick={() => {
              confirmationDialog.action();
              setConfirmationDialog(prev => ({ ...prev, isOpen: false }));
            }}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Lifetime Access Dialog */}
      <Dialog open={lifetimeDialog.isOpen} onOpenChange={(open) => setLifetimeDialog(prev => ({ ...prev, isOpen: open }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {lifetimeDialog.mode === "grant" ? "Grant Lifetime Access" : "Revoke Lifetime Access"}
            </DialogTitle>
            <DialogDescription>
              {lifetimeDialog.mode === "grant" 
                ? "Grant lifetime access to this user with optional custom pricing."
                : "Revoke lifetime access from this user."
              }
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {lifetimeDialog.mode === "grant" && (
              <div>
                <Label htmlFor="customPrice">Custom Price (cents, optional)</Label>
                <Input
                  id="customPrice"
                  type="number"
                  placeholder="e.g., 2999 for $29.99"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                />
                <div className="text-xs text-muted-foreground mt-1">
                  Leave empty for standard lifetime access, or enter price in cents (e.g., 2999 = $29.99)
                </div>
              </div>
            )}
            <div>
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Reason for this action"
                value={lifetimeReason}
                onChange={(e) => setLifetimeReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLifetimeDialog({ isOpen: false, mode: "grant" })}>
              Cancel
            </Button>
            <Button 
              onClick={handleLifetimeDialogSubmit}
              disabled={individualGrantLifetimeMutation.isPending || individualRevokeLifetimeMutation.isPending}
            >
              {lifetimeDialog.mode === "grant" ? "Grant Access" : "Revoke Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EnhancedBulkSubscriptionManager;