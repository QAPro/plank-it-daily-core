import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, subDays, startOfDay, startOfWeek, eachWeekOfInterval } from 'date-fns';

type DateRange = 7 | 30 | 90 | 180 | 'all';
type MetricType = 'duration' | 'momentum' | 'workouts' | 'avg_duration' | 'variety';

export const useDeepDiveAnalytics = (days: DateRange = 30, metric: MetricType = 'duration') => {
  const { user } = useAuth();

  // Performance Trends
  const { data: performanceTrends = [], isLoading: trendsLoading } = useQuery({
    queryKey: ['deep-dive-trends', user?.id, days, metric],
    queryFn: async () => {
      if (!user) return [];

      // Build query with date filter
      let query = supabase
        .from('user_sessions')
        .select('completed_at, duration_seconds, momentum_points_earned, category')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: true });

      if (days !== 'all') {
        const startDate = startOfDay(subDays(new Date(), days - 1)).toISOString();
        query = query.gte('completed_at', startDate);
      }

      const { data } = await query;

      if (!data || data.length === 0) return [];

      // Group by date based on metric type
      if (metric === 'workouts') {
        // For workouts per week, group by week
        const weekMap = new Map<string, number>();
        data.forEach(session => {
          const weekStart = format(startOfWeek(new Date(session.completed_at!)), 'MMM d');
          weekMap.set(weekStart, (weekMap.get(weekStart) || 0) + 1);
        });
        return Array.from(weekMap.entries()).map(([date, count]) => ({
          date,
          value: count,
        }));
      } else {
        // For other metrics, group by day
        const dateMap = new Map<string, { duration: number; momentum: number; count: number; categories: Set<string> }>();
        data.forEach(session => {
          const date = format(new Date(session.completed_at!), 'MMM d');
          const current = dateMap.get(date) || { duration: 0, momentum: 0, count: 0, categories: new Set() };
          current.duration += session.duration_seconds || 0;
          current.momentum += session.momentum_points_earned || 0;
          current.count += 1;
          if (session.category) current.categories.add(session.category);
          dateMap.set(date, current);
        });

        return Array.from(dateMap.entries()).map(([date, stats]) => {
          let value = 0;
          switch (metric) {
            case 'duration':
              value = Math.round(stats.duration / 60); // Convert to minutes
              break;
            case 'momentum':
              value = stats.momentum;
              break;
            case 'avg_duration':
              value = Math.round(stats.duration / stats.count / 60); // Average in minutes
              break;
            case 'variety':
              value = stats.categories.size;
              break;
          }
          return { date, value };
        });
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // AI Insights (rule-based)
  const { data: aiInsights = [], isLoading: insightsLoading } = useQuery({
    queryKey: ['deep-dive-insights', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const insights: Array<{ title: string; description: string }> = [];

      // Most active day
      const sevenDaysAgo = startOfDay(subDays(new Date(), 7)).toISOString();
      const { data: recentSessions } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', sevenDaysAgo);

      if (recentSessions && recentSessions.length > 0) {
        const dayCount = new Map<string, number>();
        recentSessions.forEach(session => {
          const day = format(new Date(session.completed_at!), 'EEEE');
          dayCount.set(day, (dayCount.get(day) || 0) + 1);
        });

        const mostActiveDay = Array.from(dayCount.entries()).sort((a, b) => b[1] - a[1])[0];
        if (mostActiveDay) {
          insights.push({
            title: 'Peak Performance Day',
            description: `You're most active on ${mostActiveDay[0]}s with ${mostActiveDay[1]} workouts this week!`,
          });
        }
      }

      // Category preference
      const { data: categories } = await supabase
        .from('user_sessions')
        .select('category')
        .eq('user_id', user.id)
        .not('category', 'is', null)
        .limit(20);

      if (categories && categories.length > 0) {
        const categoryCount = new Map<string, number>();
        categories.forEach(session => {
          if (session.category) {
            categoryCount.set(session.category, (categoryCount.get(session.category) || 0) + 1);
          }
        });

        const topCategory = Array.from(categoryCount.entries()).sort((a, b) => b[1] - a[1])[0];
        if (topCategory) {
          insights.push({
            title: 'Favorite Exercise Type',
            description: `${topCategory[0]} exercises make up ${Math.round((topCategory[1] / categories.length) * 100)}% of your recent workouts.`,
          });
        }
      }

      // Consistency insight
      const thirtyDaysAgo = startOfDay(subDays(new Date(), 30)).toISOString();
      const { data: monthSessions } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', thirtyDaysAgo);

      if (monthSessions) {
        const uniqueDays = new Set(
          monthSessions.map(s => format(new Date(s.completed_at!), 'yyyy-MM-dd'))
        );
        const consistencyRate = Math.round((uniqueDays.size / 30) * 100);
        insights.push({
          title: 'Consistency Score',
          description: `You've been active ${uniqueDays.size} out of 30 days this month (${consistencyRate}% consistency).`,
        });
      }

      return insights.slice(0, 4);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  // Exercise Breakdown
  const { data: exerciseBreakdown = [], isLoading: breakdownLoading } = useQuery({
    queryKey: ['deep-dive-breakdown', user?.id, days],
    queryFn: async () => {
      if (!user) return [];

      // Build query with date filter
      let query = supabase
        .from('user_sessions')
        .select('category')
        .eq('user_id', user.id)
        .not('category', 'is', null);

      if (days !== 'all') {
        const startDate = startOfDay(subDays(new Date(), days - 1)).toISOString();
        query = query.gte('completed_at', startDate);
      }

      const { data } = await query;

      if (!data || data.length === 0) return [];

      const categoryCount = new Map<string, number>();
      data.forEach(session => {
        if (session.category) {
          categoryCount.set(session.category, (categoryCount.get(session.category) || 0) + 1);
        }
      });

      const total = data.length;
      return Array.from(categoryCount.entries())
        .map(([name, value]) => ({
          name,
          value,
          percentage: Math.round((value / total) * 100),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  });

  return {
    performanceTrends,
    aiInsights,
    exerciseBreakdown,
    isLoading: trendsLoading || insightsLoading || breakdownLoading,
  };
};
