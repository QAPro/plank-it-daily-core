
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { subscriptionService, SubscriptionPlan, ActiveSubscription } from "@/services/subscriptionService";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

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
      const demoMode = Boolean(settings?.demo_mode ?? false);
      if (demoMode) {
        // Demo mode for testing
        return subscriptionService.startDemoUpgrade(user!.id, plan);
      }
      // Real Stripe checkout
      const url = await subscriptionService.createCheckoutSession(plan);
      if (!url) {
        throw new Error("Could not create checkout session.");
      }
      // Redirect to Stripe checkout
      window.location.href = url;
      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["subscription", "active", user?.id] });
      qc.invalidateQueries({ queryKey: ["subscription-tier", user?.id] }); // refresh feature gating tier
      qc.invalidateQueries({ queryKey: ["admin", "subscription-metrics"] }); // refresh admin metrics
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
      qc.invalidateQueries({ queryKey: ["admin", "subscription-metrics"] }); // refresh admin metrics
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

  // Manual refresh function for users
  const refreshStatus = async () => {
    try {
      await supabase.functions.invoke('check-subscription');
      qc.invalidateQueries({ queryKey: ["subscription", "active", user?.id] });
      qc.invalidateQueries({ queryKey: ["subscription-tier", user?.id] });
      toast({ title: "Status updated", description: "Subscription status refreshed." });
    } catch (error) {
      console.error('Manual subscription refresh failed:', error);
      toast({ 
        title: "Refresh failed", 
        description: "Could not refresh subscription status.",
        variant: "destructive" 
      });
    }
  };

  const enabled = Boolean(settings?.subscription_system_enabled ?? true);
  const demoMode = Boolean(settings?.demo_mode ?? false);

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
    refreshStatus,
    openPortal: async () => {
      const url = await subscriptionService.openCustomerPortal();
      if (url) window.open(url, "_blank");
    },
  };
};
