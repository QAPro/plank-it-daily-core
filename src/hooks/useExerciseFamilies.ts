import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;
type ExerciseFamily = Tables<'exercise_families'>;

export interface ExerciseFamilyWithExercises extends ExerciseFamily {
  exercises: Exercise[];
}

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

export const useExercisesGroupedByFamily = () => {
  return useQuery({
    queryKey: ['exercises-grouped-by-family'],
    queryFn: async () => {
      // First get all families
      const { data: families, error: familiesError } = await supabase
        .from('exercise_families')
        .select('*')
        .order('display_order', { ascending: true });

      if (familiesError) {
        console.error('Error fetching exercise families:', familiesError);
        throw familiesError;
      }

      // Then get all exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from('plank_exercises')
        .select('*')
        .order('difficulty_level', { ascending: true });

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        throw exercisesError;
      }

      // Group exercises by family using the mapping function logic
      const familiesWithExercises: ExerciseFamilyWithExercises[] = families.map(family => {
        const familyExercises = exercises.filter(exercise => {
          const exerciseFamily = getExerciseFamilyKey(exercise.category, exercise.difficulty_level);
          return exerciseFamily === family.family_key;
        });

        // Sort exercises within each family by difficulty, then alphabetically
        familyExercises.sort((a, b) => {
          if (a.difficulty_level !== b.difficulty_level) {
            return a.difficulty_level - b.difficulty_level;
          }
          return a.name.localeCompare(b.name);
        });

        return {
          ...family,
          exercises: familyExercises
        };
      });

      return familiesWithExercises;
    },
  });
};

// Helper function that mirrors the database function logic
function getExerciseFamilyKey(category: string, difficultyLevel: number): string {
  if (category === 'planking' && difficultyLevel <= 2) return 'basic_planking';
  if (category === 'planking' && difficultyLevel >= 3) return 'advanced_planking';
  if (category === 'core') return 'core';
  if (category === 'leg_lift') return 'leg_lift';
  if (category === 'seated_exercise') return 'seated_exercise';
  if (category === 'standing_movement') return 'standing_movement';
  if (category === 'cardio' || category === 'strength') return 'cardio_strength';
  return category;
}