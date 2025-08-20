
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  FEATURE_REQUIREMENTS,
  FeatureName,
  SubscriptionTier,
  isTierAtLeast,
  isAIEnabled,
  AI_FEATURES,
} from '@/constants/featureGating';

type UseFeatureAccessResult = {
  tier: SubscriptionTier;
  loading: boolean;
  error?: unknown;
  hasAccess: (feature: FeatureName) => boolean;
  requiredTierFor: (feature: FeatureName) => SubscriptionTier;
  refetch: () => void;
};

export const useFeatureAccess = (): UseFeatureAccessResult => {
  const { user } = useAuth();

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['subscription-tier', user?.id],
    queryFn: async () => {
      console.log('[useFeatureAccess] fetching subscription_tier for user', user?.id);
      const { data, error } = await supabase
        .from('users')
        .select('subscription_tier')
        .eq('id', user!.id)
        .single();
      if (error) {
        console.error('[useFeatureAccess] fetch error', error);
        throw error;
      }
      console.log('[useFeatureAccess] fetched tier =', data?.subscription_tier);
      return data?.subscription_tier as SubscriptionTier | undefined;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  const tier: SubscriptionTier = useMemo(() => {
    // Treat logged-out users as "free" by default
    return (data as SubscriptionTier) || 'free';
  }, [data]);

  const hasAccess = (feature: FeatureName) => {
    // Check if AI is disabled and this is an AI feature
    if (!isAIEnabled() && AI_FEATURES.includes(feature)) {
      return false;
    }
    
    const required = FEATURE_REQUIREMENTS[feature];
    return isTierAtLeast(tier, required);
  };

  const requiredTierFor = (feature: FeatureName) => FEATURE_REQUIREMENTS[feature];

  return {
    tier,
    loading: !!user ? isLoading : false,
    error,
    hasAccess,
    requiredTierFor,
    refetch,
  };
};
