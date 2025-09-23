import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useSessionStats } from './useSessionHistory';
import { useStreakTracking } from './useStreakTracking';
import { useUserAchievements } from './useUserAchievements';

export interface ProgressMetrics {
  totalTimeDedicated: number; // seconds
  totalTimeDedicatedHours: number;
  achievementsEarned: number;
  xpGained: number;
  currentStreak: number;
  longestStreak: number;
  progressScore: number; // calculated progress metric
  progressGrowth: Array<{
    date: string;
    cumulativeTime: number;
    cumulativeAchievements: number;
    cumulativeXP: number;
  }>;
  portfolioBreakdown: {
    streakValue: number;
    achievementValue: number;
    xpValue: number;
    consistencyValue: number;
  };
}

export const useProgressAnalytics = () => {
  const { user } = useAuth();
  const { data: sessionStats, error: sessionStatsError } = useSessionStats();
  const { streak, error: streakError } = useStreakTracking();
  const { achievements, loading: achievementsLoading } = useUserAchievements();

  return useQuery({
    queryKey: ['progress-analytics', user?.id],
    queryFn: async (): Promise<ProgressMetrics | null> => {
      if (!user) return null;

      // Log any dependency errors for debugging
      if (sessionStatsError) console.warn('Session stats error:', sessionStatsError);
      if (streakError) console.warn('Streak error:', streakError);
      if (achievementsLoading) console.log('Achievements still loading...');

      // Get user's total XP
      const { data: userData } = await supabase
        .from('users')
        .select('total_xp, current_level')
        .eq('id', user.id)
        .single();

      // Get detailed session data for timeline
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('duration_seconds, completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: true });

      // Get XP transactions for timeline
      const { data: xpTransactions } = await supabase
        .from('xp_transactions')
        .select('amount, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      const totalTimeDedicated = sessionStats?.totalTimeSpent || 0;
      const totalTimeDedicatedHours = totalTimeDedicated / 3600;
      const achievementsEarned = achievements?.length || 0;
      const xpGained = userData?.total_xp || 0;
      const currentStreak = streak?.current_streak || 0;
      const longestStreak = streak?.longest_streak || 0;

      // Calculate Progress Score (achievements + XP per hour of dedication)
      const progressScore = totalTimeDedicatedHours > 0 
        ? Math.round((achievementsEarned * 100 + xpGained) / totalTimeDedicatedHours)
        : 0;

      // Build progress timeline
      const progressGrowth = [];
      let cumulativeTime = 0;
      let cumulativeAchievements = 0;
      let cumulativeXP = 0;

      // Group sessions and XP by date
      const dailyData = new Map();
      
      sessions?.forEach(session => {
        const date = session.completed_at?.split('T')[0];
        if (!date) return;
        
        if (!dailyData.has(date)) {
          dailyData.set(date, { time: 0, xp: 0 });
        }
        dailyData.get(date).time += session.duration_seconds;
      });

      xpTransactions?.forEach(transaction => {
        const date = transaction.created_at?.split('T')[0];
        if (!date) return;
        
        if (!dailyData.has(date)) {
          dailyData.set(date, { time: 0, xp: 0 });
        }
        dailyData.get(date).xp += transaction.amount;
      });

      // Build timeline with achievements (simplified - using even distribution)
      const sortedDates = Array.from(dailyData.keys()).sort();
      const achievementIncrement = achievementsEarned / Math.max(sortedDates.length, 1);

      sortedDates.forEach((date, index) => {
        const dayData = dailyData.get(date);
        cumulativeTime += dayData.time;
        cumulativeXP += dayData.xp;
        cumulativeAchievements += achievementIncrement;

        progressGrowth.push({
          date,
          cumulativeTime: Math.round(cumulativeTime),
          cumulativeAchievements: Math.round(cumulativeAchievements),
          cumulativeXP: Math.round(cumulativeXP),
        });
      });

      // Calculate progress breakdown (growth value in different areas)
      const portfolioBreakdown = {
        streakValue: Math.min(currentStreak * 10, 500), // Max 500 points for streaks
        achievementValue: achievementsEarned * 25,
        xpValue: Math.min(xpGained / 10, 1000), // Scale down XP for visualization
        consistencyValue: sessionStats?.totalSessions ? sessionStats.totalSessions * 15 : 0,
      };

      return {
        totalTimeDedicated,
        totalTimeDedicatedHours,
        achievementsEarned,
        xpGained,
        currentStreak,
        longestStreak,
        progressScore,
        progressGrowth,
        portfolioBreakdown,
      };
    },
    enabled: !!user,
    retry: (failureCount, error) => {
      console.warn(`Progress analytics retry attempt ${failureCount}:`, error);
      return failureCount < 2;
    },
  });
};