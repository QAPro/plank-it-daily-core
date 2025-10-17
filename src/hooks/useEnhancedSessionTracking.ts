
import { logInfo, logError, logDebug } from '@/utils/productionLogger';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNewExercises, type ExerciseWithCategory } from './useNewExercises';
import { toast } from 'sonner';
import { useStreak } from '@/components/StreakProvider';
import { ExpandedAchievementEngine } from '@/services/expandedAchievementService';
import { useXPTracking } from './useXPTracking';
import { useWorkoutFeedback } from './useWorkoutFeedback';
import { useAutoHookTracking } from './useHookModelTracking';
import type { WorkoutFeedback } from '@/components/feedback/WorkoutFeedback';

interface CompletedSession {
  id: string;
  duration: number;
  exercise: any;
  timestamp: string;
  achievements: any[];
  notes?: string;
  xpEarned?: number;
}

export const useEnhancedSessionTracking = () => {
  const { user } = useAuth();
  const { data: exercises, isLoading: isLoadingExercises } = useNewExercises();
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithCategory | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [completedSession, setCompletedSession] = useState<CompletedSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const [currentHookCycleId, setCurrentHookCycleId] = useState<string | null>(null);
  const { showMilestone } = useStreak();
  const { trackXP } = useXPTracking();
  const { submitFeedback } = useWorkoutFeedback();
  const { autoStartWorkoutCycle, autoCompleteWorkoutCycle, autoLogFriction } = useAutoHookTracking();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTimerRunning) {
      intervalId = setInterval(() => {
        setSessionDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isTimerRunning]);

  const startSession = async (exercise: ExerciseWithCategory) => {
    setSelectedExercise(exercise);
    setSessionDuration(0);
    setIsTimerRunning(true);
    setCompletedSession(null);
    setSessionNotes('');
    
    // Start hook cycle tracking
    try {
      const cycleId = await autoStartWorkoutCycle(exercise.id);
      setCurrentHookCycleId(cycleId);
      logInfo('Hook cycle started', { cycleId });
      } catch (error) {
        logError('Failed to start hook cycle', { exerciseId: exercise.id, error: error.message }, error);
      }
  };

  const pauseSession = () => {
    setIsTimerRunning(false);
  };

  const resumeSession = () => {
    setIsTimerRunning(true);
  };

  const endSession = () => {
    setIsTimerRunning(false);
  };

  const selectExercise = (exercise: ExerciseWithCategory) => {
    setSelectedExercise(exercise);
  };

  const clearCompletedSession = () => {
    logInfo('useEnhancedSessionTracking: Clearing completedSession');
    setCompletedSession(null);
  };

  const updateStreak = useCallback(async () => {
    if (!user) return { streak: 0, isNewStreak: false };

    try {
      // Fetch the user's current streak
      let { data: userStreak, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (streakError) {
        logError("Error fetching user streak", { error: streakError.message }, streakError);
        return { streak: 0, isNewStreak: false };
      }

      const today = new Date();
      const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const lastWorkoutDate = userStreak?.last_workout_date ? new Date(userStreak.last_workout_date) : null;

      let newStreak = 1;
      let isNewStreak = false;
      
      if (lastWorkoutDate) {
        const lastWorkoutMidnight = new Date(lastWorkoutDate.getFullYear(), lastWorkoutDate.getMonth(), lastWorkoutDate.getDate());
        const timeDiff = todayMidnight.getTime() - lastWorkoutMidnight.getTime();
        const dayDiff = timeDiff / (1000 * 3600 * 24);

        if (dayDiff === 1) {
          // Continue the streak
          newStreak = (userStreak?.current_streak || 0) + 1;
          isNewStreak = true;
        } else if (dayDiff > 1) {
          // Streak broken
          newStreak = 1;
          isNewStreak = true;
        } else {
          // Workout already recorded today
          return { streak: userStreak?.current_streak || 1, isNewStreak: false };
        }
      } else {
        isNewStreak = true;
      }

      // Update streak - separate data for INSERT and UPDATE
      const updateData = {
        current_streak: newStreak,
        last_workout_date: todayMidnight.toISOString().split('T')[0],
        longest_streak: Math.max(newStreak, userStreak?.longest_streak || 0),
      };

      const insertData = {
        user_id: user.id,
        ...updateData,
      };

      console.log('📊 UPDATING STREAK:', { 
        isUpdate: !!userStreak, 
        updateData, 
        insertData: userStreak ? null : insertData 
      });

      const { data: updatedStreak, error: updateError } = userStreak
        ? await supabase.from('user_streaks').update(updateData).eq('user_id', user.id).select().single()
        : await supabase.from('user_streaks').insert(insertData).select().single();

      if (updateError) {
        console.error('❌ STREAK UPDATE FAILED:', updateError);
        logError("Error updating user streak", { error: updateError.message, updateData, userStreak }, updateError);
        return { streak: newStreak, isNewStreak };
      }

      console.log('✅ STREAK UPDATED SUCCESSFULLY:', updatedStreak);

      // Check for milestone
      if (newStreak > 0 && newStreak % 7 === 0) {
        showMilestone({
          days: newStreak,
          title: `${newStreak}-Day Streak!`,
          description: `You've maintained a ${newStreak}-day streak! Keep it up!`
        });
      }

      return { streak: newStreak, isNewStreak };
    } catch (error) {
      logError("Unexpected error updating streak", { error: error.message }, error);
      return { streak: 0, isNewStreak: false };
    }
  }, [user, showMilestone]);

const completeSession = useCallback(async (duration: number, notes?: string) => {
  console.log('🎯 COMPLETE SESSION CALLED', { 
    userId: user?.id, 
    exerciseId: selectedExercise?.id, 
    duration, 
    notes,
    hasUser: !!user,
    hasSelectedExercise: !!selectedExercise,
    hookCycleId: currentHookCycleId
  });
  
  if (!user?.id) {
    console.error('❌ No authenticated user - cannot track workout progress');
    toast.error('Please log in to track your progress');
    return;
  }
  
  if (!user || !selectedExercise) {
    console.error('❌ COMPLETE SESSION FAILED: Missing user or exercise', { user: !!user, selectedExercise: !!selectedExercise });
    
    // Complete hook cycle as abandoned if we have one
    if (currentHookCycleId) {
      try {
        await autoCompleteWorkoutCycle(0, false);
        setCurrentHookCycleId(null);
      } catch (error) {
        console.error('Failed to complete hook cycle on error:', error);
      }
    }
    return;
  }

  setIsCompleting(true);
  
  try {
    console.log('💾 Creating session record...');
    
    // Create session record
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        exercise_id: selectedExercise.id,
        duration_seconds: duration,
        category: selectedExercise.exercise_categories?.name || 'Uncategorized',
        notes: notes || null,
      })
      .select()
      .single();

    if (sessionError) {
      logError('Error creating session', { error: sessionError.message }, sessionError);
      toast.error('Failed to save session');
      return;
    }

    logInfo('Session created successfully', { sessionId: session.id });

    // Update last workout for quick start (async, don't wait)
    try {
      const { QuickStartService } = await import('@/services/quickStartService');
      QuickStartService.updateLastWorkout(user.id, selectedExercise.id, duration).catch((error) => {
        logError('Error updating last workout', { error: error.message }, error);
      });
    } catch (error) {
      logError('Error importing QuickStartService', { error: error.message }, error);
    }

    // Update user streak and get streak info for XP calculation
    console.log('📊 Updating streak...');
    let streakResult;
    try {
      streakResult = await updateStreak();
      console.log('📊 Streak result:', { streak: streakResult.streak, isNewStreak: streakResult.isNewStreak });
      
      if (!streakResult) {
        console.error('⚠️ Streak update returned nothing');
        toast.error('Failed to update streak');
      }
    } catch (streakError) {
      console.error('❌ EXCEPTION updating streak:', streakError);
      toast.error('Session saved but streak update failed');
      streakResult = { streak: 0, isNewStreak: false };
    }

    // Award workout XP
    console.log('🎖️ AWARDING WORKOUT XP', {
      source: 'workout',
      data: {
        duration_seconds: duration,
        difficulty_level: selectedExercise.difficulty_level || 1,
        exercise_name: selectedExercise.name
      }
    });
    
    try {
      const workoutXPResult = await trackXP('workout', {
        duration_seconds: duration,
        difficulty_level: selectedExercise.difficulty_level || 1,
        exercise_name: selectedExercise.name
      });
      
      console.log('🎖️ WORKOUT XP RESULT:', workoutXPResult);
      
      if (!workoutXPResult?.success) {
        console.error('❌ Failed to award workout XP:', workoutXPResult?.error);
        toast.error("Session saved, but XP award failed - we'll investigate!");
      } else {
        toast.success(`+${workoutXPResult.xpAwarded || 0} XP earned!`);
      }
    } catch (xpError) {
      console.error('❌ EXCEPTION awarding workout XP:', xpError);
      toast.error('Session saved but XP system is offline');
    }

    // Award streak bonus XP if applicable
    if (streakResult.isNewStreak && streakResult.streak > 1) {
      console.log('🔥 AWARDING STREAK XP', {
        source: 'streak',
        data: {
          streak_length: streakResult.streak
        }
      });
      
      try {
        const streakXPResult = await trackXP('streak', {
          streak_length: streakResult.streak
        });
        
        console.log('🔥 STREAK XP RESULT:', streakXPResult);
        
        if (streakXPResult?.success) {
          toast.success(`🔥 ${streakResult.streak}-day streak bonus!`);
        }
      } catch (streakError) {
        console.error('❌ EXCEPTION awarding streak XP:', streakError);
      }
    } else {
      console.log('⏭️ SKIPPING STREAK XP', { 
        isNewStreak: streakResult.isNewStreak, 
        streak: streakResult.streak 
      });
    }

    // Record detailed timer session for analytics
    const { error: detailedError } = await supabase
      .from('timer_sessions_detailed')
      .insert({
        user_id: user.id,
        exercise_id: selectedExercise.id,
        duration_seconds: duration,
        target_duration: duration,
        completion_rate: 1,
        theme_used: null,
        coaching_enabled: false,
        breathing_guidance_used: false,
        performance_metrics: {},
        user_feedback: {},
      });

    if (detailedError) {
      console.error('Error inserting detailed timer session:', detailedError);
    }

    // Complete hook cycle tracking
    if (currentHookCycleId) {
      try {
        await autoCompleteWorkoutCycle(duration, true);
        setCurrentHookCycleId(null);
        console.log('Hook cycle completed successfully');
      } catch (error) {
        console.error('Failed to complete hook cycle:', error);
      }
    }

    // Update momentum score (async, don't block)
    console.log('📊 Updating momentum score...');
    try {
      const { updateMomentumScore } = await import('@/services/momentumScoreService');
      updateMomentumScore(user.id).catch((error) => {
        console.error('Error updating momentum score:', error);
      });
    } catch (error) {
      console.error('Error importing momentum service:', error);
    }

    // Check for new achievements using expanded engine
    console.log('🏆 Checking for achievements...');
    const achievementEngine = new ExpandedAchievementEngine(user.id);
    const newAchievements = await achievementEngine.checkAllAchievements({
      duration_seconds: duration,
      exercise_id: selectedExercise.id,
      user_id: user.id
    });

    console.log('🏆 New achievements earned:', newAchievements);

    // Award achievement XP
    if (newAchievements.length > 0) {
      console.log('🎯 AWARDING ACHIEVEMENT XP for', newAchievements.length, 'achievements');
      for (const achievement of newAchievements) {
        console.log('🎯 AWARDING ACHIEVEMENT XP', {
          source: 'achievement',
          data: {
            achievement_name: achievement.achievement_name,
            rarity: achievement.rarity || 'common'
          }
        });
        
        const achievementXPResult = await trackXP('achievement', {
          achievement_name: achievement.achievement_name,
          rarity: achievement.rarity || 'common'
        });
        
        console.log('🎯 ACHIEVEMENT XP RESULT:', achievementXPResult);
      }
    } else {
      console.log('⏭️ NO ACHIEVEMENTS EARNED - Skipping achievement XP');
    }

    setCompletedSession({
      id: session.id,
      duration,
      exercise: selectedExercise,
      timestamp: new Date().toISOString(),
      achievements: newAchievements,
      notes
    });

    console.log('✅ SESSION COMPLETION SUCCESS - Final session data:', {
      sessionId: session.id,
      duration,
      exerciseId: selectedExercise.id,
      achievementsCount: newAchievements.length,
      streakInfo: streakResult
    });
    
    toast.success('Session completed successfully!');
  } catch (error) {
    console.error('❌ UNEXPECTED ERROR COMPLETING SESSION:', error);
    console.error('❌ Error details:', {
      errorMessage: error.message,
      errorStack: error.stack,
      userId: user?.id,
      exerciseId: selectedExercise?.id,
      duration
    });
    toast.error('Failed to complete session');
  } finally {
    setIsCompleting(false);
  }
}, [user, selectedExercise, trackXP, currentHookCycleId, autoCompleteWorkoutCycle, updateStreak]);

  const handleFeedbackSubmission = useCallback(async (feedback: WorkoutFeedback) => {
    if (completedSession?.id) {
      await submitFeedback(completedSession.id, feedback);
    }
  }, [completedSession, submitFeedback]);

  return {
    exercises,
    isLoadingExercises,
    selectedExercise,
    isTimerRunning,
    sessionDuration,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    selectExercise,
    completeSession,
    completedSession,
    clearCompletedSession,
    sessionNotes,
    setSessionNotes,
    isCompleting,
    handleFeedbackSubmission,
    autoLogFriction, // Expose friction logging for timer components
    currentHookCycleId // Expose for debugging
  };
};
