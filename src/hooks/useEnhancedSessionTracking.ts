
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { AchievementService } from '@/services/achievementService';
import type { Tables } from '@/integrations/supabase/types';
import type { UserAchievement } from '@/hooks/useUserAchievements';

type Exercise = Tables<'plank_exercises'>;

interface SessionData {
  exercise: Exercise;
  durationSeconds: number;
  notes?: string;
}

interface SessionResult {
  milestoneEvent: MilestoneEvent | null;
  newAchievements: UserAchievement[];
  isPersonalBest: boolean;
  previousBest?: number;
  caloriesEstimate: number;
  completionPercentage: number;
}

interface MilestoneEvent {
  milestone: {
    days: number;
    title: string;
    description: string;
  };
  isNewMilestone: boolean;
}

export const useEnhancedSessionTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [personalBests, setPersonalBests] = useState<Record<string, number>>({});

  // Load personal bests on mount
  useEffect(() => {
    loadPersonalBests();
  }, [user]);

  const loadPersonalBests = async () => {
    if (!user) return;

    try {
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('exercise_id, duration_seconds')
        .eq('user_id', user.id);

      if (sessions) {
        const bests: Record<string, number> = {};
        sessions.forEach(session => {
          const exerciseId = session.exercise_id;
          if (exerciseId && (!bests[exerciseId] || session.duration_seconds > bests[exerciseId])) {
            bests[exerciseId] = session.duration_seconds;
          }
        });
        setPersonalBests(bests);
      }
    } catch (error) {
      console.error('Error loading personal bests:', error);
    }
  };

  const calculateCalories = (durationSeconds: number, exerciseDifficulty: number): number => {
    // Base calorie burn rate for plank: ~2-4 calories per minute depending on body weight and intensity
    const baseRate = 2.5; // calories per minute for average person
    const difficultyMultiplier = 1 + (exerciseDifficulty - 1) * 0.2; // 20% increase per level
    const minutes = durationSeconds / 60;
    return Math.round(baseRate * difficultyMultiplier * minutes);
  };

  const saveEnhancedSession = async (sessionData: SessionData): Promise<SessionResult> => {
    if (!user) {
      console.log('No user found, skipping session save');
      return {
        milestoneEvent: null,
        newAchievements: [],
        isPersonalBest: false,
        caloriesEstimate: 0,
        completionPercentage: 100
      };
    }

    const { exercise, durationSeconds, notes } = sessionData;
    const previousBest = personalBests[exercise.id];
    const isPersonalBest = !previousBest || durationSeconds > previousBest;
    const caloriesEstimate = calculateCalories(durationSeconds, exercise.difficulty_level);

    try {
      // Save session with enhanced data
      const { error } = await supabase
        .from('user_sessions')
        .insert({
          user_id: user.id,
          exercise_id: exercise.id,
          duration_seconds: durationSeconds,
          notes: notes || null,
        });

      if (error) {
        console.error('Error saving session:', error);
        toast({
          title: "Error",
          description: "Failed to save your workout session.",
          variant: "destructive",
        });
        return {
          milestoneEvent: null,
          newAchievements: [],
          isPersonalBest: false,
          caloriesEstimate,
          completionPercentage: 100
        };
      }

      // Update personal best
      if (isPersonalBest) {
        setPersonalBests(prev => ({
          ...prev,
          [exercise.id]: durationSeconds
        }));
      }

      // Update streak and get milestone
      const milestoneEvent = await updateStreakWithEnhancement();

      // Check for new achievements
      const achievementService = new AchievementService(user.id);
      const newAchievements = await achievementService.checkAchievements();

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['session-history'] });
      queryClient.invalidateQueries({ queryKey: ['session-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-streak'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });

      // Show success toast
      toast({
        title: "Session Saved! 🎉",
        description: `${exercise.name} completed${isPersonalBest ? ' - New personal best!' : ''}`,
      });

      return {
        milestoneEvent,
        newAchievements,
        isPersonalBest,
        previousBest,
        caloriesEstimate,
        completionPercentage: 100
      };
    } catch (error) {
      console.error('Error saving enhanced session:', error);
      toast({
        title: "Error",
        description: "Failed to save your workout session.",
        variant: "destructive",
      });
      return {
        milestoneEvent: null,
        newAchievements: [],
        isPersonalBest: false,
        caloriesEstimate,
        completionPercentage: 100
      };
    }
  };

  const updateStreakWithEnhancement = async (): Promise<MilestoneEvent | null> => {
    if (!user) return null;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: streak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching streak:', fetchError);
        return null;
      }

      if (!streak) {
        // Create initial streak record
        const { error: insertError } = await supabase
          .from('user_streaks')
          .insert({
            user_id: user.id,
            current_streak: 1,
            longest_streak: 1,
            last_workout_date: today,
          });

        if (insertError) {
          console.error('Error creating streak:', insertError);
        }

        return {
          milestone: {
            days: 1,
            title: "First Step",
            description: "Your fitness journey begins! 🌱"
          },
          isNewMilestone: true
        };
      }

      const lastWorkoutDate = streak.last_workout_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = streak.current_streak || 0;
      const previousStreak = newCurrentStreak;

      if (lastWorkoutDate === today) {
        // Already worked out today, don't update streak
        return null;
      } else if (lastWorkoutDate === yesterdayStr) {
        // Consecutive day, increment streak
        newCurrentStreak += 1;
      } else {
        // Streak broken, reset to 1
        newCurrentStreak = 1;
      }

      const newLongestStreak = Math.max(streak.longest_streak || 0, newCurrentStreak);

      const { error: updateError } = await supabase
        .from('user_streaks')
        .update({
          current_streak: newCurrentStreak,
          longest_streak: newLongestStreak,
          last_workout_date: today,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error('Error updating streak:', updateError);
        return null;
      }

      // Enhanced milestone system
      const milestones = [
        { days: 1, title: "First Step", description: "Your fitness journey begins! 🌱" },
        { days: 3, title: "Building Momentum", description: "You're forming a habit! 💪" },
        { days: 7, title: "Week Warrior", description: "One full week of dedication! ⚔️" },
        { days: 14, title: "Two Week Champion", description: "Consistency is your superpower! 🏆" },
        { days: 21, title: "Habit Master", description: "21 days - it's becoming natural! 🎯" },
        { days: 30, title: "Monthly Legend", description: "One month of pure determination! 👑" },
        { days: 50, title: "Unstoppable Force", description: "You're absolutely unstoppable! 🚀" },
        { days: 75, title: "Elite Dedication", description: "Elite level commitment! 💎" },
        { days: 100, title: "Century Champion", description: "100 days - you're legendary! 🏅" },
        { days: 365, title: "Year-Long Hero", description: "A full year - incredible! 🌟" }
      ];

      const achievedMilestone = milestones.find(m => 
        m.days === newCurrentStreak && previousStreak < m.days
      );

      if (achievedMilestone) {
        return {
          milestone: achievedMilestone,
          isNewMilestone: true
        };
      }

      return null;
    } catch (error) {
      console.error('Error updating enhanced streak:', error);
      return null;
    }
  };

  return { 
    saveEnhancedSession, 
    personalBests,
    loadPersonalBests 
  };
};
