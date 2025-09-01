import { useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EXPANDED_ACHIEVEMENTS } from '@/services/expandedAchievementService';
import type { AchievementWithProgress } from './useExpandedAchievementProgress';

export const useOptimizedAchievementProgress = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [progressiveLoading, setProgressiveLoading] = useState(true);

  // Query for earned achievements (always fresh, loads quickly)
  const { data: earnedAchievements = [], isLoading: earnedLoading } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('user_achievements')
        .select('achievement_name, points, metadata, earned_at')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });
      return data || [];
    },
    enabled: !!user,
    staleTime: 0, // Always fresh since achievements don't change frequently
  });

  // Query for cached progress data (can be stale)
  const { data: cachedProgress = [], isLoading: progressLoading } = useQuery({
    queryKey: ['achievement-progress-cache', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data } = await supabase
        .from('user_achievement_progress')
        .select('*')
        .eq('user_id', user.id);
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    gcTime: 15 * 60 * 1000, // Keep in cache for 15 minutes
  });

  // Query to check if we need fresh calculations
  const { data: needsRefresh = false } = useQuery({
    queryKey: ['progress-freshness-check', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      // Get latest session timestamp
      const { data: latestSession } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!latestSession) return false;

      // Check if we have any progress that's older than the latest session
      const { data: staleProgress } = await supabase
        .from('user_achievement_progress')
        .select('last_updated')
        .eq('user_id', user.id)
        .lt('last_updated', latestSession.completed_at)
        .limit(1)
        .maybeSingle();

      return !!staleProgress;
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // Check every 2 minutes
  });

  // Optimized batch progress calculation
  const calculateProgressBatch = useCallback(async (achievementIds: string[]) => {
    if (!user || achievementIds.length === 0) return [];

    try {
      // Parallel queries for all needed data
      const [sessionsData, streakData, performanceData] = await Promise.all([
        supabase
          .from('user_sessions')
          .select('duration_seconds, exercise_id, completed_at, id')
          .eq('user_id', user.id)
          .order('completed_at', { ascending: false }),
        
        supabase
          .from('user_streaks')
          .select('current_streak, longest_streak')
          .eq('user_id', user.id)
          .maybeSingle(),
        
        supabase
          .from('user_exercise_performance')
          .select('exercise_id, best_duration_seconds, total_sessions')
          .eq('user_id', user.id)
      ]);

      const sessions = sessionsData.data || [];
      const streak = streakData.data;
      const performance = performanceData.data || [];

      // Pre-compute common calculations
      const totalSessions = sessions.length;
      const uniqueExercises = new Set(sessions.map(s => s.exercise_id).filter(Boolean));
      const totalDuration = sessions.reduce((sum, s) => sum + s.duration_seconds, 0);
      const bestDuration = Math.max(...sessions.map(s => s.duration_seconds), 0);
      
      // Morning sessions (5-9 AM)
      const morningSessions = sessions.filter(s => {
        const hour = new Date(s.completed_at || '').getHours();
        return hour >= 5 && hour < 9;
      }).length;
      
      // Evening sessions (7+ PM)
      const eveningSessions = sessions.filter(s => {
        const hour = new Date(s.completed_at || '').getHours();
        return hour >= 19;
      }).length;
      
      // Weekend sessions
      const weekendSessions = sessions.filter(s => {
        const day = new Date(s.completed_at || '').getDay();
        return day === 0 || day === 6;
      }).length;

      // Calculate progress for each achievement
      const progressResults = achievementIds.map(id => {
        const achievement = EXPANDED_ACHIEVEMENTS.find(a => a.id === id);
        if (!achievement) return { id, progress: 0 };

        let currentProgress = 0;
        const { type, value, conditions } = achievement.requirement;

        switch (type) {
          case 'streak':
            currentProgress = streak?.current_streak || 0;
            break;
          case 'duration':
            currentProgress = Math.min(bestDuration, value);
            break;
          case 'count':
            currentProgress = totalSessions;
            break;
          case 'variety':
            if (conditions?.within_timeframe) {
              const cutoff = new Date();
              cutoff.setDate(cutoff.getDate() - conditions.within_timeframe);
              const recentSessions = sessions.filter(s => 
                new Date(s.completed_at || '') > cutoff
              );
              const recentExercises = new Set(recentSessions.map(s => s.exercise_id).filter(Boolean));
              currentProgress = Math.min(recentExercises.size, value);
            } else {
              currentProgress = Math.min(uniqueExercises.size, value);
            }
            break;
          case 'time_based':
            if (conditions?.time_of_day === 'morning') {
              currentProgress = Math.min(morningSessions, value);
            } else if (conditions?.time_of_day === 'evening') {
              currentProgress = Math.min(eveningSessions, value);
            } else if (conditions?.time_of_day === 'weekend') {
              currentProgress = Math.min(weekendSessions, value);
            } else {
              currentProgress = Math.min(totalDuration, value);
            }
            break;
          case 'improvement':
            if (sessions.length >= 2) {
              const firstSession = sessions[sessions.length - 1].duration_seconds;
              const improvement = bestDuration - firstSession;
              if (conditions?.improvement_threshold === 100) {
                currentProgress = Math.min(((bestDuration / firstSession) * 100) - 100, 100);
              } else {
                currentProgress = Math.max(0, improvement);
              }
            }
            break;
        }

        return { id, progress: currentProgress };
      });

      // Batch update progress in database
      if (progressResults.length > 0) {
        const upsertData = progressResults.map(({ id, progress }) => ({
          user_id: user.id,
          achievement_id: id,
          current_progress: progress,
          target_progress: EXPANDED_ACHIEVEMENTS.find(a => a.id === id)?.requirement.value || 0,
          last_updated: new Date().toISOString()
        }));

        await supabase
          .from('user_achievement_progress')
          .upsert(upsertData, { onConflict: 'user_id,achievement_id' });
      }

      return progressResults;
    } catch (error) {
      console.error('Error calculating progress batch:', error);
      return [];
    }
  }, [user]);

  // Combined achievement data with smart loading
  const { data: achievementProgress = [], isLoading } = useQuery({
    queryKey: ['optimized-achievement-progress', user?.id, earnedAchievements?.length],
    queryFn: async () => {
      if (!user) return [];

      const earnedNames = new Set(earnedAchievements.map(a => a.achievement_name));
      const progressMap = new Map(cachedProgress.map(p => [p.achievement_id, p]));
      const results: AchievementWithProgress[] = [];

      // Phase 1: Show earned achievements immediately (no calculation needed)
      const earnedResults = EXPANDED_ACHIEVEMENTS
        .filter(achievement => earnedNames.has(achievement.name))
        .map(achievement => ({
          achievement,
          isEarned: true,
          currentProgress: achievement.requirement.value,
          progressPercentage: 100,
          estimatedCompletion: undefined
        }));

      results.push(...earnedResults);

      // Phase 2: Show unearned with cached progress
      const unearned = EXPANDED_ACHIEVEMENTS.filter(a => !earnedNames.has(a.name));
      
      for (const achievement of unearned) {
        const cachedData = progressMap.get(achievement.id);
        let currentProgress = cachedData?.current_progress || 0;
        
        // If we need refresh and no cached data, calculate fresh
        if (needsRefresh && !cachedData) {
          const freshProgress = await calculateProgressBatch([achievement.id]);
          currentProgress = freshProgress[0]?.progress || 0;
        }

        const progressPercentage = Math.min((currentProgress / achievement.requirement.value) * 100, 100);
        const estimatedCompletion = calculateEstimatedCompletion(achievement, currentProgress);

        results.push({
          achievement,
          isEarned: false,
          currentProgress,
          progressPercentage,
          estimatedCompletion
        });
      }

      // Background refresh if needed (don't block UI)
      if (needsRefresh) {
        const unearnedIds = unearned.map(a => a.id);
        calculateProgressBatch(unearnedIds).then(() => {
          // Invalidate cache to trigger re-render with fresh data
          queryClient.invalidateQueries({ queryKey: ['achievement-progress-cache', user.id] });
        });
      }

      return results.sort((a, b) => {
        // Earned first, then by progress percentage
        if (a.isEarned && !b.isEarned) return -1;
        if (!a.isEarned && b.isEarned) return 1;
        if (!a.isEarned && !b.isEarned) {
          return b.progressPercentage - a.progressPercentage;
        }
        return 0;
      });
    },
    enabled: !!user && !earnedLoading,
    staleTime: 30 * 1000, // 30 seconds
  });

  const calculateEstimatedCompletion = (achievement: any, currentProgress: number): string => {
    if (currentProgress === 0) return 'Start working out to make progress!';
    
    const remaining = achievement.requirement.value - currentProgress;
    if (remaining <= 0) return 'Almost there!';

    switch (achievement.requirement.type) {
      case 'streak':
        return `${remaining} more consecutive days`;
      case 'duration':
        return `${remaining} more seconds to achieve`;
      case 'count':
        return `${remaining} more workouts needed`;
      case 'variety':
        return `Try ${remaining} more exercise types`;
      case 'time_based':
        if (achievement.requirement.conditions?.time_of_day) {
          return `${remaining} more ${achievement.requirement.conditions.time_of_day} workouts`;
        }
        return `${Math.ceil(remaining / 60)} more minutes to accumulate`;
      default:
        return 'Keep going!';
    }
  };

  // Force refresh function for manual updates
  const refreshProgress = useCallback(async () => {
    if (!user) return;
    
    const allIds = EXPANDED_ACHIEVEMENTS.map(a => a.id);
    await calculateProgressBatch(allIds);
    
    // Invalidate all related queries
    queryClient.invalidateQueries({ queryKey: ['achievement-progress-cache', user.id] });
    queryClient.invalidateQueries({ queryKey: ['progress-freshness-check', user.id] });
    queryClient.invalidateQueries({ queryKey: ['optimized-achievement-progress', user.id] });
  }, [user, calculateProgressBatch, queryClient]);

  return {
    achievementProgress,
    loading: isLoading || earnedLoading,
    earnedCount: earnedAchievements.length,
    totalCount: EXPANDED_ACHIEVEMENTS.length,
    refetch: refreshProgress,
    needsRefresh,
    progressiveLoading
  };
};