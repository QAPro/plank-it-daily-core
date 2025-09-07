import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import PredictiveLoadingService from '@/services/predictiveLoadingService';

export const usePredictiveLoading = () => {
  const { user } = useAuth();
  const [isPreloading, setIsPreloading] = useState(false);

  // Get predicted exercises
  const { data: predictions = [], isLoading } = useQuery({
    queryKey: ['predictive-exercises', user?.id],
    queryFn: () => user ? PredictiveLoadingService.getCachedPredictions(user.id) : [],
    enabled: !!user,
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
  });

  // Preload exercises on mount and when user changes
  useEffect(() => {
    if (user) {
      setIsPreloading(true);
      PredictiveLoadingService.preloadLikelyExercises(user.id)
        .finally(() => setIsPreloading(false));
    }
  }, [user?.id]);

  // Update patterns after workout completion
  const updateAfterWorkout = async (exerciseId: string, duration: number) => {
    if (user) {
      await PredictiveLoadingService.updatePatternsAfterWorkout(
        user.id,
        exerciseId,
        duration
      );
    }
  };

  return {
    predictions,
    isLoading: isLoading || isPreloading,
    updateAfterWorkout,
    preloadExercises: () => user ? PredictiveLoadingService.preloadLikelyExercises(user.id) : Promise.resolve()
  };
};