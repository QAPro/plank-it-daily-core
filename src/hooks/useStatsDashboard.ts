import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, startOfDay } from 'date-fns';

export const useStatsDashboard = () => {
  const { user } = useAuth();

  // Key Metrics
  const { data: keyMetrics = { totalWorkouts: 0, activeDays: 0, currentStreak: 0, totalDuration: '0h 0m' }, isLoading: metricsLoading } = useQuery({
    queryKey: ['stats-key-metrics', user?.id],
    queryFn: async () => {
      if (!user) return { totalWorkouts: 0, activeDays: 0, currentStreak: 0, totalDuration: '0h 0m' };

      // Total workouts
      const { count: totalWorkouts } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Active days (last 7 days)
      const sevenDaysAgo = startOfDay(subDays(new Date(), 7)).toISOString();
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', sevenDaysAgo);

      const uniqueDays = new Set(
        sessions?.map(s => format(new Date(s.completed_at!), 'yyyy-MM-dd')) || []
      );
      const activeDays = uniqueDays.size;

      // Current streak
      const { data: allSessions } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false });

      let currentStreak = 0;
      let checkDate = startOfDay(new Date());
      
      if (allSessions && allSessions.length > 0) {
        const sessionDates = new Set(
          allSessions.map(s => format(new Date(s.completed_at!), 'yyyy-MM-dd'))
        );

        while (sessionDates.has(format(checkDate, 'yyyy-MM-dd'))) {
          currentStreak++;
          checkDate = subDays(checkDate, 1);
        }
      }

      // Total duration
      const { data: durationData } = await supabase
        .from('user_sessions')
        .select('duration_seconds')
        .eq('user_id', user.id);

      const totalSeconds = durationData?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const totalDuration = `${hours}h ${minutes}m`;

      return {
        totalWorkouts: totalWorkouts || 0,
        activeDays,
        currentStreak,
        totalDuration,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Weekly Activity
  const { data: weeklyActivity = [], isLoading: activityLoading } = useQuery({
    queryKey: ['stats-weekly-activity', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const sevenDaysAgo = startOfDay(subDays(new Date(), 6)).toISOString();
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', sevenDaysAgo);

      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const activity = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const workoutCount = sessions?.filter(
          s => format(new Date(s.completed_at!), 'yyyy-MM-dd') === dateStr
        ).length || 0;

        return {
          label: days[date.getDay() === 0 ? 6 : date.getDay() - 1],
          hasWorkout: workoutCount > 0,
          workoutCount,
        };
      });

      return activity;
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Personal Records - using user_sessions for best performances
  const { data: personalRecords = [], isLoading: recordsLoading } = useQuery({
    queryKey: ['stats-personal-records', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get top 3 longest sessions
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select(`
          id,
          duration_seconds,
          completed_at,
          exercise_id,
          exercises (name)
        `)
        .eq('user_id', user.id)
        .order('duration_seconds', { ascending: false })
        .limit(3);

      return (sessions || []).map(session => ({
        id: session.id,
        exerciseName: (session.exercises as any)?.name || 'Unknown',
        duration: `${Math.floor(session.duration_seconds / 60)}:${String(session.duration_seconds % 60).padStart(2, '0')}`,
        date: session.completed_at ? format(new Date(session.completed_at), 'MMM d, yyyy') : 'N/A',
      }));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Recent Achievements
  const { data: recentAchievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['stats-recent-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data } = await supabase
        .from('user_achievements')
        .select(`
          id,
          earned_at,
          achievement_name,
          description
        `)
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false })
        .limit(3);

      return (data || []).map(achievement => ({
        id: achievement.id,
        title: achievement.achievement_name || 'Achievement',
        badge: '🏆',
        date: achievement.earned_at ? format(new Date(achievement.earned_at), 'MMM d, yyyy') : 'N/A',
      }));
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return {
    keyMetrics,
    weeklyActivity,
    personalRecords,
    recentAchievements,
    isLoading: metricsLoading || activityLoading || recordsLoading || achievementsLoading,
  };
};
