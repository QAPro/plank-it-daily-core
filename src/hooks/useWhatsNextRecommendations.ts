/**
 * React Query Hook for "What's Next?" Recommendations
 */

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getWhatsNextRecommendations } from '@/services/whatsNextRecommendations';

export const useWhatsNextRecommendations = (limit: number = 5) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['whats-next-recommendations', user?.id, limit],
    queryFn: () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      return getWhatsNextRecommendations(user.id, limit);
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // Cache for 2 minutes (reduced for fresher data)
    refetchOnWindowFocus: true, // Enable for live updates when tab gains focus
    retry: 2,
  });
};
