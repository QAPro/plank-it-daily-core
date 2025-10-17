import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { EnhancedAchievementService } from '@/services/enhancedAchievementService';
import { useChallengeTracking } from '@/hooks/useChallengeTracking';
import type { Tables } from '@/integrations/supabase/types';
import type { UserAchievement } from '@/hooks/useUserAchievements';

type Exercise = Tables<'exercises'>;

interface SessionResult {
  milestoneEvent: MilestoneEvent | null;
  newAchievements: UserAchievement[];
}

interface MilestoneEvent {
  milestone: {
    days: number;
    title: string;
    description: string;
  };
  isNewMilestone: boolean;
}

export const useSessionTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { updateChallengeProgress } = useChallengeTracking();

  const saveSession = async (
    exercise: Exercise,
    durationSeconds: number,
    notes?: string
  ): Promise<SessionResult> => {
    if (!user) {
      console.log('No user found, skipping session save');
      return { milestoneEvent: null, newAchievements: [] };
    }

    try {
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
        return { milestoneEvent: null, newAchievements: [] };
      }

      // Prepare session data for challenge tracking
      const sessionData = {
        exercise_name: exercise.name,
        duration_seconds: durationSeconds,
        difficulty_level: exercise.difficulty_level,
        exercise_id: exercise.id
      };

      // Update challenge progress
      await updateChallengeProgress(sessionData);

      // Update streak and check for milestones
      const milestoneEvent = await updateStreak();

      // Check for new achievements using enhanced service
      const achievementService = new EnhancedAchievementService(user.id);
      const regularAchievements = await achievementService.checkAchievements();
      const specialAchievements = await achievementService.checkSpecialAchievements();
      const newAchievements = [...regularAchievements, ...specialAchievements];

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['session-history'] });
      queryClient.invalidateQueries({ queryKey: ['session-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-streak'] });
      queryClient.invalidateQueries({ queryKey: ['user-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['achievement-progress'] });

      toast({
        title: "Session Saved!",
        description: `Your ${exercise.name} session has been recorded.`,
      });

      return { milestoneEvent, newAchievements };
    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Error",
        description: "Failed to save your workout session.",
        variant: "destructive",
      });
      return { milestoneEvent: null, newAchievements: [] };
    }
  };

  const updateStreak = async (): Promise<MilestoneEvent | null> => {
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

        // Return first milestone event
        return {
          milestone: {
            days: 1,
            title: "First Step",
            description: "Your journey begins!"
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

      // Check for milestone achievement
      const milestones = [
        { days: 1, title: "First Step", description: "Your journey begins!" },
        { days: 3, title: "First Steps", description: "You're building the habit!" },
        { days: 7, title: "Week Warrior", description: "One week strong!" },
        { days: 14, title: "Two Week Champion", description: "You're on fire!" },
        { days: 30, title: "Monthly Master", description: "Incredible dedication!" },
        { days: 60, title: "Unstoppable", description: "You're a plank legend!" },
        { days: 100, title: "Century Club", description: "Welcome to elite status!" },
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
      console.error('Error updating streak:', error);
      return null;
    }
  };

  return { saveSession };
};
