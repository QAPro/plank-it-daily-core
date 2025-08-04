
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type ExercisePerformance = Tables<'user_exercise_performance'>;

export const useExercisePerformance = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: performanceData, isLoading } = useQuery({
    queryKey: ['exercise-performance', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_exercise_performance')
        .select(`
          *,
          plank_exercises (
            id,
            name,
            difficulty_level
          )
        `)
        .eq('user_id', user.id)
        .order('best_duration_seconds', { ascending: false });

      if (error) {
        console.error('Error fetching performance data:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  const updatePerformanceMutation = useMutation({
    mutationFn: async ({ exerciseId, durationSeconds, difficultyRating }: {
      exerciseId: string;
      durationSeconds: number;
      difficultyRating?: number;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Check if performance record exists
      const { data: existing } = await supabase
        .from('user_exercise_performance')
        .select('*')
        .eq('user_id', user.id)
        .eq('exercise_id', exerciseId)
        .single();

      if (existing) {
        // Update existing record
        const newBest = Math.max(existing.best_duration_seconds, durationSeconds);
        const newTotalSessions = existing.total_sessions + 1;
        const newAverageSeconds = Math.round(
          ((existing.average_duration_seconds * existing.total_sessions) + durationSeconds) / newTotalSessions
        );

        const { error } = await supabase
          .from('user_exercise_performance')
          .update({
            best_duration_seconds: newBest,
            average_duration_seconds: newAverageSeconds,
            total_sessions: newTotalSessions,
            last_session_at: new Date().toISOString(),
            difficulty_rating: difficultyRating || existing.difficulty_rating,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Create new record
        const { error } = await supabase
          .from('user_exercise_performance')
          .insert({
            user_id: user.id,
            exercise_id: exerciseId,
            best_duration_seconds: durationSeconds,
            average_duration_seconds: durationSeconds,
            total_sessions: 1,
            last_session_at: new Date().toISOString(),
            difficulty_rating: difficultyRating,
          });

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-performance'] });
      queryClient.invalidateQueries({ queryKey: ['exercise-recommendations'] });
    },
    onError: (error) => {
      console.error('Error updating performance:', error);
      toast({
        title: "Error",
        description: "Failed to update exercise performance.",
        variant: "destructive",
      });
    },
  });

  const getPerformanceForExercise = (exerciseId: string) => {
    return performanceData?.find(p => p.exercise_id === exerciseId);
  };

  return {
    performanceData,
    isLoading,
    updatePerformance: updatePerformanceMutation.mutate,
    isUpdating: updatePerformanceMutation.isPending,
    getPerformanceForExercise,
  };
};
