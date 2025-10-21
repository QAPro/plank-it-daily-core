/**
 * "What's Next?" Database-Driven Recommendation Algorithm
 * Generates personalized achievement recommendations from database
 */

import { supabase } from '@/integrations/supabase/client';
import { calculateAchievementProgress, type AchievementProgress } from './achievementProgressService';

// Database achievement type
interface Achievement {
  id: string;
  name: string;
  description: string;
  category: string;
  rarity: string;
  points: number;
  badge_file_name: string;
  is_secret: boolean;
  is_premium: boolean;
  is_disabled: boolean;
  unlock_criteria?: any;
  related_exercise_categories?: string[];
}

export interface RecommendedAchievement {
  achievement: Achievement;
  progress: AchievementProgress;
  recommendationReason: 'almost_complete' | 'next_tier' | 'category_diversity' | 'seasonal_timely';
  priority: number; // 1-10, higher = more urgent/relevant
}

export interface ValidationReport {
  isValid: boolean;
  issues: string[];
  timestamp: Date;
}

/**
 * Main recommendation function - fully database-driven
 */
export const getWhatsNextRecommendations = async (
  userId: string,
  limit: number = 5
): Promise<RecommendedAchievement[]> => {
  try {
    // Step 1: Get user context with validation
    const { data: earnedAchievements, error: earnedError } = await supabase
      .from('user_achievements')
      .select('achievement_type')
      .eq('user_id', userId);

    if (earnedError) {
      console.error('Error fetching earned achievements:', earnedError);
    }

    const earnedIds = new Set((earnedAchievements || []).map(a => a.achievement_type));

    // Step 2: Fetch ALL active achievements from database
    const { data: allAchievements, error: achievementsError } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_disabled', false)
      .eq('is_secret', false);

    if (achievementsError) {
      console.error('Error fetching achievements:', achievementsError);
      return [];
    }

    if (!allAchievements || allAchievements.length === 0) {
      return [];
    }

    // Filter out earned achievements
    const unearnedAchievements = allAchievements.filter(
      ach => !earnedIds.has(ach.id)
    );

    // Check premium status
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    const isPremium = userData?.subscription_tier === 'premium';

    // Filter out premium achievements for free users
    const availableAchievements = unearnedAchievements.filter(
      ach => !ach.is_premium || isPremium
    );

    if (availableAchievements.length === 0) {
      return [];
    }

    // Step 3: Calculate progress for all available achievements with error handling
    const progressData = await Promise.all(
      availableAchievements.map(async (achievement) => {
        try {
          // Cast achievement to compatible type for progress calculation
          const achievementForProgress = {
            id: achievement.id,
            unlock_criteria: achievement.unlock_criteria as any,
          };
          const progress = await calculateAchievementProgress(userId, achievementForProgress);
          return { achievement, progress };
        } catch (error) {
          console.warn(`Error calculating progress for ${achievement.id}:`, error);
          return { 
            achievement, 
            progress: { 
              achievementId: achievement.id,
              current: 0, 
              required: 1, 
              percentage: 0, 
              isComplete: false,
              lastUpdated: new Date(),
            } as AchievementProgress
          };
        }
      })
    );

    // Step 4: Strategy 1 - Almost Complete (Top Priority)
    const almostComplete = progressData
      .filter(({ progress }) => progress.percentage >= 50 && progress.percentage < 100)
      .sort((a, b) => b.progress.percentage - a.progress.percentage)
      .slice(0, 3)
      .map(({ achievement, progress }) => ({
        achievement,
        progress,
        recommendationReason: 'almost_complete' as const,
        priority: 10 - Math.floor((100 - progress.percentage) / 10),
      }));

    // Step 5: Strategy 2 - Next Tier Challenges
    const { data: earnedWithRarity } = await supabase
      .from('user_achievements')
      .select('achievement_type')
      .eq('user_id', userId);

    // Get rarity info for earned achievements from database
    const earnedAchievementIds = (earnedWithRarity || []).map(a => a.achievement_type);
    const { data: earnedAchievementDetails } = await supabase
      .from('achievements')
      .select('id, rarity')
      .in('id', earnedAchievementIds.length > 0 ? earnedAchievementIds : ['']);

    const rarityCount = {
      common: (earnedAchievementDetails || []).filter(a => a.rarity?.toLowerCase() === 'common').length,
      uncommon: (earnedAchievementDetails || []).filter(a => a.rarity?.toLowerCase() === 'uncommon').length,
      rare: (earnedAchievementDetails || []).filter(a => a.rarity?.toLowerCase() === 'rare').length,
      epic: (earnedAchievementDetails || []).filter(a => a.rarity?.toLowerCase() === 'epic').length,
    };

    // Determine next logical tier
    let targetRarity: string;
    if (rarityCount.common < 5) {
      targetRarity = 'common';
    } else if (rarityCount.common >= 5 && rarityCount.uncommon < 5) {
      targetRarity = 'uncommon';
    } else if (rarityCount.uncommon >= 5 && rarityCount.rare < 5) {
      targetRarity = 'rare';
    } else {
      targetRarity = 'epic';
    }

    const nextTierCandidates = progressData
      .filter(({ achievement }) => achievement.rarity?.toLowerCase() === targetRarity)
      .sort((a, b) => b.progress.percentage - a.progress.percentage)
      .slice(0, 2)
      .map(({ achievement, progress }) => ({
        achievement,
        progress,
        recommendationReason: 'next_tier' as const,
        priority: 7,
      }));

    // Step 6: Strategy 3 - Category Diversity
    const { data: categoryCounts } = await supabase
      .from('user_sessions')
      .select('category')
      .eq('user_id', userId);

    let diversityCandidates: RecommendedAchievement[] = [];
    
    if (categoryCounts && categoryCounts.length > 0) {
      const categoryFrequency = categoryCounts.reduce((acc, { category }) => {
        if (category) {
          acc[category] = (acc[category] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const leastUsedCategory = Object.entries(categoryFrequency)
        .sort((a, b) => a[1] - b[1])[0]?.[0];

      if (leastUsedCategory) {
        diversityCandidates = progressData
          .filter(({ achievement }) => 
            achievement.related_exercise_categories?.includes(leastUsedCategory)
          )
          .slice(0, 1)
          .map(({ achievement, progress }) => ({
            achievement,
            progress,
            recommendationReason: 'category_diversity' as const,
            priority: 5,
          }));
      }
    }

    // Step 7: Strategy 4 - Seasonal/Timely
    const currentMonth = new Date().getMonth() + 1;
    const currentDate = new Date();
    
    const seasonalAchievements = progressData
      .filter(({ achievement }) => {
        const unlockCriteria = achievement.unlock_criteria;
        if (!unlockCriteria || typeof unlockCriteria !== 'object') return false;

        const criteriaObj = unlockCriteria as { type?: string; conditions?: any };
        
        if (criteriaObj.type === 'seasonal_sessions') {
          const months = criteriaObj.conditions?.months || [];
          return months.includes(currentMonth);
        }

        if (criteriaObj.type === 'date_range_sessions') {
          const conditions = criteriaObj.conditions || {};
          const { startMonth, endMonth, startDay = 1, endDay = 31 } = conditions;
          if (!startMonth || !endMonth) return false;
          
          const inRange = isDateInRange(currentDate, startMonth, startDay, endMonth, endDay);
          return inRange;
        }

        return false;
      })
      .slice(0, 1)
      .map(({ achievement, progress }) => ({
        achievement,
        progress,
        recommendationReason: 'seasonal_timely' as const,
        priority: 8,
      }));

    // Step 8: Combine & Prioritize
    const allRecommendations = [
      ...almostComplete,
      ...nextTierCandidates,
      ...diversityCandidates,
      ...seasonalAchievements,
    ];

    // Remove duplicates, sort by priority, limit to requested count
    const uniqueRecommendations = Array.from(
      new Map(allRecommendations.map(r => [r.achievement.id, r])).values()
    )
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);

    return uniqueRecommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    return [];
  }
};

/**
 * Helper: Check if date is in range (handles year-wrap)
 */
function isDateInRange(
  date: Date,
  startMonth: number,
  startDay: number,
  endMonth: number,
  endDay: number
): boolean {
  const month = date.getMonth() + 1;
  const day = date.getDate();

  if (startMonth > endMonth) {
    // Year wrap case (e.g., Nov 20 - Jan 5)
    return (
      (month > startMonth || (month === startMonth && day >= startDay)) ||
      (month < endMonth || (month === endMonth && day <= endDay))
    );
  } else {
    // Same year case
    const afterStart = month > startMonth || (month === startMonth && day >= startDay);
    const beforeEnd = month < endMonth || (month === endMonth && day <= endDay);
    return afterStart && beforeEnd;
  }
}

/**
 * Validate recommendations quality
 */
export const validateRecommendations = (
  recommendations: RecommendedAchievement[],
  userId: string,
  isPremium: boolean
): ValidationReport => {
  const issues: string[] = [];

  // Check for duplicates
  const ids = recommendations.map(r => r.achievement.id);
  if (new Set(ids).size !== ids.length) {
    issues.push('Duplicate achievements in recommendations');
  }

  // Check for secret achievements
  if (recommendations.some(r => r.achievement.is_secret)) {
    issues.push('Secret achievement shown in recommendations');
  }

  // Check premium gating
  if (!isPremium && recommendations.some(r => r.achievement.is_premium)) {
    issues.push('Premium achievement shown to free user');
  }

  // Check disabled achievements
  if (recommendations.some(r => r.achievement.is_disabled)) {
    issues.push('Disabled achievement in recommendations');
  }

  // Check progress accuracy
  recommendations.forEach(r => {
    if (r.progress.percentage < 0 || r.progress.percentage > 100) {
      issues.push(`Invalid progress percentage for ${r.achievement.id}: ${r.progress.percentage}%`);
    }
  });

  // Check priority values
  recommendations.forEach(r => {
    if (r.priority < 1 || r.priority > 10) {
      issues.push(`Invalid priority for ${r.achievement.id}: ${r.priority}`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues,
    timestamp: new Date(),
  };
};
