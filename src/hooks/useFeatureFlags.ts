
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { featureManagementService, FeatureFlag } from "@/services/featureManagementService";
import { useToast } from "@/hooks/use-toast";

export const useFeatureFlags = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["feature-flags"],
    queryFn: featureManagementService.getFeatureFlags,
    staleTime: 60_000,
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ name, enabled }: { name: string; enabled: boolean }) => {
      await featureManagementService.setFeatureEnabled(name, enabled);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast({ title: "Feature updated", description: "The feature flag was toggled successfully." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[useFeatureFlags] toggle error", err);
        toast({ title: "Update failed", description: "Could not toggle the feature flag." });
      },
    },
  });

  const upsertMutation = useMutation({
    mutationFn: featureManagementService.upsertFeatureFlag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast({ title: "Feature saved", description: "The feature flag was saved successfully." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[useFeatureFlags] upsert error", err);
        toast({ title: "Save failed", description: "Could not save the feature flag." });
      },
    },
  });

  return {
    flags: (data as FeatureFlag[]) || [],
    loading: isLoading,
    error,
    refetch,
    toggle: (name: string, enabled: boolean) => toggleMutation.mutate({ name, enabled }),
    upsert: (flag: Partial<FeatureFlag> & { feature_name: string }) => upsertMutation.mutate(flag),
  };
};
