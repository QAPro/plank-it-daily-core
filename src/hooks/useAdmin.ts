
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

  return {
    isAdmin: !!data,
    loading: !!user?.id ? isLoading : false,
    error,
    refetch,
  };
};
