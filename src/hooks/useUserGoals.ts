
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

type UserGoal = Tables<'user_goals'>;

export const useUserGoals = () => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ["user-goals", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<UserGoal[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("user_goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("target_date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const createGoal = useMutation({
    mutationFn: async (payload: Partial<UserGoal>) => {
      if (!user) throw new Error("Not authenticated");
      const { error } = await supabase.from("user_goals").insert({
        user_id: user.id,
        goal_type: payload.goal_type || "duration",
        title: payload.title || "New Goal",
        description: payload.description ?? null,
        target_value: payload.target_value || 0,
        current_value: payload.current_value ?? 0,
        target_date: payload.target_date || new Date().toISOString().split("T")[0],
        priority_level: payload.priority_level ?? 3,
        category: payload.category || "fitness",
        measurement_unit: payload.measurement_unit || "seconds",
        milestone_values: payload.milestone_values || [],
      } as any);
      if (error) throw error;
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: ["user-goals", user?.id] });
    },
  });

  return {
    goals: goalsQuery.data || [],
    loading: goalsQuery.isLoading,
    error: goalsQuery.error as any,
    createGoal,
    refetch: goalsQuery.refetch,
  };
};
