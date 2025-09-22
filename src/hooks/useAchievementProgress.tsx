
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENTS, AchievementService } from '@/services/achievementService';
import type { Tables } from '@/integrations/supabase/types';

type UserAchievementProgress = Tables<'user_achievement_progress'>;

export interface AchievementWithProgress {
  achievement: any;
  isEarned: boolean;
  currentProgress: number;
  progressPercentage: number;
}

export const useAchievementProgress = () => {
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
      const achievementService = new AchievementService(user.id);
      const progressWithData: AchievementWithProgress[] = [];

      for (const achievement of ACHIEVEMENTS) {
        const isEarned = earnedNames.has(achievement.name);
        const progress = progressMap.get(achievement.id);
        
        let currentProgress = 0;
        if (!isEarned) {
          // Calculate current progress for unearned achievements
          currentProgress = await calculateCurrentProgress(achievement, achievementService);
          
          // Update progress in database if it's changed
          if (progress?.current_progress !== currentProgress) {
            await updateProgressInDatabase(achievement.id, currentProgress, achievement.condition.value);
          }
        }

        progressWithData.push({
          achievement,
          isEarned,
          currentProgress: isEarned ? achievement.condition.value : currentProgress,
          progressPercentage: isEarned ? 100 : Math.min((currentProgress / achievement.condition.value) * 100, 100)
        });
      }

      setAchievementProgress(progressWithData);
    } catch (error) {
      console.error('Error fetching achievement progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCurrentProgress = async (achievement: any, service: AchievementService) => {
    switch (achievement.condition.type) {
      case 'streak_days':
        return await calculateStreakProgress();
      case 'session_duration':
        return await calculateSessionDurationProgress(achievement.condition.value);
      case 'total_duration':
        return await calculateTotalDurationProgress();
      case 'weekly_consistency':
        return await calculateWeeklyConsistencyProgress(achievement.condition.value);
      case 'monthly_sessions':
        return await calculateMonthlySessionsProgress(achievement.condition.value);
      case 'improvement':
        return await calculateImprovementProgress();
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

  const calculateSessionDurationProgress = async (targetSeconds: number) => {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', user?.id)
      .order('duration_seconds', { ascending: false })
      .limit(1);
    return sessions?.[0]?.duration_seconds || 0;
  };

  const calculateTotalDurationProgress = async () => {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', user?.id);
    return sessions?.reduce((sum, session) => sum + session.duration_seconds, 0) || 0;
  };

  const calculateWeeklyConsistencyProgress = async (targetSessions: number) => {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', user?.id)
      .gte('completed_at', startOfWeek.toISOString());

    return sessions?.length || 0;
  };

  const calculateMonthlySessionsProgress = async (targetSessions: number) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', user?.id)
      .gte('completed_at', startOfMonth.toISOString());

    return sessions?.length || 0;
  };

  const calculateImprovementProgress = async () => {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds, completed_at')
      .eq('user_id', user?.id)
      .order('completed_at', { ascending: true });

    if (!sessions || sessions.length < 2) return 0;

    const firstSession = sessions[0].duration_seconds;
    const bestSession = Math.max(...sessions.map(s => s.duration_seconds));
    return Math.max(0, bestSession - firstSession);
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
