import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Helper to get Monday of current week
const getMonday = (date: Date): string => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  return monday.toISOString().split('T')[0];
};

export const useMomentumScore = () => {
  const { user } = useAuth();
  const weekStartDate = getMonday(new Date());

  return useQuery({
    queryKey: ['momentum-score', user?.id, weekStartDate],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .rpc('get_user_momentum_score', {
          _user_id: user.id,
          _week_start_date: weekStartDate
        });

      if (error) throw error;

      // Also get the breakdown components
      const { data: breakdown, error: breakdownError } = await supabase
        .rpc('calculate_momentum_components', {
          _user_id: user.id,
          _week_start_date: weekStartDate
        });

      if (breakdownError) throw breakdownError;

      return {
        score: data || 0,
        breakdown: breakdown || {
          workout_count: 0,
          personal_bests: 0,
          categories_explored: 0,
          avg_difficulty: 0
        }
      };
    },
    enabled: !!user,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false
  });
};
