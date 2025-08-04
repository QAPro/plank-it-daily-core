
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;
type UserPreferences = Tables<'user_preferences'>;
type ExercisePerformance = Tables<'user_exercise_performance'>;
type ExerciseRecommendation = Tables<'user_exercise_recommendations'>;

export const useExerciseRecommendations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['exercise-recommendations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_exercise_recommendations')
        .select(`
          *,
          plank_exercises (
            id,
            name,
            description,
            difficulty_level,
            category,
            tags,
            primary_muscles,
            is_beginner_friendly
          )
        `)
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('confidence_score', { ascending: false });

      if (error) {
        console.error('Error fetching recommendations:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // Fetch user preferences and performance data
      const [prefsResult, performanceResult, exercisesResult] = await Promise.all([
        supabase.from('user_preferences').select('*').eq('user_id', user.id).single(),
        supabase.from('user_exercise_performance').select('*').eq('user_id', user.id),
        supabase.from('plank_exercises').select('*').order('difficulty_level')
      ]);

      if (prefsResult.error || exercisesResult.error) {
        throw new Error('Failed to fetch user data');
      }

      const preferences = prefsResult.data as UserPreferences;
      const performance = performanceResult.data as ExercisePerformance[];
      const exercises = exercisesResult.data as Exercise[];

      // Clear existing recommendations
      await supabase
        .from('user_exercise_recommendations')
        .delete()
        .eq('user_id', user.id);

      // Generate new recommendations based on user data
      const recommendations = generateSmartRecommendations(preferences, performance, exercises);

      // Insert new recommendations
      const { error: insertError } = await supabase
        .from('user_exercise_recommendations')
        .insert(recommendations);

      if (insertError) throw insertError;

      return recommendations;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-recommendations'] });
      toast({
        title: "Recommendations Updated",
        description: "Your personalized exercise recommendations have been refreshed!",
      });
    },
    onError: (error) => {
      console.error('Error generating recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to update recommendations. Please try again.",
        variant: "destructive",
      });
    },
  });

  return {
    recommendations,
    isLoading,
    generateRecommendations: generateRecommendationsMutation.mutate,
    isGenerating: generateRecommendationsMutation.isPending,
  };
};

// Smart recommendation algorithm
const generateSmartRecommendations = (
  preferences: UserPreferences,
  performance: ExercisePerformance[],
  exercises: Exercise[]
): Omit<ExerciseRecommendation, 'id' | 'created_at' | 'expires_at'>[] => {
  const recommendations: Omit<ExerciseRecommendation, 'id' | 'created_at' | 'expires_at'>[] = [];
  const performanceMap = new Map(performance.map(p => [p.exercise_id, p]));

  exercises.forEach(exercise => {
    const userPerformance = performanceMap.get(exercise.id);
    const isFavorite = preferences.favorite_exercises?.includes(exercise.id);
    const isAvoided = preferences.avoided_exercises?.includes(exercise.id);

    if (isAvoided) return; // Skip avoided exercises

    let recommendationType: string | null = null;
    let confidenceScore = 0;
    let reasoning = '';

    // Beginner-friendly recommendation
    if (preferences.difficulty_preference === 'beginner' && exercise.is_beginner_friendly) {
      recommendationType = 'beginner_friendly';
      confidenceScore = 0.8;
      reasoning = 'Perfect for your current fitness level';
    }

    // Progressive challenge - fix the type comparison issue
    if (userPerformance && userPerformance.success_rate > 0.7) {
      const currentExerciseDifficulty = exercises.find(e => e.id === userPerformance.exercise_id)?.difficulty_level || 1;
      const nextLevel = currentExerciseDifficulty + 1;
      if (nextLevel <= 5 && exercise.difficulty_level === nextLevel) {
        recommendationType = 'progressive_challenge';
        confidenceScore = 0.9;
        reasoning = 'Ready to level up based on your performance';
      }
    }

    // Variety boost
    if (!userPerformance && exercise.difficulty_level <= getDifficultyLevel(preferences.difficulty_preference)) {
      recommendationType = 'variety_boost';
      confidenceScore = 0.6;
      reasoning = 'Add variety to your workout routine';
    }

    // Skill building
    if (exercise.primary_muscles && exercise.primary_muscles.includes('core')) {
      recommendationType = 'skill_building';
      confidenceScore = 0.7;
      reasoning = 'Excellent for core strength development';
    }

    // Favorite boost
    if (isFavorite) {
      confidenceScore = Math.min(confidenceScore + 0.2, 1.0);
      reasoning += ' (One of your favorites!)';
    }

    if (recommendationType && confidenceScore > 0) {
      recommendations.push({
        user_id: preferences.user_id,
        exercise_id: exercise.id,
        recommendation_type: recommendationType,
        confidence_score: confidenceScore,
        reasoning: reasoning,
      });
    }
  });

  return recommendations.sort((a, b) => b.confidence_score - a.confidence_score);
};

const getDifficultyLevel = (preference: string): number => {
  switch (preference) {
    case 'beginner': return 2;
    case 'intermediate': return 3;
    case 'advanced': return 5;
    default: return 2;
  }
};
