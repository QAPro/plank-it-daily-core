import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { WorkoutFeedbackService, type FeedbackInsights } from '@/services/workoutFeedbackService';
import type { WorkoutFeedback } from '@/components/feedback/WorkoutFeedback';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export const useWorkoutFeedback = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Defensive check for QueryClient availability (handles iframe timing issues)
  let queryClient;
  try {
    queryClient = useQueryClient();
  } catch (error) {
    console.warn('QueryClient not available yet, feedback features will be limited');
    queryClient = null;
  }

  // Submit workout feedback
  const submitFeedback = useCallback(async (
    sessionId: string, 
    feedback: WorkoutFeedback
  ) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit feedback",
        variant: "destructive"
      });
      return;
    }

    try {
      await WorkoutFeedbackService.storeFeedback(user.id, sessionId, feedback);
      
      // Invalidate related queries if QueryClient is available
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['workout-feedback', user.id] });
        queryClient.invalidateQueries({ queryKey: ['feedback-insights', user.id] });
      }
      
      toast({
        title: "Feedback saved!",
        description: "Thanks for sharing your experience. This helps us provide better recommendations.",
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      toast({
        title: "Failed to save feedback",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [user, toast, queryClient]);

  // Get recent feedback - only if QueryClient is available
  const { data: recentFeedback, isLoading: isLoadingFeedback } = queryClient ? useQuery({
    queryKey: ['workout-feedback', user?.id],
    queryFn: async () => {
      if (!user) return [];
      return WorkoutFeedbackService.getRecentFeedback(user.id, 10);
    },
    enabled: !!user,
  }) : { data: [], isLoading: false };

  // Get feedback insights - only if QueryClient is available
  const { data: insights, isLoading: isLoadingInsights } = queryClient ? useQuery({
    queryKey: ['feedback-insights', user?.id],
    queryFn: async (): Promise<FeedbackInsights | null> => {
      if (!user) return null;
      return WorkoutFeedbackService.generateFeedbackInsights(user.id);
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 30, // 30 minutes
  }) : { data: null, isLoading: false };

  // Log rest day
  const logRestDay = useCallback(async (activities: string[] = []) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to track rest days",
        variant: "destructive"
      });
      return;
    }

    try {
      await WorkoutFeedbackService.logRestDay(user.id, activities);
      
      // Invalidate related queries if QueryClient is available
      if (queryClient) {
        queryClient.invalidateQueries({ queryKey: ['rest-day', user.id] });
      }
      
      toast({
        title: "Rest day logged!",
        description: "Recovery is an important part of your fitness journey.",
      });
    } catch (error) {
      console.error('Error logging rest day:', error);
      toast({
        title: "Failed to log rest day",
        description: "Please try again",
        variant: "destructive"
      });
    }
  }, [user, toast, queryClient]);

  // Get last rest day - only if QueryClient is available
  const { data: lastRestDay } = queryClient ? useQuery({
    queryKey: ['rest-day', user?.id],
    queryFn: async () => {
      if (!user) return null;
      return WorkoutFeedbackService.getLastRestDay(user.id);
    },
    enabled: !!user,
  }) : { data: null };

  return {
    submitFeedback,
    recentFeedback,
    isLoadingFeedback,
    insights,
    isLoadingInsights,
    logRestDay,
    lastRestDay
  };
};