import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseAchievementService } from '@/services/databaseAchievementService';

export interface AchievementFilters {
  category?: string;
  rarity?: string;
  isEarned?: boolean;
}

export const useAchievements = (filters?: AchievementFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['achievements', filters],
    queryFn: async () => {
      const service = new DatabaseAchievementService(user?.id || '');
      
      if (filters?.category) {
        return service.getAchievementsByCategory(filters.category);
      }
      
      if (filters?.rarity) {
        return service.getAchievementsByRarity(filters.rarity);
      }
      
      return service.getAllAchievements();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!user
  });
};

export const useUserEarnedAchievements = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const service = new DatabaseAchievementService(user.id);
      return service.getUserEarnedAchievements();
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    enabled: !!user
  });
};

export const useAchievementProgress = (achievementId: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['achievement-progress', user?.id, achievementId],
    queryFn: async () => {
      if (!user?.id) return 0;
      const service = new DatabaseAchievementService(user.id);
      return service.getUserProgress(achievementId);
    },
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!user && !!achievementId
  });
};
