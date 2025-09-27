import { useQuery } from "@tanstack/react-query";
import { featureAnalyticsService, FeatureAnalytics, FeaturePerformanceMetrics } from "@/services/featureAnalyticsService";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export const useFeatureAnalytics = (featureName: string) => {
  const { user } = useAuth();

  // Track feature access when hook is used
  useEffect(() => {
    if (featureName && user) {
      featureAnalyticsService.trackFeatureAccess(featureName);
    }
  }, [featureName, user]);

  const { data: analytics, isLoading: analyticsLoading, error: analyticsError } = useQuery({
    queryKey: ["feature-analytics", featureName],
    queryFn: () => featureAnalyticsService.getFeatureAnalytics(featureName),
    enabled: !!featureName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const { data: performance, isLoading: performanceLoading, error: performanceError } = useQuery({
    queryKey: ["feature-performance", featureName],
    queryFn: () => featureAnalyticsService.getFeaturePerformanceMetrics(featureName),
    enabled: !!featureName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const trackInteraction = (interactionType: string, metadata?: Record<string, any>) => {
    if (featureName && user) {
      featureAnalyticsService.trackFeatureInteraction(featureName, interactionType, metadata);
    }
  };

  return {
    analytics,
    performance,
    loading: analyticsLoading || performanceLoading,
    error: analyticsError || performanceError,
    trackInteraction,
  };
};

export const useFeatureAdoptionTrends = (days: number = 30) => {
  return useQuery({
    queryKey: ["feature-adoption-trends", days],
    queryFn: () => featureAnalyticsService.getFeatureAdoptionTrends(days),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useUserFeatureJourney = (userId: string) => {
  return useQuery({
    queryKey: ["user-feature-journey", userId],
    queryFn: () => featureAnalyticsService.getUserFeatureJourney(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useABTestResults = (featureName: string) => {
  return useQuery({
    queryKey: ["ab-test-results", featureName],
    queryFn: () => featureAnalyticsService.getABTestResults(featureName),
    enabled: !!featureName,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};