import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface SeasonalCertification {
  id: string;
  certificationName: string;
  seasonPeriod: string;
  seasonYear: number;
  startDate: string;
  endDate: string;
  expiryDate: string;
  prestigeValue: number;
  maxHolders: number;
  currentHolders: number;
  maintenanceRequirement: {
    min_sessions_per_week?: number;
    min_duration_seconds?: number;
    social_interactions?: number;
    mastery_level?: number;
    min_streak?: number;
  } | null;
  userCertification?: {
    maintenanceScore: number;
    expiresAt: string;
  };
}

export const useSeasonalCertifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['seasonal-certifications', user?.id],
    queryFn: async (): Promise<SeasonalCertification[]> => {
      if (!user) return [];

      // Mock data for seasonal certifications (positive, celebration-focused)
      return [
        {
          id: '1',
          certificationName: 'Spring Fitness Champion',
          seasonPeriod: 'Spring',
          seasonYear: 2024,
          startDate: '2024-03-01',
          endDate: '2024-06-01',
          expiryDate: '2024-12-01',
          prestigeValue: 100,
          maxHolders: 50,
          currentHolders: 25,
          maintenanceRequirement: {
            min_sessions_per_week: 3,
            min_duration_seconds: 1800,
            min_streak: 7
          },
          userCertification: {
            maintenanceScore: 85,
            expiresAt: '2024-12-01'
          }
        },
        {
          id: '2', 
          certificationName: 'Summer Endurance Master',
          seasonPeriod: 'Summer',
          seasonYear: 2024,
          startDate: '2024-06-01',
          endDate: '2024-09-01',
          expiryDate: '2025-03-01',
          prestigeValue: 150,
          maxHolders: 30,
          currentHolders: 28,
          maintenanceRequirement: {
            min_sessions_per_week: 4,
            min_duration_seconds: 2400,
            social_interactions: 5,
            min_streak: 14
          }
        }
      ];
    },
    enabled: !!user,
  });
};