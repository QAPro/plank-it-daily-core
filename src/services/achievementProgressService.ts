/**
 * Achievement Progress Calculation Service
 * Calculates real-time progress for all achievement types
 */

import { supabase } from '@/integrations/supabase/client';

// Generic achievement type for progress calculation
interface Achievement {
  id: string;
  unlock_criteria?: {
    type: string;
    value?: number;
    conditions?: Record<string, any>;
  };
}

export interface AchievementProgress {
  achievementId: string;
  current: number;
  required: number;
  percentage: number;
  isComplete: boolean;
  estimatedCompletion?: string;
  lastUpdated: Date;
}

/**
 * Main function to calculate progress for any achievement
 */
export const calculateAchievementProgress = async (
  userId: string,
  achievement: Achievement
): Promise<AchievementProgress> => {
  const { unlock_criteria: unlockCriteria } = achievement;
  
  if (!unlockCriteria) {
    return {
      achievementId: achievement.id,
      current: 0,
      required: 1,
      percentage: 0,
      isComplete: false,
      lastUpdated: new Date(),
    };
  }

  const required = unlockCriteria.value || 1;
  let current = 0;

  try {
    switch (unlockCriteria.type) {
      case 'session_count':
        current = await calculateSessionCount(userId, unlockCriteria.conditions);
        break;
      case 'streak':
        current = await calculateStreak(userId);
        break;
      case 'duration':
        current = await calculateDuration(userId, required);
        break;
      case 'consecutive_daily_sessions':
        current = await calculateConsecutiveDailySessions(userId);
        break;
      case 'personal_best':
        current = await calculatePersonalBest(userId);
        break;
      case 'personal_bests_count':
        current = await calculatePersonalBestsCount(userId, unlockCriteria.conditions);
        break;
      case 'difficulty_level_count':
        current = await calculateDifficultyLevelCount(userId, unlockCriteria.conditions);
        break;
      case 'seasonal_sessions':
        current = await calculateSeasonalSessions(userId, unlockCriteria.conditions);
        break;
      case 'date_range_sessions':
        current = await calculateDateRangeSessions(userId, unlockCriteria.conditions);
        break;
      case 'progressive_difficulty':
        current = await calculateProgressiveDifficulty(userId);
        break;
      case 'time_based':
        current = await calculateTimeBased(userId, unlockCriteria.conditions);
        break;
      default:
        current = 0;
    }

    const percentage = Math.min((current / required) * 100, 100);
    const isComplete = percentage >= 100;
    const estimatedCompletion = !isComplete ? getEstimatedCompletion(current, required, unlockCriteria.type) : undefined;

    return {
      achievementId: achievement.id,
      current,
      required,
      percentage,
      isComplete,
      estimatedCompletion,
      lastUpdated: new Date(),
    };
  } catch (error) {
    console.error(`Error calculating progress for ${achievement.id}:`, error);
    return {
      achievementId: achievement.id,
      current: 0,
      required,
      percentage: 0,
      isComplete: false,
      lastUpdated: new Date(),
    };
  }
};

/**
 * 1. Session Count Progress
 */
async function calculateSessionCount(userId: string, conditions?: Record<string, any>): Promise<number> {
  let query = supabase
    .from('user_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (conditions?.category) {
    query = query.eq('category', conditions.category);
  }

  const { count } = await query;
  return count || 0;
}

/**
 * 2. Streak Progress
 */
async function calculateStreak(userId: string): Promise<number> {
  const { data } = await supabase
    .from('user_streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .single();

  return data?.current_streak || 0;
}

/**
 * 3. Duration Progress (checks if user has completed session >= target duration)
 */
async function calculateDuration(userId: string, targetSeconds: number): Promise<number> {
  const { data } = await supabase
    .from('user_sessions')
    .select('duration_seconds')
    .eq('user_id', userId)
    .gte('duration_seconds', targetSeconds)
    .limit(1)
    .single();

  return data ? 1 : 0;
}

/**
 * 4. Consecutive Daily Sessions
 */
async function calculateConsecutiveDailySessions(userId: string): Promise<number> {
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false });

  if (!sessions || sessions.length === 0) return 0;

  let consecutiveDays = 1;
  let lastDate = new Date(sessions[0].completed_at);
  lastDate.setHours(0, 0, 0, 0);

  for (let i = 1; i < sessions.length; i++) {
    const currentDate = new Date(sessions[i].completed_at);
    currentDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((lastDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      consecutiveDays++;
      lastDate = currentDate;
    } else if (daysDiff === 0) {
      // Same day, continue
      continue;
    } else {
      // Gap detected
      break;
    }
  }

  return consecutiveDays;
}

/**
 * 5. Personal Best
 */
async function calculatePersonalBest(userId: string): Promise<number> {
  const { data } = await supabase
    .from('user_sessions')
    .select('was_personal_best')
    .eq('user_id', userId)
    .order('completed_at', { ascending: false })
    .limit(1)
    .single();

  return data?.was_personal_best ? 1 : 0;
}

/**
 * 6. Personal Bests Count (within timeframe)
 */
async function calculatePersonalBestsCount(userId: string, conditions?: Record<string, any>): Promise<number> {
  let query = supabase
    .from('user_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('was_personal_best', true);

  if (conditions?.timeframe === 'month') {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    query = query.gte('completed_at', thirtyDaysAgo.toISOString());
  }

  const { count } = await query;
  return count || 0;
}

/**
 * 7. Difficulty Level Count
 */
async function calculateDifficultyLevelCount(userId: string, conditions?: Record<string, any>): Promise<number> {
  const difficultyLevels = conditions?.difficulty_levels || [4, 5];

  // First, get exercise IDs matching difficulty levels
  const { data: exercises } = await supabase
    .from('exercises')
    .select('id')
    .in('difficulty_level', difficultyLevels);

  if (!exercises || exercises.length === 0) return 0;

  const exerciseIds = exercises.map(e => e.id);

  // Then count sessions with those exercise IDs
  const { count } = await supabase
    .from('user_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('exercise_id', exerciseIds);

  return count || 0;
}

/**
 * 8. Seasonal Sessions
 */
async function calculateSeasonalSessions(userId: string, conditions?: Record<string, any>): Promise<number> {
  if (!conditions?.months || !Array.isArray(conditions.months)) return 0;

  const currentYear = new Date().getFullYear();
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('completed_at')
    .eq('user_id', userId)
    .gte('completed_at', `${currentYear}-01-01`)
    .lte('completed_at', `${currentYear}-12-31`);

  if (!sessions) return 0;

  const filteredSessions = sessions.filter(session => {
    const month = new Date(session.completed_at).getMonth() + 1;
    return conditions.months.includes(month);
  });

  return filteredSessions.length;
}

/**
 * 9. Date Range Sessions (handles year-wrap)
 */
async function calculateDateRangeSessions(userId: string, conditions?: Record<string, any>): Promise<number> {
  if (!conditions?.startMonth || !conditions?.endMonth) return 0;

  const { startMonth, startDay = 1, endMonth, endDay = 31 } = conditions;
  const currentYear = new Date().getFullYear();
  
  let startDate: Date;
  let endDate: Date;

  if (startMonth > endMonth) {
    // Year wrap (e.g., Nov 20 - Jan 5)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (currentMonth >= startMonth) {
      // We're in the start year
      startDate = new Date(currentYear, startMonth - 1, startDay);
      endDate = new Date(currentYear + 1, endMonth - 1, endDay);
    } else {
      // We're in the end year
      startDate = new Date(currentYear - 1, startMonth - 1, startDay);
      endDate = new Date(currentYear, endMonth - 1, endDay);
    }
  } else {
    // Same year range
    startDate = new Date(currentYear, startMonth - 1, startDay);
    endDate = new Date(currentYear, endMonth - 1, endDay);
  }

  const { count } = await supabase
    .from('user_sessions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('completed_at', startDate.toISOString())
    .lte('completed_at', endDate.toISOString());

  return count || 0;
}

/**
 * 10. Progressive Difficulty
 */
async function calculateProgressiveDifficulty(userId: string): Promise<number> {
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select(`
      completed_at,
      exercises!inner(difficulty_level)
    `)
    .eq('user_id', userId)
    .order('completed_at', { ascending: true });

  if (!sessions || sessions.length < 2) return 0;

  let progressiveIncreases = 0;
  let lastDifficulty = (sessions[0].exercises as any)?.difficulty_level || 0;

  for (let i = 1; i < sessions.length; i++) {
    const currentDifficulty = (sessions[i].exercises as any)?.difficulty_level || 0;
    if (currentDifficulty > lastDifficulty) {
      progressiveIncreases++;
    }
    lastDifficulty = currentDifficulty;
  }

  return progressiveIncreases;
}

/**
 * 11. Time-Based (morning/evening sessions)
 */
async function calculateTimeBased(userId: string, conditions?: Record<string, any>): Promise<number> {
  const { data: sessions } = await supabase
    .from('user_sessions')
    .select('completed_at')
    .eq('user_id', userId);

  if (!sessions) return 0;

  const filteredSessions = sessions.filter(session => {
    const hour = new Date(session.completed_at).getHours();
    
    if (conditions?.timeOfDay === 'morning') {
      return hour < 9;
    } else if (conditions?.timeOfDay === 'evening') {
      return hour >= 21;
    }
    
    return false;
  });

  return filteredSessions.length;
}

/**
 * Generate estimated completion text
 */
function getEstimatedCompletion(current: number, required: number, type: string): string {
  const remaining = required - current;
  
  if (remaining <= 0) return 'Complete!';
  
  switch (type) {
    case 'session_count':
    case 'consecutive_daily_sessions':
    case 'personal_bests_count':
    case 'difficulty_level_count':
    case 'seasonal_sessions':
    case 'date_range_sessions':
    case 'progressive_difficulty':
    case 'time_based':
      return `${remaining} more session${remaining !== 1 ? 's' : ''}`;
    case 'streak':
      return `${remaining} more day${remaining !== 1 ? 's' : ''}`;
    case 'duration':
      return `Complete 1 session of ${required}+ seconds`;
    case 'personal_best':
      return 'Beat your personal best';
    default:
      return `${remaining} remaining`;
  }
}

/**
 * Update cached progress in database
 */
export const updateProgressCache = async (
  userId: string,
  achievementId: string,
  progress: AchievementProgress
): Promise<void> => {
  try {
    await supabase
      .from('user_achievement_progress')
      .upsert({
        user_id: userId,
        achievement_id: achievementId,
        current_progress: progress.current,
        target_progress: progress.required,
        last_updated: new Date().toISOString(),
        progress_data: {
          percentage: Math.round(progress.percentage),
          estimatedCompletion: progress.estimatedCompletion
        }
      });
  } catch (error) {
    console.error('Error updating progress cache:', error);
  }
};
