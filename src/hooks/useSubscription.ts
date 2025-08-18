
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService, SubscriptionPlan, ActiveSubscription } from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";

export const useSubscription = () => {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["subscription", "admin-settings"],
    queryFn: () =>
      subscriptionService.getAdminSettings([
        "subscription_system_enabled",
        "demo_mode",
      ]),
    staleTime: 60_000,
  });

  const { data: plans, isLoading: loadingPlans } = useQuery({
    queryKey: ["subscription", "plans"],
    queryFn: subscriptionService.getPlans,
    staleTime: 60_000,
  });

  const { data: active, isLoading: loadingActive } = useQuery({
    queryKey: ["subscription", "active", user?.id],
    enabled: !!user?.id,
    queryFn: () => subscriptionService.getActiveSubscription(user!.id),
    staleTime: 30_000,
  });

  const upgradeMutation = useMutation({
    mutationFn: async (plan: SubscriptionPlan) => {
      const demoMode = Boolean(settings?.demo_mode ?? true);
      if (demoMode) {
        return subscriptionService.startDemoUpgrade(user!.id, plan);
      }
      // Stripe not connected yet; when ready, swap here to real checkout session.
      throw new Error("Stripe integration is not configured yet. Enable demo mode to test upgrade.");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription", "active", user?.id] });
      qc.invalidateQueries({ queryKey: ["subscription-tier", user?.id] }); // refresh feature gating tier
      toast({ title: "Upgraded", description: "Your subscription is now active." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[useSubscription] upgrade error", err);
        toast({
          title: "Upgrade failed",
          description: err instanceof Error ? err.message : "Could not start upgrade.",
          variant: "destructive",
        });
      },
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => subscriptionService.cancelActiveSubscription(user!.id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription", "active", user?.id] });
      qc.invalidateQueries({ queryKey: ["subscription-tier", user?.id] });
      toast({ title: "Subscription canceled", description: "You've been downgraded to Free." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[useSubscription] cancel error", err);
        toast({
          title: "Cancel failed",
          description: "Could not cancel subscription.",
          variant: "destructive",
        });
      },
    },
  });

  const enabled = Boolean(settings?.subscription_system_enabled ?? true);
  const demoMode = Boolean(settings?.demo_mode ?? true);

  return {
    // Data
    enabled,
    demoMode,
    plans: (plans as SubscriptionPlan[]) || [],
    active: (active as ActiveSubscription | null) || null,
    // Loading
    loading: loadingSettings || loadingPlans || loadingActive,
    loadingSettings,
    loadingPlans,
    loadingActive,
    // Actions
    upgrade: (plan: SubscriptionPlan) => upgradeMutation.mutate(plan),
    cancel: () => cancelMutation.mutate(),
  };
};
