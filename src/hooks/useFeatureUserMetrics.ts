import { useQuery } from "@tanstack/react-query";
import { featureManagementService } from "@/services/featureManagementService";

export interface FeatureUserMetrics {
  total_users: number;
  active_users_24h: number;
  active_users_7d: number;
  current_rollout_users: number;
  error_rate: number;
}

export const useFeatureUserMetrics = (featureName: string) => {
  return useQuery({
    queryKey: ["feature-user-metrics", featureName],
    queryFn: () => featureManagementService.getFeatureUserMetrics(featureName),
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!featureName,
  });
};

export const useRolloutHistory = (featureName: string) => {
  return useQuery({
    queryKey: ["rollout-history", featureName],
    queryFn: () => featureManagementService.getRolloutHistory(featureName),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!featureName,
  });
};