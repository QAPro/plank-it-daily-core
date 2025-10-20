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
    queryFn: async () => {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }
      const recommendations = await getWhatsNextRecommendations(user.id, limit);
      
      // Validate recommendations before returning
      if (!Array.isArray(recommendations)) {
        console.error('Invalid recommendations format:', recommendations);
        return [];
      }
      
      return recommendations.filter(rec => {
        const isValid = rec?.achievement?.name && 
                       rec?.achievement?.description &&
                       typeof rec?.progress === 'number' &&
                       rec?.progress >= 0 && 
                       rec?.progress <= 100;
        
        if (!isValid) {
          console.warn('Filtering out invalid recommendation:', rec);
        }
        
        return isValid;
      });
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    placeholderData: (previousData) => previousData, // Show stale data while refetching
  });
};
