
import React, { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService, SubscriptionPlan } from "@/services/subscriptionService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Plus, Save, Trash, RefreshCw } from "lucide-react";

const emptyPlan: Partial<SubscriptionPlan> = {
  name: "",
  description: "",
  price_cents: 0,
  billing_interval: "month",
  features: [],
  is_active: true,
  is_popular: false,
  sort_order: 1,
};

const PlanManager: React.FC = () => {
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin", "subscription-plans", "all"],
    queryFn: () => subscriptionService.getAllPlans(),
    staleTime: 30_000,
  });

  const [editing, setEditing] = useState<Partial<SubscriptionPlan>>(emptyPlan);

  // Mutations
  const saveMutation = useMutation({
    mutationFn: () => subscriptionService.upsertPlan(editing),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
      toast({ title: "Saved", description: "Plan saved successfully." });
      setEditing(emptyPlan);
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[PlanManager] save error", err);
        toast({ title: "Save failed", description: "Could not save plan.", variant: "destructive" });
      },
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => subscriptionService.deletePlan(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] });
      toast({ title: "Deleted", description: "Plan deleted." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[PlanManager] delete error", err);
        toast({ title: "Delete failed", description: "Could not delete plan.", variant: "destructive" });
      },
    },
  });

  const startNew = () => setEditing(emptyPlan);
  const startEdit = (p: SubscriptionPlan) => setEditing(p);

  const handleSave = () => {
    // Basic validation
    if (!editing.name || !editing.billing_interval || editing.price_cents == null) {
      toast({ title: "Missing fields", description: "Name, billing interval, and price are required.", variant: "destructive" });
      return;
    }
    saveMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Plans</CardTitle>
            <CardDescription>Manage subscription plans shown on the pricing pages.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => qc.invalidateQueries({ queryKey: ["admin", "subscription-plans", "all"] })}>
              <RefreshCw className="w-4 h-4 mr-1" />
              Refresh
            </Button>
            <Button size="sm" onClick={startNew}>
              <Plus className="w-4 h-4 mr-1" />
              New Plan
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Edit/Create form */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label>Name</Label>
              <Input
                className="mt-1"
                value={editing.name ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div>
              <Label>Billing Interval</Label>
              <Select
                value={(editing.billing_interval as string) ?? "month"}
                onValueChange={(v) => setEditing((s) => ({ ...s, billing_interval: v }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="month">Monthly</SelectItem>
                  <SelectItem value="year">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Price (USD)</Label>
              <Input
                className="mt-1"
                type="number"
                inputMode="decimal"
                value={((editing.price_cents ?? 0) / 100).toString()}
                onChange={(e) => {
                  const cents = Math.round(parseFloat(e.target.value || "0") * 100);
                  setEditing((s) => ({ ...s, price_cents: isNaN(cents) ? 0 : cents }));
                }}
                placeholder="9.99"
              />
            </div>
            <div>
              <Label>Sort Order</Label>
              <Input
                className="mt-1"
                type="number"
                value={String(editing.sort_order ?? 1)}
                onChange={(e) => setEditing((s) => ({ ...s, sort_order: Number(e.target.value || 1) }))}
              />
            </div>
            <div className="md:col-span-2">
              <Label>Description</Label>
              <Input
                className="mt-1"
                value={editing.description ?? ""}
                onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))}
                placeholder="Short description"
              />
            </div>
            <div className="flex items-center gap-6 md:col-span-2">
              <div className="flex items-center gap-2">
                <Switch
                  checked={Boolean(editing.is_active)}
                  onCheckedChange={(v) => setEditing((s) => ({ ...s, is_active: v }))}
                />
                <Label>Active</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={Boolean(editing.is_popular)}
                  onCheckedChange={(v) => setEditing((s) => ({ ...s, is_popular: v }))}
                />
                <Label>Most Popular</Label>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleSave} disabled={saveMutation.isPending}>
              <Save className="w-4 h-4 mr-1" />
              Save
            </Button>
            {editing?.id && (
              <Button
                variant="destructive"
                onClick={() => {
                  if (!editing?.id) return;
                  if (!window.confirm("Delete this plan?")) return;
                  deleteMutation.mutate(editing.id);
                  setEditing(emptyPlan);
                }}
                disabled={deleteMutation.isPending}
              >
                <Trash className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>

        <Separator />

        {/* Plans list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {isLoading && <div className="text-sm text-muted-foreground">Loading plans...</div>}
          {!isLoading && (plans as SubscriptionPlan[]).map((p) => (
            <div key={p.id} className="rounded border p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {(p.billing_interval || "").toString().toUpperCase()} • ${(p.price_cents / 100).toFixed(2)}
                  </div>
                  {p.description && <div className="text-sm mt-1">{p.description}</div>}
                </div>
                <div className="text-right text-xs">
                  <div className="mb-1">{p.is_active ? "Active" : "Inactive"}</div>
                  <div>{p.is_popular ? "Popular" : ""}</div>
                </div>
              </div>
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={() => startEdit(p)}>
                  Edit
                </Button>
              </div>
            </div>
          ))}
          {!isLoading && (plans as SubscriptionPlan[]).length === 0 && (
            <div className="text-sm text-muted-foreground">No plans found.</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PlanManager;
