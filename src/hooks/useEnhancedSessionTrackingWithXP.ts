
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useExercises } from './useExercises';
import { toast } from 'sonner';
import { useStreak } from '@/components/StreakProvider';
import { ExpandedAchievementEngine } from '@/services/expandedAchievementService';
import { useXPTracking } from './useXPTracking';

interface CompletedSession {
  id: string;
  duration: number;
  exercise: any;
  timestamp: string;
  achievements: any[];
  notes?: string;
  xpEarned?: number;
}

export const useEnhancedSessionTrackingWithXP = () => {
  const { user } = useAuth();
  const { data: exercises, isLoading: isLoadingExercises } = useExercises();
  const [selectedExercise, setSelectedExercise] = useState<any>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [completedSession, setCompletedSession] = useState<CompletedSession | null>(null);
  const [sessionNotes, setSessionNotes] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);
  const { showMilestone } = useStreak();
  const { trackXP } = useXPTracking();

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isTimerRunning) {
      intervalId = setInterval(() => {
        setSessionDuration((prevDuration) => prevDuration + 1);
      }, 1000);
    }

    return () => clearInterval(intervalId);
  }, [isTimerRunning]);

  const startSession = (exercise: any) => {
    setSelectedExercise(exercise);
    setSessionDuration(0);
    setIsTimerRunning(true);
    setCompletedSession(null);
    setSessionNotes('');
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

  const selectExercise = (exercise: any) => {
    setSelectedExercise(exercise);
  };

  const updateStreak = useCallback(async () => {
    if (!user) return { streak: 0, isNewStreak: false };

    try {
      // Fetch the user's current streak
      let { data: userStreak, error: streakError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (streakError) {
        console.error("Error fetching user streak:", streakError);
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

      // Update streak
      const updates = {
        user_id: user.id,
        current_streak: newStreak,
        last_workout_date: todayMidnight.toISOString().split('T')[0],
        longest_streak: Math.max(newStreak, userStreak?.longest_streak || 0),
      };

      const { error: updateError } = userStreak
        ? await supabase.from('user_streaks').update(updates).eq('user_id', user.id)
        : await supabase.from('user_streaks').insert(updates);

      if (updateError) {
        console.error("Error updating user streak:", updateError);
        return { streak: newStreak, isNewStreak };
      }

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
      console.error("Unexpected error updating streak:", error);
      return { streak: 0, isNewStreak: false };
    }
  }, [user, showMilestone]);

const completeSession = async (duration: number, notes?: string) => {
  if (!user || !selectedExercise) return;

  setIsCompleting(true);
  
  try {
    console.log('Completing session:', { duration, exerciseId: selectedExercise.id });
    
    // Create session record
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        exercise_id: selectedExercise.id,
        duration_seconds: duration,
        notes: notes || null,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Error creating session:', sessionError);
      toast.error('Failed to save session');
      return;
    }

    console.log('Session created successfully:', session);

    // Update user streak and get streak info for XP calculation
    const streakResult = await updateStreak();

    // Award workout XP
    await trackXP('workout', {
      duration_seconds: duration,
      difficulty_level: selectedExercise.difficulty_level || 1,
      exercise_name: selectedExercise.name
    });

    // Award streak bonus XP if applicable
    if (streakResult.isNewStreak && streakResult.streak > 1) {
      await trackXP('streak', {
        streak_length: streakResult.streak
      });
    }

    // Check for new achievements using expanded engine
    const achievementEngine = new ExpandedAchievementEngine(user.id);
    const newAchievements = await achievementEngine.checkAllAchievements({
      duration_seconds: duration,
      exercise_id: selectedExercise.id,
      user_id: user.id
    });

    console.log('New achievements earned:', newAchievements);

    // Award achievement XP
    for (const achievement of newAchievements) {
      await trackXP('achievement', {
        achievement_name: achievement.achievement_name,
        rarity: achievement.rarity || 'common'
      });
    }

    setCompletedSession({
      id: session.id,
      duration,
      exercise: selectedExercise,
      timestamp: new Date().toISOString(),
      achievements: newAchievements,
      notes
    });

    toast.success('Session completed successfully!');
  } catch (error) {
    console.error('Unexpected error completing session:', error);
    toast.error('Failed to complete session');
  } finally {
    setIsCompleting(false);
  }
};

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
    sessionNotes,
    setSessionNotes,
    isCompleting
  };
};
