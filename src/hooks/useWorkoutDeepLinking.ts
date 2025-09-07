import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useExercises } from '@/hooks/useExercises';
import { useToast } from '@/hooks/use-toast';

export interface WorkoutDeepLinkData {
  exerciseId: string;
  duration: number;
  autoStart?: boolean;
  source?: string;
}

export const useWorkoutDeepLinking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { data: exercises } = useExercises();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [deepLinkData, setDeepLinkData] = useState<WorkoutDeepLinkData | null>(null);

  useEffect(() => {
    if (!user || !exercises || exercises.length === 0) return;

    // Check for various deep link parameters
    const quickStart = searchParams.get('quick-start');
    const startWorkout = searchParams.get('start-workout');
    const exerciseId = searchParams.get('exercise-id');
    const duration = searchParams.get('duration');
    const autoStart = searchParams.get('auto-start');
    const source = searchParams.get('source');

    // Handle different deep link formats
    if (quickStart === 'true') {
      // Quick start without specific parameters
      setDeepLinkData({
        exerciseId: exercises[0]?.id || '',
        duration: 60, // Default duration
        autoStart: true,
        source: 'quick-start'
      });
    } else if (startWorkout && duration) {
      // Direct workout start with specific exercise and duration
      const exercise = exercises.find(e => e.id === startWorkout || e.name.toLowerCase().includes(startWorkout.toLowerCase()));
      if (exercise) {
        setDeepLinkData({
          exerciseId: exercise.id,
          duration: parseInt(duration, 10) || 60,
          autoStart: autoStart === 'true',
          source: source || 'notification'
        });
      } else {
        toast({
          title: "Exercise not found",
          description: `Could not find exercise: ${startWorkout}`,
          variant: "destructive"
        });
      }
    } else if (exerciseId && duration) {
      // Direct exercise ID and duration
      const exercise = exercises.find(e => e.id === exerciseId);
      if (exercise) {
        setDeepLinkData({
          exerciseId,
          duration: parseInt(duration, 10) || 60,
          autoStart: autoStart === 'true',
          source: source || 'direct'
        });
      }
    }

    // Clear URL parameters after processing to prevent re-triggering
    if (deepLinkData) {
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('quick-start');
      newSearchParams.delete('start-workout');
      newSearchParams.delete('exercise-id');
      newSearchParams.delete('duration');
      newSearchParams.delete('auto-start');
      newSearchParams.delete('source');
      
      // Update URL without the processed parameters
      setSearchParams(newSearchParams, { replace: true });
    }
  }, [user, exercises, searchParams]);

  const clearDeepLinkData = () => {
    setDeepLinkData(null);
  };

  const createWorkoutLink = (exerciseId: string, duration: number, options?: {
    autoStart?: boolean;
    source?: string;
  }) => {
    const params = new URLSearchParams({
      'exercise-id': exerciseId,
      'duration': duration.toString(),
    });

    if (options?.autoStart) {
      params.set('auto-start', 'true');
    }

    if (options?.source) {
      params.set('source', options.source);
    }

    return `${window.location.origin}/?${params.toString()}`;
  };

  const createQuickStartLink = (source?: string) => {
    const params = new URLSearchParams({
      'quick-start': 'true',
    });

    if (source) {
      params.set('source', source);
    }

    return `${window.location.origin}/?${params.toString()}`;
  };

  return {
    deepLinkData,
    clearDeepLinkData,
    createWorkoutLink,
    createQuickStartLink,
    hasDeepLink: !!deepLinkData
  };
};