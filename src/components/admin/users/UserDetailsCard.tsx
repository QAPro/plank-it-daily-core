
import React, { useMemo, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUserService, AdminUserSummary } from "@/services/adminUserService";
import { subscriptionService, SubscriptionPlan, ActiveSubscription } from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";
import { ShieldPlus, ShieldMinus, Crown, DollarSign, Tag, NotebookPen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type Props = {
  user: AdminUserSummary;
};

const UserDetailsCard: React.FC<Props> = ({ user }) => {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user: currentAdmin } = useAuth();

  // Roles
  const { data: roles = [], isLoading: rolesLoading } = useQuery({
    queryKey: ["admin-user-roles", user.id],
    queryFn: () => adminUserService.getUserRoles(user.id),
    staleTime: 60_000,
  });

  const isAdmin = roles.includes("admin");

  // Subscription data
  const { data: plans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: subscriptionService.getPlans,
    staleTime: 60_000,
  });

  const { data: activeSub, isLoading: activeLoading } = useQuery({
    queryKey: ["admin-user-active-sub", user.id],
    queryFn: () => adminUserService.getUserActiveSubscription(user.id),
    staleTime: 30_000,
  });

  const { data: lifetimeOverride, isLoading: lifetimeLoading } = useQuery({
    queryKey: ["admin-user-lifetime", user.id],
    queryFn: () => adminUserService.getActiveLifetimeOverride(user.id),
    staleTime: 30_000,
  });

  // Admin notes
  const { data: notes = [], isLoading: notesLoading } = useQuery({
    queryKey: ["admin-user-notes", user.id],
    queryFn: () => adminUserService.getUserNotes(user.id),
    staleTime: 10_000,
  });

  // Local form state
  const [selectedPlanId, setSelectedPlanId] = useState<string>("");
  const [customPrice, setCustomPrice] = useState<string>("");
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteType, setNoteType] = useState("general");

  // Mutations: role
  const grantMutation = useMutation({
    mutationFn: (reason?: string) => adminUserService.grantAdminRole(user.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-roles", user.id] });
      toast({ title: "Role updated", description: "Admin role granted." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserDetailsCard] grant admin error", err);
        toast({ title: "Update failed", description: "Could not grant admin role.", variant: "destructive" });
      },
    },
  });

  const revokeMutation = useMutation({
    mutationFn: (reason?: string) => adminUserService.revokeAdminRole(user.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-roles", user.id] });
      toast({ title: "Role updated", description: "Admin role revoked." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserDetailsCard] revoke admin error", err);
        toast({ title: "Update failed", description: "Could not revoke admin role.", variant: "destructive" });
      },
    },
  });

  // Mutations: subscription management
  const changeTierMutation = useMutation({
    mutationFn: (args: { newTier: "free" | "premium"; reason?: string }) =>
      adminUserService.changeUserTier(user.id, args.newTier, args.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-active-sub", user.id] });
      qc.invalidateQueries({ queryKey: ["subscription-tier", user.id] });
      toast({ title: "Tier updated", description: "User subscription tier updated." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserDetailsCard] change tier error", err);
        toast({ title: "Update failed", description: "Could not change tier.", variant: "destructive" });
      },
    },
  });

  const setCustomPricingMutation = useMutation({
    mutationFn: (args: { planId: string; priceCents: number; reason?: string }) =>
      adminUserService.setCustomPricing(user.id, args.planId, args.priceCents, args.reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-active-sub", user.id] });
      toast({ title: "Custom pricing applied", description: "User custom pricing saved." });
      setCustomPrice("");
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserDetailsCard] set custom pricing error", err);
        toast({ title: "Update failed", description: "Could not apply custom pricing.", variant: "destructive" });
      },
    },
  });

  const grantLifetimeMutation = useMutation({
    mutationFn: (reason?: string) => adminUserService.grantLifetimeAccess(user.id, currentAdmin?.id || user.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-lifetime", user.id] });
      qc.invalidateQueries({ queryKey: ["admin-user-active-sub", user.id] });
      toast({ title: "Lifetime access granted", description: "User now has lifetime Premium access." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserDetailsCard] grant lifetime error", err);
        toast({ title: "Update failed", description: "Could not grant lifetime access.", variant: "destructive" });
      },
    },
  });

  const revokeLifetimeMutation = useMutation({
    mutationFn: (reason?: string) => adminUserService.revokeLifetimeAccess(user.id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-lifetime", user.id] });
      toast({ title: "Lifetime access revoked", description: "Lifetime access has been revoked." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserDetailsCard] revoke lifetime error", err);
        toast({ title: "Update failed", description: "Could not revoke lifetime access.", variant: "destructive" });
      },
    },
  });

  // Mutations: notes
  const addNoteMutation = useMutation({
    mutationFn: () =>
      adminUserService.addUserNote({
        userId: user.id,
        createdBy: currentAdmin?.id || user.id,
        title: noteTitle || "Note",
        content: noteContent,
        noteType,
        isImportant: false,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-user-notes", user.id] });
      setNoteTitle("");
      setNoteContent("");
      toast({ title: "Note added", description: "Your note has been saved." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[UserDetailsCard] add note error", err);
        toast({ title: "Save failed", description: "Could not add note.", variant: "destructive" });
      },
    },
  });

  const handleGrant = () => {
    const reason = window.prompt("Reason for granting admin (optional):") || undefined;
    grantMutation.mutate(reason);
  };

  const handleRevoke = () => {
    if (!window.confirm("Revoke admin role for this user?")) return;
    const reason = window.prompt("Reason for revoking admin (optional):") || undefined;
    revokeMutation.mutate(reason);
  };

  const handleTierChange = (newTier: "free" | "premium") => {
    const reason = window.prompt(`Reason for setting tier to ${newTier} (optional):`) || undefined;
    changeTierMutation.mutate({ newTier, reason });
  };

  const handleApplyCustomPricing = () => {
    if (!selectedPlanId) {
      toast({ title: "Select a plan", description: "Pick a plan to apply custom pricing.", variant: "destructive" });
      return;
    }
    const priceVal = Math.round(Number(customPrice || "0") * 100);
    if (isNaN(priceVal) || priceVal < 0) {
      toast({ title: "Invalid price", description: "Enter a valid positive price.", variant: "destructive" });
      return;
    }
    const reason = window.prompt("Reason for custom pricing (optional):") || undefined;
    setCustomPricingMutation.mutate({ planId: selectedPlanId, priceCents: priceVal, reason });
  };

  const handleGrantLifetime = () => {
    const reason = window.prompt("Reason for granting lifetime access (optional):") || undefined;
    grantLifetimeMutation.mutate(reason);
  };

  const handleRevokeLifetime = () => {
    if (!window.confirm("Revoke lifetime access for this user?")) return;
    const reason = window.prompt("Reason for revoking lifetime (optional):") || undefined;
    revokeLifetimeMutation.mutate(reason);
  };

  const priceLabel = (plan: SubscriptionPlan) => {
    if (plan.price_cents === 0) return "Free";
    const interval = plan.billing_interval?.toLowerCase() === "year" ? "/yr" : "/mo";
    return `$${(plan.price_cents / 100).toFixed(2)} ${interval}`;
  };

  const planOptions = useMemo(() => {
    return (plans as SubscriptionPlan[]).filter(p => p.is_active);
  }, [plans]);

  const subStatus = activeSub as ActiveSubscription | null;
  const effectivePrice = subStatus?.custom_price_cents ?? null;

  const isBusy =
    plansLoading ||
    activeLoading ||
    lifetimeLoading ||
    grantMutation.isPending ||
    revokeMutation.isPending ||
    changeTierMutation.isPending ||
    setCustomPricingMutation.isPending ||
    grantLifetimeMutation.isPending ||
    revokeLifetimeMutation.isPending;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {user.full_name || user.username || user.email || "User"}
          {isAdmin && <Badge variant="default">Admin</Badge>}
          {lifetimeOverride && <Badge variant="secondary" className="ml-2">Lifetime</Badge>}
        </CardTitle>
        <CardDescription className="space-y-0.5">
          <div>{user.email || "No email"}</div>
          <div className="text-xs text-muted-foreground">Username: {user.username || "N/A"}</div>
          <div className="text-xs text-muted-foreground">User ID: {user.id}</div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Role management */}
        <div className="flex items-center gap-3">
          {!rolesLoading && (
            <>
              {isAdmin ? (
                <Button variant="destructive" onClick={handleRevoke} disabled={isBusy}>
                  <ShieldMinus className="w-4 h-4 mr-2" />
                  Revoke Admin
                </Button>
              ) : (
                <Button onClick={handleGrant} disabled={isBusy}>
                  <ShieldPlus className="w-4 h-4 mr-2" />
                  Grant Admin
                </Button>
              )}
              <div className="ml-auto text-sm text-muted-foreground">
                Roles: {roles.length ? roles.join(", ") : "None"}
              </div>
            </>
          )}
        </div>

        <Separator />

        {/* Subscription status */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Crown className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Subscription</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
            <div className="rounded border p-3">
              <div className="text-muted-foreground">Plan</div>
              <div className="font-medium">{subStatus?.plan_name ?? "None"}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-muted-foreground">Status</div>
              <div className="font-medium capitalize">{subStatus?.status ?? "N/A"}</div>
            </div>
            <div className="rounded border p-3">
              <div className="text-muted-foreground">Renews</div>
              <div className="font-medium">
                {subStatus?.current_period_end ? new Date(subStatus.current_period_end).toLocaleString() : "N/A"}
              </div>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="rounded border p-3">
              <div className="text-muted-foreground">Effective Price</div>
              <div className="font-medium">
                {effectivePrice != null ? `$${(effectivePrice / 100).toFixed(2)}` : "N/A"}
                {subStatus?.is_custom_pricing ? <Badge variant="outline" className="ml-2">Custom</Badge> : null}
              </div>
            </div>
            {lifetimeOverride ? (
              <Badge variant="secondary" className="ml-1">Lifetime Access Active</Badge>
            ) : null}
          </div>
        </div>

        {/* Tier controls */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Manage Tier</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => handleTierChange("free")} disabled={isBusy}>
              Set to Free
            </Button>
            <Button onClick={() => handleTierChange("premium")} disabled={isBusy}>
              Set to Premium
            </Button>
          </div>
        </div>

        {/* Custom pricing */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Custom Pricing</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-sm">Plan</Label>
              <Select value={selectedPlanId} onValueChange={setSelectedPlanId} disabled={isBusy || plansLoading}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={plansLoading ? "Loading plans..." : "Select a plan"} />
                </SelectTrigger>
                <SelectContent>
                  {(planOptions as SubscriptionPlan[]).map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name} • {priceLabel(p)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm">Custom Price (USD)</Label>
              <Input
                type="number"
                inputMode="decimal"
                placeholder="9.99"
                value={customPrice}
                onChange={(e) => setCustomPrice(e.target.value)}
                className="mt-1"
                disabled={isBusy}
              />
            </div>
            <div className="flex items-end">
              <Button className="w-full" onClick={handleApplyCustomPricing} disabled={isBusy}>
                Apply
              </Button>
            </div>
          </div>
        </div>

        {/* Lifetime access */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Crown className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Lifetime Access</h4>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {lifetimeOverride ? (
              <>
                <Badge variant="secondary">Active</Badge>
                <Button variant="destructive" onClick={handleRevokeLifetime} disabled={isBusy}>
                  Revoke Lifetime
                </Button>
              </>
            ) : (
              <Button onClick={handleGrantLifetime} disabled={isBusy}>
                Grant Lifetime
              </Button>
            )}
          </div>
        </div>

        {/* Admin notes */}
        <div className="rounded-lg border p-4">
          <div className="flex items-center gap-2 mb-3">
            <NotebookPen className="w-4 h-4 text-primary" />
            <h4 className="font-semibold">Admin Notes</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <Label className="text-sm">Title</Label>
              <Input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} className="mt-1" placeholder="Short title" disabled={isBusy} />
            </div>
            <div className="md:col-span-1">
              <Label className="text-sm">Type</Label>
              <Select value={noteType} onValueChange={setNoteType} disabled={isBusy}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select note type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="subscription">Subscription</SelectItem>
                  <SelectItem value="billing">Billing</SelectItem>
                  <SelectItem value="support">Support</SelectItem>
                  <SelectItem value="beta">Beta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-3">
              <Label className="text-sm">Content</Label>
              <Textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Add details..."
                className="mt-1"
                rows={3}
                disabled={isBusy}
              />
            </div>
            <div className="md:col-span-3">
              <Button
                className="w-full md:w-auto"
                onClick={() => addNoteMutation.mutate()}
                disabled={isBusy || !noteContent.trim()}
              >
                Add Note
              </Button>
            </div>
          </div>

          {/* Notes list */}
          <div className="mt-4 space-y-2">
            {!notesLoading && notes.length === 0 && (
              <div className="text-sm text-muted-foreground">No notes yet.</div>
            )}
            {notes.map((n) => (
              <div key={n.id} className="rounded border p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{n.title}</div>
                  <div className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                <div className="text-xs text-muted-foreground mt-1 capitalize">{n.note_type}</div>
                <div className="text-sm mt-2">{n.content}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserDetailsCard;
