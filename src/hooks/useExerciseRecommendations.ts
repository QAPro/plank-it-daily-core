
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SmartRecommendationsService } from '@/services/smartRecommendationsService';
import { isAIEnabled } from '@/constants/featureGating';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'exercises'>;
type UserPreferences = Tables<'user_preferences'>;
type ExercisePerformance = Tables<'user_exercise_performance'>;
type ExerciseRecommendation = Tables<'user_exercise_recommendations'> & {
  exercises: Exercise | null;
};

export const useExerciseRecommendations = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['exercise-recommendations', user?.id],
    queryFn: async (): Promise<ExerciseRecommendation[]> => {
      if (!user || !isAIEnabled()) return [];

      // First get the recommendations
      const { data: recommendationsData, error: recommendationsError } = await supabase
        .from('user_exercise_recommendations')
        .select('*')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('confidence_score', { ascending: false });

      if (recommendationsError) {
        console.error('Error fetching recommendations:', recommendationsError);
        throw recommendationsError;
      }

      if (!recommendationsData || recommendationsData.length === 0) {
        return [];
      }

      // Then get the exercises for these recommendations
      const exerciseIds = recommendationsData.map(rec => rec.exercise_id);
      const { data: exercisesData, error: exercisesError } = await supabase
        .from('exercises')
        .select('*')
        .in('id', exerciseIds);

      if (exercisesError) {
        console.error('Error fetching exercises:', exercisesError);
        throw exercisesError;
      }

      // Combine the data
      const exercisesMap = new Map(exercisesData?.map(ex => [ex.id, ex]) || []);
      
      return recommendationsData.map(rec => ({
        ...rec,
        exercises: exercisesMap.get(rec.exercise_id) || null
      }));
    },
    enabled: !!user && isAIEnabled(),
  });

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      if (!isAIEnabled()) throw new Error('AI features are disabled');

      // Clear existing recommendations
      await supabase
        .from('user_exercise_recommendations')
        .delete()
        .eq('user_id', user.id);

      // Use the smart recommendations service
      const smartService = new SmartRecommendationsService(user.id);
      const smartRecommendations = await smartService.generateSmartRecommendations();

      // Handle rest day recommendation
      if (smartRecommendations.length === 1 && smartRecommendations[0].rest_recommendation) {
        return { restDay: true, recommendations: [] };
      }

      // Convert to database format and insert
      const dbRecommendations = smartRecommendations.map(rec => ({
        user_id: user.id,
        exercise_id: rec.exercise_id,
        recommendation_type: rec.recommendation_type,
        confidence_score: rec.confidence_score,
        reasoning: rec.reasoning,
      }));

      const { error: insertError } = await supabase
        .from('user_exercise_recommendations')
        .insert(dbRecommendations);

      if (insertError) throw insertError;

      return { restDay: false, recommendations: dbRecommendations };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['exercise-recommendations'] });
      
      if (result.restDay) {
        toast({
          title: "Rest Day Recommended",
          description: "Your body needs recovery. Take a well-deserved break!",
        });
      } else {
        toast({
          title: "Recommendations Updated",
          description: "Your personalized exercise recommendations have been refreshed!",
        });
      }
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

  // Legacy smart recommendation algorithm for fallback
  const generateSmartRecommendations = (
    preferences: UserPreferences,
    performance: ExercisePerformance[],
    exercises: Exercise[]
  ): Omit<Tables<'user_exercise_recommendations'>, 'id' | 'created_at' | 'expires_at'>[] => {
    const recommendations: Omit<Tables<'user_exercise_recommendations'>, 'id' | 'created_at' | 'expires_at'>[] = [];
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
      if (preferences.difficulty_preference === 'beginner' && exercise.tier_required === 'free') {
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

      // Skill building - exercises table doesn't have primary_muscles, skip this
      // if (exercise.primary_muscles && exercise.primary_muscles.includes('core')) {
      //   recommendationType = 'skill_building';
      //   confidenceScore = 0.7;
      //   reasoning = 'Excellent for core strength development';
      // }

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

  return {
    recommendations: isAIEnabled() ? recommendations : [],
    isLoading: isAIEnabled() ? isLoading : false,
    generateRecommendations: generateRecommendationsMutation.mutate,
    isGenerating: generateRecommendationsMutation.isPending,
  };
};

const getDifficultyLevel = (preference: string): number => {
  switch (preference) {
    case 'beginner': return 2;
    case 'intermediate': return 3;
    case 'advanced': return 5;
    default: return 2;
  }
};
