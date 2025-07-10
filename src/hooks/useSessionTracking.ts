
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

export const useSessionTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const saveSession = async (exercise: Exercise, durationSeconds: number, notes?: string) => {
    if (!user) {
      console.log('No user found, skipping session save');
      return;
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
        return;
      }

      // Update streak
      await updateStreak();

      toast({
        title: "Session Saved!",
        description: `Your ${exercise.name} session has been recorded.`,
      });

    } catch (error) {
      console.error('Error saving session:', error);
      toast({
        title: "Error",
        description: "Failed to save your workout session.",
        variant: "destructive",
      });
    }
  };

  const updateStreak = async () => {
    if (!user) return;

    try {
      const today = new Date().toISOString().split('T')[0];
      
      const { data: streak, error: fetchError } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Error fetching streak:', fetchError);
        return;
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
        return;
      }

      const lastWorkoutDate = streak.last_workout_date;
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      let newCurrentStreak = streak.current_streak || 0;

      if (lastWorkoutDate === today) {
        // Already worked out today, don't update streak
        return;
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
      }

    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  return { saveSession };
};
