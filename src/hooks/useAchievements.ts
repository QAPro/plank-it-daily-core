import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { DatabaseAchievementService } from '@/services/databaseAchievementService';
import { supabase } from '@/integrations/supabase/client';

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

/**
 * Get all active (non-disabled) achievements
 */
export const useActiveAchievements = () => {
  return useQuery({
    queryKey: ['achievements', 'active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('is_disabled', false)
        .order('points', { ascending: true });
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
};

/**
 * Get a single achievement by ID
 */
export const useAchievementById = (achievementId?: string) => {
  return useQuery({
    queryKey: ['achievement', achievementId],
    queryFn: async () => {
      if (!achievementId) return null;
      
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .eq('id', achievementId)
        .eq('is_disabled', false)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }
      return data;
    },
    enabled: !!achievementId,
    staleTime: 5 * 60 * 1000,
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
