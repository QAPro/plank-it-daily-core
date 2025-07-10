
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';

type UserStreak = Tables<'user_streaks'>;

export const useStreakTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: streak, isLoading, error } = useQuery({
    queryKey: ['user-streak', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching streak:', error);
        throw error;
      }

      return data;
    },
    enabled: !!user,
  });

  const checkStreakMaintenance = async () => {
    if (!user || !streak) return;

    const today = new Date().toISOString().split('T')[0];
    const lastWorkoutDate = streak.last_workout_date;
    
    if (!lastWorkoutDate) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if streak should be broken
    if (lastWorkoutDate < yesterdayStr && lastWorkoutDate !== today) {
      // Streak is broken, reset to 0
      await supabase
        .from('user_streaks')
        .update({
          current_streak: 0,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      queryClient.invalidateQueries({ queryKey: ['user-streak', user.id] });
      
      toast({
        title: "Streak Reset",
        description: "Don't worry! Start fresh today and build your streak back up.",
        variant: "destructive",
      });
    }
  };

  const getStreakStatus = () => {
    if (!streak) return { status: 'new', message: 'Start your first streak!' };

    const currentStreak = streak.current_streak || 0;
    const longestStreak = streak.longest_streak || 0;
    const today = new Date().toISOString().split('T')[0];
    const lastWorkoutDate = streak.last_workout_date;

    if (lastWorkoutDate === today) {
      return {
        status: 'completed',
        message: "Great job! You've completed today's workout!",
      };
    }

    if (currentStreak === 0) {
      return {
        status: 'broken',
        message: 'Ready to start a new streak? You can do this!',
      };
    }

    return {
      status: 'active',
      message: `Keep it up! You're on a ${currentStreak}-day streak!`,
    };
  };

  const getStreakMilestone = () => {
    const currentStreak = streak?.current_streak || 0;
    const milestones = [
      { days: 3, title: "First Steps", description: "You're building the habit!" },
      { days: 7, title: "Week Warrior", description: "One week strong!" },
      { days: 14, title: "Two Week Champion", description: "You're on fire!" },
      { days: 30, title: "Monthly Master", description: "Incredible dedication!" },
      { days: 60, title: "Unstoppable", description: "You're a plank legend!" },
      { days: 100, title: "Century Club", description: "Welcome to elite status!" },
    ];

    const currentMilestone = milestones
      .reverse()
      .find(m => currentStreak >= m.days);

    const nextMilestone = milestones
      .reverse()
      .find(m => currentStreak < m.days);

    return { currentMilestone, nextMilestone };
  };

  const getMotivationalMessage = () => {
    const currentStreak = streak?.current_streak || 0;
    const { status } = getStreakStatus();

    if (status === 'completed') {
      const messages = [
        "Amazing work today! 🔥",
        "You're crushing it! 💪",
        "Consistency is key - well done! ⭐",
        "Another day, another victory! 🏆",
      ];
      return messages[Math.floor(Math.random() * messages.length)];
    }

    if (currentStreak === 0) {
      return "Every expert was once a beginner. Start today! 🌟";
    }

    if (currentStreak < 7) {
      return `${currentStreak} days down! Keep building that habit! 🚀`;
    }

    return `${currentStreak} days strong! You're unstoppable! 🔥`;
  };

  return {
    streak,
    isLoading,
    error,
    checkStreakMaintenance,
    getStreakStatus,
    getStreakMilestone,
    getMotivationalMessage,
  };
};
