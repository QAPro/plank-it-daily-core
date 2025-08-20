
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { isAIEnabled } from "@/constants/featureGating";
import type { Tables } from "@/integrations/supabase/types";
import { AdvancedProgressAnalytics, MLInsights } from "@/services/advancedProgressAnalytics";

type MLPrediction = Tables<'ml_predictions'>;

export const useMLInsights = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["ml-insights", user?.id],
    enabled: !!user && isAIEnabled(),
    staleTime: 5 * 60 * 1000,
    queryFn: async (): Promise<MLInsights | null> => {
      if (!user || !isAIEnabled()) return null;

      // Try to fetch a fresh cached prediction
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("ml_predictions")
        .select("*")
        .eq("user_id", user.id)
        .eq("prediction_type", "advanced_progress")
        .gt("expires_at", nowIso)
        .order("generated_at", { ascending: false })
        .limit(1);

      if (error) throw error;

      if (data && data.length > 0) {
        const rec = data[0] as MLPrediction;
        return (rec.prediction_data as unknown) as MLInsights;
      }

      // Otherwise generate new insights and cache them
      const engine = new AdvancedProgressAnalytics();
      const insights = await engine.generateMLInsights(user.id);
      return insights;
    },
  });
};
