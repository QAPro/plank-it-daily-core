
import { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { subscriptionService } from "@/services/subscriptionService";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import PlanManager from "./PlanManager";

const SubscriptionSettingsCard: React.FC = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ["subscription", "admin-settings"],
    queryFn: () =>
      subscriptionService.getAdminSettings([
        "subscription_system_enabled",
        "demo_mode",
      ]),
    staleTime: 60_000,
  });

  const [localEnabled, localDemo] = useMemo(() => {
    const enabled = Boolean(settings?.subscription_system_enabled ?? true);
    const demo = Boolean(settings?.demo_mode ?? true);
    return [enabled, demo];
  }, [settings]);

  const setEnabled = useMutation({
    mutationFn: (val: boolean) =>
      subscriptionService.setAdminSetting("subscription_system_enabled", val, user?.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription", "admin-settings"] });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[SubscriptionSettingsCard] setEnabled error", err);
        toast({ title: "Save failed", description: "Could not update setting.", variant: "destructive" });
      },
    },
  });

  const setDemo = useMutation({
    mutationFn: (val: boolean) => subscriptionService.setAdminSetting("demo_mode", val, user?.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription", "admin-settings"] });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[SubscriptionSettingsCard] setDemo error", err);
        toast({ title: "Save failed", description: "Could not update demo mode.", variant: "destructive" });
      },
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Settings</CardTitle>
        <CardDescription>Enable/disable the subscription system and toggle demo mode (no Stripe required).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Enable Subscriptions</div>
            <div className="text-sm text-muted-foreground">Turn the subscription model on/off globally.</div>
          </div>
          <Switch
            checked={localEnabled}
            onCheckedChange={(v) => setEnabled.mutate(v)}
            disabled={isLoading || setEnabled.isPending}
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium">Demo Mode</div>
            <div className="text-sm text-muted-foreground">
              Simulate upgrades without Stripe; auto-activates Premium on upgrade.
            </div>
          </div>
          <Switch
            checked={localDemo}
            onCheckedChange={(v) => setDemo.mutate(v)}
            disabled={isLoading || setDemo.isPending}
          />
        </div>

        <div className="pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => qc.invalidateQueries({ queryKey: ["subscription", "admin-settings"] })}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </div>

        {/* Admin Plan Manager */}
        <div className="pt-4">
          <PlanManager />
        </div>
      </CardContent>
    </Card>
  );
};

export default SubscriptionSettingsCard;
