import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type ExerciseCategory = Tables<'exercise_categories'>;

export const useExerciseCategories = () => {
  return useQuery({
    queryKey: ['exercise-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) {
        console.error('Error fetching exercise categories:', error);
        throw error;
      }

      return data as ExerciseCategory[];
    },
  });
};
