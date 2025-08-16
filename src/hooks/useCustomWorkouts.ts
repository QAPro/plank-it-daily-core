
import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export type CustomWorkout = Tables<'custom_workouts'>;
export type CustomWorkoutExercise = Tables<'custom_workout_exercises'>;

export type WorkoutItemInput = {
  exercise_id: string;
  duration_seconds: number;
  rest_after_seconds: number;
};

type CreatePayload = {
  workout: {
    name: string;
    description?: string | null;
    difficulty_level: number;
    is_public?: boolean;
  };
  items: WorkoutItemInput[];
};

type UpdatePayload = {
  workoutId: string;
  updates: Partial<Pick<CustomWorkout, 'name' | 'description' | 'difficulty_level' | 'is_public' | 'total_duration'>>;
  items: WorkoutItemInput[];
};

export const useCustomWorkouts = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = useMemo(() => ['custom-workouts', user?.id], [user?.id]);

  const listQuery = useQuery({
    queryKey,
    enabled: !!user?.id,
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('custom_workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading custom workouts:', error);
        throw error;
      }
      return data as CustomWorkout[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ workout, items }: CreatePayload) => {
      if (!user?.id) throw new Error('Not authenticated');

      const totalDuration =
        items.reduce((sum, i) => sum + i.duration_seconds + (i.rest_after_seconds || 0), 0);

      // Insert custom_workouts
      const { data: inserted, error: insertError } = await supabase
        .from('custom_workouts')
        .insert({
          user_id: user.id,
          name: workout.name,
          description: workout.description || null,
          difficulty_level: workout.difficulty_level,
          is_public: workout.is_public ?? false,
          total_duration: totalDuration,
        })
        .select('*')
        .single();

      if (insertError) {
        console.error('Error creating workout:', insertError);
        throw insertError;
      }

      // Insert exercises
      if (items.length > 0) {
        const rows = items.map((it, idx) => ({
          custom_workout_id: inserted.id,
          exercise_id: it.exercise_id,
          duration_seconds: it.duration_seconds,
          rest_after_seconds: it.rest_after_seconds || 0,
          order_index: idx,
        }));
        const { error: exError } = await supabase
          .from('custom_workout_exercises')
          .insert(rows);

        if (exError) {
          console.error('Error adding workout items:', exError);
          throw exError;
        }
      }

      return inserted as CustomWorkout;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Workout saved', description: 'Your custom workout has been created.' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ workoutId, updates, items }: UpdatePayload) => {
      if (!user?.id) throw new Error('Not authenticated');

      const totalDuration = items.reduce(
        (sum, i) => sum + i.duration_seconds + (i.rest_after_seconds || 0),
        0
      );

      const { error: upErr } = await supabase
        .from('custom_workouts')
        .update({
          ...updates,
          total_duration: totalDuration,
          updated_at: new Date().toISOString(),
        })
        .eq('id', workoutId)
        .eq('user_id', user.id);

      if (upErr) {
        console.error('Error updating workout:', upErr);
        throw upErr;
      }

      // Replace all exercises for this workout (simple and reliable)
      const { error: delErr } = await supabase
        .from('custom_workout_exercises')
        .delete()
        .eq('custom_workout_id', workoutId);

      if (delErr) {
        console.error('Error clearing workout items:', delErr);
        throw delErr;
      }

      if (items.length > 0) {
        const rows = items.map((it, idx) => ({
          custom_workout_id: workoutId,
          exercise_id: it.exercise_id,
          duration_seconds: it.duration_seconds,
          rest_after_seconds: it.rest_after_seconds || 0,
          order_index: idx,
        }));
        const { error: insErr } = await supabase
          .from('custom_workout_exercises')
          .insert(rows);

        if (insErr) {
          console.error('Error inserting new workout items:', insErr);
          throw insErr;
        }
      }

      return { workoutId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Workout updated', description: 'Your custom workout has been updated.' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (workoutId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('custom_workouts')
        .delete()
        .eq('id', workoutId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error deleting workout:', error);
        throw error;
      }
      return { workoutId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast({ title: 'Workout deleted', description: 'Your custom workout has been deleted.' });
    },
  });

  return {
    user,
    listQuery,
    createWorkout: createMutation.mutateAsync,
    updateWorkout: updateMutation.mutateAsync,
    deleteWorkout: deleteMutation.mutateAsync,
  };
};
