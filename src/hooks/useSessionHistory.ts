
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type SessionWithExercise = Tables<'user_sessions'> & {
  plank_exercises: Tables<'plank_exercises'> | null;
};

export const useSessionHistory = (limit = 10) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['session-history', user?.id, limit],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          plank_exercises (
            id,
            name,
            difficulty_level
          )
        `)
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching session history:', error);
        throw error;
      }

      return data as SessionWithExercise[];
    },
    enabled: !!user,
  });
};

export const useSessionStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['session-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Get all sessions for stats calculation
      const { data: sessions, error } = await supabase
        .from('user_sessions')
        .select('duration_seconds, completed_at, exercise_id')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching session stats:', error);
        throw error;
      }

      if (!sessions || sessions.length === 0) {
        return {
          totalSessions: 0,
          totalTimeSpent: 0,
          averageDuration: 0,
          thisWeekSessions: 0,
          weeklyGoal: 7,
          weeklyProgress: [],
        };
      }

      // Calculate basic stats
      const totalSessions = sessions.length;
      const totalTimeSpent = sessions.reduce((sum, session) => sum + session.duration_seconds, 0);
      const averageDuration = Math.round(totalTimeSpent / totalSessions);

      // Calculate this week's sessions
      const startOfWeek = new Date();
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      const thisWeekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.completed_at || '');
        return sessionDate >= startOfWeek;
      }).length;

      // Calculate weekly progress (last 7 days)
      const weeklyProgress = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDay = new Date(date);
        nextDay.setDate(nextDay.getDate() + 1);
        
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        const sessionsCount = sessions.filter(session => {
          const sessionDate = new Date(session.completed_at || '');
          return sessionDate >= date && sessionDate < nextDay;
        }).length;

        weeklyProgress.push({
          day: dayName,
          sessions: sessionsCount,
          completed: sessionsCount > 0,
        });
      }

      return {
        totalSessions,
        totalTimeSpent,
        averageDuration,
        thisWeekSessions,
        weeklyGoal: 7,
        weeklyProgress,
      };
    },
    enabled: !!user,
  });
};
