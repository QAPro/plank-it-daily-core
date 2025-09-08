import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface InvestmentPortfolio {
  id: string;
  userId: string;
  totalTimeInvestedHours: number;
  socialCapitalValue: number;
  masteryInvestmentValue: number;
  exclusiveAccessValue: number;
  streakMultiplierValue: number;
  seasonalCertificationValue: number;
  totalPortfolioValue: number;
  abandonmentCost24h: number;
  abandonmentCost7d: number;
  abandonmentCost30d: number;
  recoveryDifficultyScore: number;
  lastCalculatedAt: string;
}

export interface SeasonalCertification {
  id: string;
  certificationName: string;
  seasonYear: number;
  seasonPeriod: string;
  startDate: string;
  endDate: string;
  maintenanceRequirement: any;
  expiryDate: string;
  maxHolders: number;
  currentHolders: number;
  prestigeValue: number;
  userCertification?: {
    id: string;
    earnedAt: string;
    expiresAt: string;
    maintenanceScore: number;
    isExpired: boolean;
    abandonmentCost: number;
  };
}

export interface ExclusiveFeature {
  id: string;
  featureName: string;
  featureType: string;
  maxUsers: number | null;
  currentUsers: number;
  invitationRequirements: any;
  scarcityMultiplier: number;
  prestigeValue: number;
  userAccess?: {
    accessLevel: string;
    grantedAt: string;
    investmentValue: number;
    abandonmentPenalty: number;
  };
}

export interface InvestmentStreak {
  id: string;
  userId: string;
  streakType: string;
  currentMultiplier: number;
  maxMultiplierAchieved: number;
  lastActivityDate: string;
  totalInvestmentValue: number;
  resetPenaltyValue: number;
}

export const useInvestmentPortfolio = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investment-portfolio', user?.id],
    queryFn: async (): Promise<InvestmentPortfolio | null> => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_investment_portfolio')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (!data) return null;

      return {
        id: data.id,
        userId: data.user_id,
        totalTimeInvestedHours: data.total_time_invested_hours,
        socialCapitalValue: data.social_capital_value,
        masteryInvestmentValue: data.mastery_investment_value,
        exclusiveAccessValue: data.exclusive_access_value,
        streakMultiplierValue: data.streak_multiplier_value,
        seasonalCertificationValue: data.seasonal_certification_value,
        totalPortfolioValue: data.total_portfolio_value,
        abandonmentCost24h: data.abandonment_cost_24h,
        abandonmentCost7d: data.abandonment_cost_7d,
        abandonmentCost30d: data.abandonment_cost_30d,
        recoveryDifficultyScore: data.recovery_difficulty_score,
        lastCalculatedAt: data.last_calculated_at,
      };
    },
    enabled: !!user,
  });
};

export const useSeasonalCertifications = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['seasonal-certifications', user?.id],
    queryFn: async (): Promise<SeasonalCertification[]> => {
      const { data: certifications, error } = await supabase
        .from('seasonal_certifications')
        .select(`
          *,
          user_seasonal_certifications!inner(*)
        `)
        .order('prestige_value', { ascending: false });

      if (error) throw error;

      return certifications.map(cert => ({
        id: cert.id,
        certificationName: cert.certification_name,
        seasonYear: cert.season_year,
        seasonPeriod: cert.season_period,
        startDate: cert.start_date,
        endDate: cert.end_date,
        maintenanceRequirement: cert.maintenance_requirement,
        expiryDate: cert.expiry_date,
        maxHolders: cert.max_holders,
        currentHolders: cert.current_holders,
        prestigeValue: cert.prestige_value,
        userCertification: cert.user_seasonal_certifications?.[0] ? {
          id: cert.user_seasonal_certifications[0].id,
          earnedAt: cert.user_seasonal_certifications[0].earned_at,
          expiresAt: cert.user_seasonal_certifications[0].expires_at,
          maintenanceScore: cert.user_seasonal_certifications[0].maintenance_score,
          isExpired: cert.user_seasonal_certifications[0].is_expired,
          abandonmentCost: cert.user_seasonal_certifications[0].abandonment_cost,
        } : undefined,
      }));
    },
    enabled: !!user,
  });
};

export const useExclusiveFeatures = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['exclusive-features', user?.id],
    queryFn: async (): Promise<ExclusiveFeature[]> => {
      const { data: features, error } = await supabase
        .from('exclusive_features')
        .select(`
          *,
          user_exclusive_access(*)
        `)
        .eq('is_active', true)
        .order('prestige_value', { ascending: false });

      if (error) throw error;

      return features.map(feature => ({
        id: feature.id,
        featureName: feature.feature_name,
        featureType: feature.feature_type,
        maxUsers: feature.max_users,
        currentUsers: feature.current_users,
        invitationRequirements: feature.invitation_requirements,
        scarcityMultiplier: feature.scarcity_multiplier,
        prestigeValue: feature.prestige_value,
        userAccess: feature.user_exclusive_access?.[0] ? {
          accessLevel: feature.user_exclusive_access[0].access_level,
          grantedAt: feature.user_exclusive_access[0].granted_at,
          investmentValue: feature.user_exclusive_access[0].investment_value,
          abandonmentPenalty: feature.user_exclusive_access[0].abandonment_penalty,
        } : undefined,
      }));
    },
    enabled: !!user,
  });
};

export const useInvestmentStreaks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['investment-streaks', user?.id],
    queryFn: async (): Promise<InvestmentStreak[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('investment_streaks')
        .select('*')
        .eq('user_id', user.id)
        .order('current_multiplier', { ascending: false });

      if (error) throw error;

      return data.map(streak => ({
        id: streak.id,
        userId: streak.user_id,
        streakType: streak.streak_type,
        currentMultiplier: streak.current_multiplier,
        maxMultiplierAchieved: streak.max_multiplier_achieved,
        lastActivityDate: streak.last_activity_date,
        totalInvestmentValue: streak.total_investment_value,
        resetPenaltyValue: streak.reset_penalty_value,
      }));
    },
    enabled: !!user,
  });
};

export const useRequestDataExport = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (exportType: 'partial' | 'full' | 'investment_summary') => {
      if (!user) throw new Error('User not authenticated');

      // Calculate complexity score based on user's data interconnections
      const complexityScore = Math.random() * 5 + 1; // Simulate complex calculation
      const dataInterconnectionCount = Math.floor(Math.random() * 50) + 10;
      const estimatedHours = Math.max(24, Math.floor(complexityScore * dataInterconnectionCount / 2));

      const { data, error } = await supabase
        .from('data_export_requests')
        .insert({
          user_id: user.id,
          export_type: exportType,
          complexity_score: complexityScore,
          estimated_completion_hours: estimatedHours,
          data_interconnection_count: dataInterconnectionCount,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['data-export-requests'] });
    },
  });
};

export const useCalculateAbandonmentCost = () => {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('calculate_abandonment_cost', {
          _user_id: user.id,
        });

      if (error) throw error;
      return data[0];
    },
  });
};