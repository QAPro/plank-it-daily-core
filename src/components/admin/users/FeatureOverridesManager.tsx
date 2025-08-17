
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminUserService, UserFeatureOverride } from "@/services/adminUserService";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, RefreshCw } from "lucide-react";

type Props = {
  userId: string;
};

const FeatureOverridesManager: React.FC<Props> = ({ userId }) => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: overrides = [], isLoading } = useQuery({
    queryKey: ["feature-overrides", userId],
    queryFn: () => adminUserService.getFeatureOverrides(userId),
    staleTime: 30_000,
  });

  const setOverrideMutation = useMutation({
    mutationFn: (payload: {
      featureName: string;
      isEnabled: boolean;
      reason?: string;
      expiresAt?: string | null;
    }) =>
      adminUserService.setFeatureOverride({
        userId,
        featureName: payload.featureName,
        isEnabled: payload.isEnabled,
        reason: payload.reason,
        expiresAt: payload.expiresAt ?? null,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["feature-overrides", userId] });
      toast({ title: "Override saved", description: "Feature override updated successfully." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[FeatureOverridesManager] set override error", err);
        toast({ title: "Save failed", description: "Could not update override.", variant: "destructive" });
      },
    },
  });

  const [newFeatureName, setNewFeatureName] = useState("");
  const [newEnabled, setNewEnabled] = useState(true);
  const [newReason, setNewReason] = useState("");
  const [newExpiresAt, setNewExpiresAt] = useState<string>("");

  const handleCreate = () => {
    if (!newFeatureName.trim()) return;
    setOverrideMutation.mutate({
      featureName: newFeatureName.trim(),
      isEnabled: newEnabled,
      reason: newReason.trim() || undefined,
      expiresAt: newExpiresAt ? new Date(newExpiresAt).toISOString() : null,
    });
    setNewFeatureName("");
    setNewEnabled(true);
    setNewReason("");
    setNewExpiresAt("");
  };

  const toggleExisting = (ovr: UserFeatureOverride) => {
    setOverrideMutation.mutate({
      featureName: ovr.feature_name,
      isEnabled: !ovr.is_enabled,
      reason: `Toggle ${ovr.feature_name}`,
      expiresAt: ovr.expires_at,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>User Feature Overrides</CardTitle>
        <CardDescription>Enable/disable features for this specific user</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-end gap-3 flex-wrap">
          <div className="w-full sm:w-48">
            <Label htmlFor="feature_name">Feature name</Label>
            <Input
              id="feature_name"
              placeholder="e.g. advanced_analytics"
              value={newFeatureName}
              onChange={(e) => setNewFeatureName(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="enabled" checked={newEnabled} onCheckedChange={setNewEnabled} />
            <Label htmlFor="enabled">Enabled</Label>
          </div>
          <div className="w-full sm:flex-1">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              placeholder="Why override?"
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64">
            <Label htmlFor="expires">Expires at (optional)</Label>
            <Input
              id="expires"
              type="datetime-local"
              value={newExpiresAt}
              onChange={(e) => setNewExpiresAt(e.target.value)}
            />
          </div>
          <Button onClick={handleCreate} disabled={isLoading}>
            <Plus className="w-4 h-4 mr-2" />
            Add/Update
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => qc.invalidateQueries({ queryKey: ["feature-overrides", userId] })}
            disabled={isLoading}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="space-y-2">
          {isLoading && <div className="text-sm text-muted-foreground">Loading overrides...</div>}
          {!isLoading && overrides.length === 0 && (
            <div className="text-sm text-muted-foreground">No overrides found for this user.</div>
          )}
          {!isLoading &&
            overrides.map((o) => (
              <div
                key={o.id}
                className="flex items-center justify-between p-3 rounded-md border bg-card text-card-foreground"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{o.feature_name}</div>
                  <div className="text-xs text-muted-foreground">
                    {o.reason ? `Reason: ${o.reason} • ` : ""}
                    Created: {new Date(o.created_at).toLocaleString()}
                    {o.expires_at ? ` • Expires: ${new Date(o.expires_at).toLocaleString()}` : ""}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={o.is_enabled ? "default" : "secondary"}>
                    {o.is_enabled ? "Enabled" : "Disabled"}
                  </Badge>
                  <Switch checked={o.is_enabled} onCheckedChange={() => toggleExisting(o)} />
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FeatureOverridesManager;
