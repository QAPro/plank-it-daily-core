
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { featureManagementService } from "@/services/featureManagementService";

export const useAdmin = () => {
  const { user } = useAuth();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["is-admin", user?.id],
    queryFn: async () => {
      return featureManagementService.isAdmin(user?.id);
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  // Enhanced to detect admin roles
  const { data: roleData } = useQuery({
    queryKey: ["user-roles", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { supabase } = await import("@/integrations/supabase/client");
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);
      return error ? [] : (data || []).map(r => r.role);
    },
    enabled: !!user?.id,
    staleTime: 60_000,
  });

  const roles = roleData || [];
  const isAdmin = !!data || roles.includes("admin");

  return {
    isAdmin,
    roles,
    loading: !!user?.id ? isLoading : false,
    error,
    refetch,
  };
};
