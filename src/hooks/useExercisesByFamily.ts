import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface ExercisesByFamily {
  [familyKey: string]: Exercise[];
}

export const useExercisesByFamily = () => {
  return useQuery({
    queryKey: ['exercises-by-family', 'v2'],
    queryFn: async () => {
      const { data: exercises, error } = await supabase
        .from('plank_exercises')
        .select('*')
        .order('difficulty_level', { ascending: true });

      if (error) {
        console.error('Error fetching exercises:', error);
        throw error;
      }

      // Group exercises by family using the mapping logic
      const exercisesByFamily: ExercisesByFamily = {};
      
      exercises?.forEach((exercise) => {
        let familyKey: string;
        
        // Apply the same logic as the database function
        if (exercise.category === 'planking') {
          familyKey = exercise.difficulty_level <= 2 ? 'basic_planking' : 'advanced_planking';
        } else if (exercise.category === 'leg_lift') {
          familyKey = exercise.difficulty_level <= 2 ? 'basic_leg_lifts' : 'advanced_leg_lifts';
        } else if (exercise.category === 'seated_exercise') {
          familyKey = 'seated_exercise';
        } else if (exercise.category === 'standing_movement') {
          familyKey = 'standing_movement';
        } else if (exercise.category === 'cardio' || exercise.category === 'strength') {
          familyKey = 'cardio_strength';
        } else {
          familyKey = exercise.category;
        }

        if (!exercisesByFamily[familyKey]) {
          exercisesByFamily[familyKey] = [];
        }
        exercisesByFamily[familyKey].push(exercise);
      });

      // Sort exercises within each family by difficulty, then alphabetically
      Object.keys(exercisesByFamily).forEach(familyKey => {
        exercisesByFamily[familyKey].sort((a, b) => {
          if (a.difficulty_level !== b.difficulty_level) {
            return a.difficulty_level - b.difficulty_level;
          }
          return a.name.localeCompare(b.name);
        });
      });

      return exercisesByFamily;
    },
  });
};