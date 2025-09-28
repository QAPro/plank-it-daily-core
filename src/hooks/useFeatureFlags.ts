
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

  const updateRolloutMutation = useMutation({
    mutationFn: async ({ name, percentage }: { name: string; percentage: number }) => {
      await featureManagementService.updateRolloutPercentage(name, percentage);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feature-flags"] });
      toast({ title: "Rollout updated", description: "The rollout percentage was updated successfully." });
    },
    meta: {
      onError: (err: unknown) => {
        console.error("[useFeatureFlags] rollout update error", err);
        toast({ title: "Update failed", description: "Could not update the rollout percentage." });
      },
    },
  });

  const flags = (data as FeatureFlag[]) || [];

  // Helper function to check if a feature is enabled
  const isFeatureEnabled = (featureName: string) => {
    const flag = flags.find(f => f.feature_name === featureName);
    return flag ? flag.is_enabled : false;
  };

  // Helper functions for hierarchical features
  const getParentFeatures = () => flags.filter(f => !f.parent_feature_id);
  const getChildFeatures = (parentId: string) => flags.filter(f => f.parent_feature_id === parentId);
  const hasChildren = (flagId: string) => flags.some(f => f.parent_feature_id === flagId);

  // Bulk operations for parent/child hierarchies
  const toggleParentAndChildren = async (parentName: string, enabled: boolean) => {
    const parentFlag = flags.find(f => f.feature_name === parentName);
    if (!parentFlag) return;
    
    // Toggle parent first
    await toggleMutation.mutateAsync({ name: parentName, enabled });
    
    // Then toggle all children to match parent
    const children = getChildFeatures(parentFlag.id);
    for (const child of children) {
      await toggleMutation.mutateAsync({ name: child.feature_name, enabled });
    }
  };

  // Provide convenient boolean properties for common features  
  const socialFeaturesEnabled = isFeatureEnabled('social_features');
  const eventsEnabled = isFeatureEnabled('events');
  const competitionEnabled = isFeatureEnabled('competition');

  return {
    flags,
    loading: isLoading,
    error,
    refetch,
    toggle: (name: string, enabled: boolean) => toggleMutation.mutate({ name, enabled }),
    upsert: (flag: Partial<FeatureFlag> & { feature_name: string }) => upsertMutation.mutate(flag),
    updateRollout: (name: string, percentage: number) => updateRolloutMutation.mutate({ name, percentage }),
    // Hierarchical helpers
    getParentFeatures,
    getChildFeatures,
    hasChildren,
    toggleParentAndChildren,
    // Convenient boolean properties
    socialFeaturesEnabled,
    eventsEnabled,
    competitionEnabled,
    isFeatureEnabled,
  };
};
