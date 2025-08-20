
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type SessionWithExercise = Tables<'user_sessions'> & {
  plank_exercises: Tables<'plank_exercises'> | null;
};

export const useExtendedSessionHistory = (days = 30) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['extended-session-history', user?.id, days],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_sessions')
        .select(`
          *,
          plank_exercises (
            id,
            name,
            difficulty_level,
            category
          )
        `)
        .eq('user_id', user.id)
        .gte('completed_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('completed_at', { ascending: false });

      if (error) {
        console.error('Error fetching extended session history:', error);
        throw error;
      }

      return data as SessionWithExercise[];
    },
    enabled: !!user,
  });
};
