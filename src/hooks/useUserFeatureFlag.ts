
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type UserFlagResult = {
  enabled: boolean;
  variant: string | null;
  source?: "user_override" | "feature_flag" | "ab_test" | string | null;
};

export const useUserFeatureFlag = (featureName: string) => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["user-feature-flag", user?.id, featureName],
    enabled: !!user?.id && !!featureName,
    staleTime: 60_000,
    queryFn: async (): Promise<UserFlagResult> => {
      console.log("[useUserFeatureFlag] evaluating", featureName, "for user", user?.id);
      const { data, error } = await supabase.rpc("get_user_feature_flag", {
        _user_id: user!.id,
        _feature_name: featureName,
      });

      if (error) {
        console.error("[useUserFeatureFlag] rpc error", error);
        throw error;
      }

      const res = (data as any) || {};
      return {
        enabled: Boolean(res.enabled),
        variant: res.variant ?? null,
        source: res.source ?? null,
      };
    },
  });

  return {
    enabled: data?.enabled ?? false,
    variant: data?.variant ?? null,
    source: data?.source,
    loading: !!user?.id ? isLoading : false,
    error,
    refetch,
  };
};
