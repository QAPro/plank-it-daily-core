import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'exercises'>;
type ExerciseCategory = Tables<'exercise_categories'>;

export interface ExerciseWithCategory extends Exercise {
  exercise_categories: ExerciseCategory | null;
}

export const useNewExercises = (categoryId?: string) => {
  return useQuery({
    queryKey: ['new-exercises', categoryId],
    queryFn: async () => {
      let query = supabase
        .from('exercises')
        .select(`
          *,
          exercise_categories (*)
        `)
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching exercises:', error);
        throw error;
      }

      return data as ExerciseWithCategory[];
    },
  });
};

export const useNewExerciseById = (id: string | null) => {
  return useQuery({
    queryKey: ['new-exercise', id],
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('exercises')
        .select(`
          *,
          exercise_categories (*)
        `)
        .eq('id', id)
        .eq('is_active', true)
        .maybeSingle();

      if (error) {
        console.error('Error fetching exercise:', error);
        throw error;
      }

      return data as ExerciseWithCategory | null;
    },
    enabled: !!id,
  });
};
