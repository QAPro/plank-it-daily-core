
import { supabase } from "@/integrations/supabase/client";

export type FeatureFlag = {
  id: string;
  feature_name: string;
  is_enabled: boolean;
  description?: string | null;
  target_audience?: string | null;
  rollout_percentage?: number | null;
  created_at?: string;
  updated_at?: string;
  // New advanced targeting fields
  cohort_rules?: Record<string, any> | null;
  ab_test_config?: Record<string, any> | null;
  rollout_strategy?: "immediate" | "gradual" | "scheduled" | null;
  rollout_start_date?: string | null;
  rollout_end_date?: string | null;
};

export const featureManagementService = {
  async isAdmin(userId?: string): Promise<boolean> {
    if (!userId) return false;
    console.log("[featureManagementService] checking is_admin for", userId);
    const { data, error } = await supabase.rpc("is_admin", { _user_id: userId });
    if (error) {
      console.error("[featureManagementService] is_admin rpc error", error);
      throw error;
    }
    return Boolean(data);
  },

  async getFeatureFlags(): Promise<FeatureFlag[]> {
    console.log("[featureManagementService] fetching feature flags");
    const { data, error } = await supabase
      .from("feature_flags")
      .select("*")
      .order("feature_name", { ascending: true });
    if (error) {
      console.error("[featureManagementService] fetch flags error", error);
      throw error;
    }
    return (data as FeatureFlag[]) || [];
  },

  async setFeatureEnabled(featureName: string, enabled: boolean) {
    console.log("[featureManagementService] setFeatureEnabled", featureName, enabled);
    const { error } = await supabase
      .from("feature_flags")
      .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
      .eq("feature_name", featureName);
    if (error) {
      console.error("[featureManagementService] update flag error", error);
      throw error;
    }
  },

  async upsertFeatureFlag(flag: Partial<FeatureFlag> & { feature_name: string }) {
    console.log("[featureManagementService] upsertFeatureFlag", flag.feature_name);
    const { error } = await supabase.from("feature_flags").upsert(
      {
        feature_name: flag.feature_name,
        is_enabled: flag.is_enabled ?? true,
        description: flag.description ?? null,
        target_audience: flag.target_audience ?? "all",
        rollout_percentage: flag.rollout_percentage ?? 100,
        // Advanced fields
        cohort_rules: flag.cohort_rules ?? {},
        ab_test_config: flag.ab_test_config ?? null,
        rollout_strategy: flag.rollout_strategy ?? "immediate",
        rollout_start_date: flag.rollout_start_date ?? null,
        rollout_end_date: flag.rollout_end_date ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "feature_name" }
    );
    if (error) {
      console.error("[featureManagementService] upsert flag error", error);
      throw error;
    }
  },
};
