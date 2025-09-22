import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type ExerciseFamily = Tables<'exercise_families'>;

export const useExerciseFamilies = () => {
  return useQuery({
    queryKey: ['exercise-families'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_families')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching exercise families:', error);
        throw error;
      }

      return data as ExerciseFamily[];
    },
  });
};