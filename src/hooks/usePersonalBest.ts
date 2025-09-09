import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const usePersonalBest = (exerciseId: string | null) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['personal-best', user?.id, exerciseId],
    queryFn: async () => {
      if (!user || !exerciseId) return null;

      const { data, error } = await supabase
        .from('user_sessions')
        .select('duration_seconds')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .order('duration_seconds', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching personal best:', error);
        return null;
      }

      return data?.duration_seconds || 0;
    },
    enabled: !!user && !!exerciseId,
  });
};