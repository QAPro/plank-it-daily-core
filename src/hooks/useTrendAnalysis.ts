import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useTrendAnalysis = (exerciseId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['trend-analysis', user?.id, exerciseId],
    queryFn: async () => {
      if (!user || !exerciseId) return null;

      // Get last 10 sessions for this exercise
      const { data, error } = await supabase
        .from('user_sessions')
        .select('duration_seconds, completed_at')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (error || !data || data.length < 4) {
        return { trendPercentage: 0, trendDirection: 'stable' as const };
      }

      // Split into recent (last 5) and previous (next 5)
      const recentSessions = data.slice(0, 5);
      const previousSessions = data.slice(5, 10);

      if (previousSessions.length === 0) {
        return { trendPercentage: 0, trendDirection: 'stable' as const };
      }

      const recentAvg = recentSessions.reduce((sum, session) => sum + session.duration_seconds, 0) / recentSessions.length;
      const previousAvg = previousSessions.reduce((sum, session) => sum + session.duration_seconds, 0) / previousSessions.length;

      const percentageChange = previousAvg > 0 ? ((recentAvg - previousAvg) / previousAvg) * 100 : 0;
      const direction = percentageChange > 5 ? 'up' : percentageChange < -5 ? 'down' : 'stable';

      return {
        trendPercentage: Math.abs(Math.round(percentageChange)),
        trendDirection: direction as 'up' | 'down' | 'stable'
      };
    },
    enabled: !!user && !!exerciseId,
  });
};