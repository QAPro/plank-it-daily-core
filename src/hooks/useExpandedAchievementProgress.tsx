
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { EXPANDED_ACHIEVEMENTS, ExpandedAchievementEngine } from '@/services/expandedAchievementService';
import type { Tables } from '@/integrations/supabase/types';

type UserAchievementProgress = Tables<'user_achievement_progress'>;

export interface AchievementWithProgress {
  achievement: any;
  isEarned: boolean;
  currentProgress: number;
  progressPercentage: number;
  estimatedCompletion?: string;
}

export const useExpandedAchievementProgress = () => {
  const { user } = useAuth();
  const [achievementProgress, setAchievementProgress] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      // Get earned achievements
      const { data: earnedAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_name')
        .eq('user_id', user.id);

      const earnedNames = new Set(earnedAchievements?.map(a => a.achievement_name) || []);

      // Get achievement progress
      const { data: progressData } = await supabase
        .from('user_achievement_progress')
        .select('*')
        .eq('user_id', user.id);

      const progressMap = new Map(
        progressData?.map(p => [p.achievement_id, p]) || []
      );

      // Combine achievement definitions with progress
      const progressWithData: AchievementWithProgress[] = [];

      for (const achievement of EXPANDED_ACHIEVEMENTS) {
        const isEarned = earnedNames.has(achievement.name);
        const progress = progressMap.get(achievement.id);
        
        let currentProgress = 0;
        if (!isEarned) {
          // Calculate current progress for unearned achievements
          currentProgress = await calculateCurrentProgress(achievement);
          
          // Update progress in database if it's changed
          if (progress?.current_progress !== currentProgress) {
            await updateProgressInDatabase(achievement.id, currentProgress, achievement.requirement.value);
          }
        }

        const estimatedCompletion = !isEarned ? calculateEstimatedCompletion(achievement, currentProgress) : undefined;

        progressWithData.push({
          achievement,
          isEarned,
          currentProgress: isEarned ? achievement.requirement.value : currentProgress,
          progressPercentage: isEarned ? 100 : Math.min((currentProgress / achievement.requirement.value) * 100, 100),
          estimatedCompletion
        });
      }

      setAchievementProgress(progressWithData);
    } catch (error) {
      console.error('Error fetching achievement progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentProgress = async (achievement: any) => {
    const engine = new ExpandedAchievementEngine(user?.id || '');
    
    switch (achievement.requirement.type) {
      case 'streak':
        return await calculateStreakProgress();
      case 'duration':
        return await calculateDurationProgress(achievement.requirement.value);
      case 'count':
        return await calculateCountProgress();
      case 'variety':
        return await calculateVarietyProgress(achievement.requirement.value, achievement.requirement.conditions);
      case 'time_based':
        return await calculateTimeBasedProgress(achievement.requirement.value, achievement.requirement.conditions);
      case 'improvement':
        return await calculateImprovementProgress(achievement.requirement.conditions);
      default:
        return 0;
    }
  };

  const calculateStreakProgress = async () => {
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', user?.id)
      .maybeSingle();
    return streak?.current_streak || 0;
  };

  const calculateDurationProgress = async (targetSeconds: number) => {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', user?.id)
      .order('duration_seconds', { ascending: false })
      .limit(1);
    return Math.min(sessions?.[0]?.duration_seconds || 0, targetSeconds);
  };

  const calculateCountProgress = async () => {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', user?.id);
    return sessions?.length || 0;
  };

  const calculateVarietyProgress = async (targetVariety: number, conditions?: any) => {
    let query = supabase
      .from('user_sessions')
      .select('exercise_id, completed_at')
      .eq('user_id', user?.id);

    if (conditions?.within_timeframe) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - conditions.within_timeframe);
      query = query.gte('completed_at', startDate.toISOString());
    }

    const { data: sessions } = await query;
    const uniqueExercises = new Set(sessions?.map(s => s.exercise_id).filter(Boolean));
    return Math.min(uniqueExercises.size, targetVariety);
  };

  const calculateTimeBasedProgress = async (targetValue: number, conditions?: any) => {
    if (conditions?.time_of_day === 'morning') {
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', user?.id);

      const morningCount = sessions?.filter(session => {
        const hour = new Date(session.completed_at || '').getHours();
        return hour >= 5 && hour < 9;
      }).length || 0;

      return Math.min(morningCount, targetValue);
    } else if (conditions?.time_of_day === 'evening') {
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', user?.id);

      const eveningCount = sessions?.filter(session => {
        const hour = new Date(session.completed_at || '').getHours();
        return hour >= 19;
      }).length || 0;

      return Math.min(eveningCount, targetValue);
    } else if (conditions?.time_of_day === 'weekend') {
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', user?.id);

      const weekendCount = sessions?.filter(session => {
        const day = new Date(session.completed_at || '').getDay();
        return day === 0 || day === 6;
      }).length || 0;

      return Math.min(weekendCount, targetValue);
    } else {
      // Total time accumulation
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('duration_seconds')
        .eq('user_id', user?.id);

      const totalDuration = sessions?.reduce((sum, session) => sum + session.duration_seconds, 0) || 0;
      return Math.min(totalDuration, targetValue);
    }
  };

  const calculateImprovementProgress = async (conditions?: any) => {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds, completed_at')
      .eq('user_id', user?.id)
      .order('completed_at', { ascending: true });

    if (!sessions || sessions.length < 2) return 0;

    const firstSession = sessions[0].duration_seconds;
    const bestSession = Math.max(...sessions.map(s => s.duration_seconds));
    const improvement = bestSession - firstSession;

    if (conditions?.improvement_threshold === 100) {
      // Double down achievement - return percentage of doubling
      return Math.min((bestSession / firstSession) * 100, 200) - 100;
    }

    return Math.max(0, improvement);
  };

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

  const updateProgressInDatabase = async (achievementId: string, currentProgress: number, targetProgress: number) => {
    if (!user) return;

    try {
      await supabase
        .from('user_achievement_progress')
        .upsert({
          user_id: user.id,
          achievement_id: achievementId,
          current_progress: currentProgress,
          target_progress: targetProgress,
          last_updated: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating achievement progress:', error);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  return {
    achievementProgress,
    loading,
    refetch: fetchProgressData
  };
};
