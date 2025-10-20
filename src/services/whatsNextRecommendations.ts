/**
 * "What's Next?" Hybrid Recommendation Algorithm
 * Generates personalized achievement recommendations
 */

import { supabase } from '@/integrations/supabase/client';
import { getActiveAchievements, getAchievementById } from './achievementHelpers';
import { calculateAchievementProgress, type AchievementProgress } from './achievementProgressService';
import type { Achievement } from './achievementDefinitions';

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
 * Main recommendation function
 */
export const getWhatsNextRecommendations = async (
  userId: string,
  limit: number = 5
): Promise<RecommendedAchievement[]> => {
  try {
    // Step 1: Get user context
    const { data: earnedAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_type')
      .eq('user_id', userId);

    const earnedIds = new Set((earnedAchievements || []).map(a => a.achievement_type));

    // Get active achievements (not disabled, not earned, not secret)
    const activeAchievements = getActiveAchievements().filter(
      ach => !earnedIds.has(ach.id) && !ach.isSecret
    );

    // Check premium status
    const { data: userData } = await supabase
      .from('users')
      .select('subscription_tier')
      .eq('id', userId)
      .single();

    const isPremium = userData?.subscription_tier === 'premium';

    // Filter out premium achievements for free users
    const availableAchievements = activeAchievements.filter(
      ach => !ach.isPremium || isPremium
    );

    if (availableAchievements.length === 0) {
      return [];
    }

    // Step 2: Calculate progress for all available achievements
    const progressData = await Promise.all(
      availableAchievements.map(async (achievement) => {
        const progress = await calculateAchievementProgress(userId, achievement);
        return { achievement, progress };
      })
    );

    // Step 3: Strategy 1 - Almost Complete (Top Priority)
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

    // Step 4: Strategy 2 - Next Tier Challenges
    const rarityCount = {
      Common: (earnedAchievements || []).filter(a => 
        getAchievementById(a.achievement_type)?.rarity === 'Common'
      ).length,
      Uncommon: (earnedAchievements || []).filter(a => 
        getAchievementById(a.achievement_type)?.rarity === 'Uncommon'
      ).length,
      Rare: (earnedAchievements || []).filter(a => 
        getAchievementById(a.achievement_type)?.rarity === 'Rare'
      ).length,
      Epic: (earnedAchievements || []).filter(a => 
        getAchievementById(a.achievement_type)?.rarity === 'Epic'
      ).length,
    };

    // Determine next logical tier
    let targetRarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic';
    if (rarityCount.Common < 5) {
      targetRarity = 'Common';
    } else if (rarityCount.Common >= 5 && rarityCount.Uncommon < 5) {
      targetRarity = 'Uncommon';
    } else if (rarityCount.Uncommon >= 5 && rarityCount.Rare < 5) {
      targetRarity = 'Rare';
    } else {
      targetRarity = 'Epic';
    }

    const nextTierCandidates = progressData
      .filter(({ achievement }) => achievement.rarity === targetRarity)
      .sort((a, b) => b.progress.percentage - a.progress.percentage)
      .slice(0, 2)
      .map(({ achievement, progress }) => ({
        achievement,
        progress,
        recommendationReason: 'next_tier' as const,
        priority: 7,
      }));

    // Step 5: Strategy 3 - Category Diversity
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
            achievement.relatedExerciseCategories.includes(leastUsedCategory)
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

    // Step 6: Strategy 4 - Seasonal/Timely
    const currentMonth = new Date().getMonth() + 1;
    const currentDate = new Date();
    
    const seasonalAchievements = progressData
      .filter(({ achievement }) => {
        const { unlockCriteria } = achievement;
        if (!unlockCriteria) return false;

        if (unlockCriteria.type === 'seasonal_sessions') {
          const months = unlockCriteria.conditions?.months || [];
          return months.includes(currentMonth);
        }

        if (unlockCriteria.type === 'date_range_sessions') {
          const { startMonth, endMonth, startDay = 1, endDay = 31 } = unlockCriteria.conditions || {};
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

    // Step 7: Combine & Prioritize
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
  if (recommendations.some(r => r.achievement.isSecret)) {
    issues.push('Secret achievement shown in recommendations');
  }

  // Check premium gating
  if (!isPremium && recommendations.some(r => r.achievement.isPremium)) {
    issues.push('Premium achievement shown to free user');
  }

  // Check disabled achievements
  if (recommendations.some(r => r.achievement.isDisabled)) {
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
