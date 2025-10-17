import { supabase } from '@/integrations/supabase/client';
import { SocialSharingService, type ShareData } from './socialSharingService';

export interface CommunityStats {
  activeUsersToday: number;
  currentPlankers: number;
  totalWorkoutsToday: number;
  topPerformer: {
    username: string;
    achievement: string;
  } | null;
}

export interface UserRanking {
  percentile: number;
  category: 'streak' | 'consistency' | 'improvement' | 'total_time';
  message: string;
  badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface WorkoutOfTheDay {
  userId: string;
  username: string;
  exerciseName: string;
  duration: number;
  achievement: string;
  stats: {
    improvementPercent?: number;
    streakDays?: number;
    personalBest?: boolean;
  };
}

export class SocialRewardsService {
  // Enhanced Social Sharing with auto-generated content
  static generateEnhancedShareContent(data: ShareData & { 
    xpGained?: number;
    levelUp?: boolean;
    newLevel?: number;
    percentileRank?: number;
  }): {
    text: string;
    hashtags: string[];
    visualData: any;
  } {
    const { exercise, duration, achievement, personalBest, streakDays, xpGained, levelUp, newLevel, percentileRank } = data;
    
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    let text = `💪 Crushed a ${timeStr} ${exercise}!`;
    const hashtags = ['PlankCoach', 'FitnessJourney', 'CoreStrength'];

    if (personalBest) {
      text += " 🏆 NEW PERSONAL RECORD!";
      hashtags.push('PersonalBest', 'Progress');
    }

    if (xpGained) {
      text += ` ⚡ +${xpGained} XP earned!`;
    }

    if (levelUp && newLevel) {
      text += ` 🎯 LEVEL UP to ${newLevel}!`;
      hashtags.push('LevelUp', 'Achievement');
    }

    if (streakDays && streakDays > 1) {
      text += ` 🔥 ${streakDays}-day streak!`;
      if (streakDays >= 7) hashtags.push('StreakWarrior');
      if (streakDays >= 30) hashtags.push('DedicatedAthlete');
    }

    if (percentileRank && percentileRank >= 90) {
      text += ` 📊 Top ${100 - percentileRank}% performer!`;
      hashtags.push('TopPerformer');
    }

    if (achievement) {
      text += ` 🎖️ "${achievement}"`;
    }

    return {
      text,
      hashtags,
      visualData: {
        exercise,
        duration,
        personalBest,
        streakDays,
        xpGained,
        levelUp,
        newLevel,
        achievement
      }
    };
  }

  // Community Recognition Features
  static async getCommunityStats(): Promise<CommunityStats> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date();
      const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

      // Get active users today
      const { data: activeUsers } = await supabase
        .from('user_sessions')
        .select('user_id')
        .gte('completed_at', today)
        .neq('completed_at', null);

      // Estimate current plankers (users active in last 10 minutes)
      const { data: recentSessions } = await supabase
        .from('user_sessions')
        .select('user_id')
        .gte('completed_at', tenMinutesAgo.toISOString())
        .neq('completed_at', null);

      // Total workouts today
      const { data: workoutsToday } = await supabase
        .from('user_sessions')
        .select('id')
        .gte('completed_at', today)
        .neq('completed_at', null);

      // Get top performer (most recent achievement)
      const { data: topAchievement } = await supabase
        .from('user_achievements')
        .select(`
          user_id,
          achievement_name,
          users!inner(username)
        `)
        .gte('earned_at', today)
        .order('earned_at', { ascending: false })
        .limit(1);

      return {
        activeUsersToday: activeUsers?.length || 0,
        currentPlankers: recentSessions?.length || 0,
        totalWorkoutsToday: workoutsToday?.length || 0,
        topPerformer: topAchievement?.[0] ? {
          username: (topAchievement[0].users as any)?.username || 'Anonymous',
          achievement: topAchievement[0].achievement_name
        } : null
      };
    } catch (error) {
      console.error('Error getting community stats:', error);
      return {
        activeUsersToday: 0,
        currentPlankers: 0,
        totalWorkoutsToday: 0,
        topPerformer: null
      };
    }
  }

  // User Percentile Rankings
  static async getUserPercentileRank(userId: string, category: 'streak' | 'consistency' | 'improvement' | 'total_time'): Promise<UserRanking | null> {
    try {
      let percentile = 0;
      let badgeLevel: 'bronze' | 'silver' | 'gold' | 'platinum' = 'bronze';

      switch (category) {
        case 'streak':
          const { data: userStreak } = await supabase
            .from('user_streaks')
            .select('current_streak')
            .eq('user_id', userId)
            .single();

          if (userStreak) {
            const { data: allStreaks } = await supabase
              .from('user_streaks')
              .select('current_streak')
              .gt('current_streak', 0);

            if (allStreaks && allStreaks.length > 0) {
              const userStreakValue = userStreak.current_streak;
              const betterStreaks = allStreaks.filter(s => s.current_streak < userStreakValue).length;
              percentile = Math.round((betterStreaks / allStreaks.length) * 100);
            }
          }
          break;

        case 'consistency':
          // Calculate based on sessions in last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

          const { data: userSessions } = await supabase
            .from('user_sessions')
            .select('id')
            .eq('user_id', userId)
            .gte('completed_at', thirtyDaysAgo.toISOString())
            .neq('completed_at', null);

          if (userSessions) {
            // Simplified percentile calculation
            const sessionCount = userSessions.length;
            if (sessionCount >= 25) percentile = 95;
            else if (sessionCount >= 20) percentile = 85;
            else if (sessionCount >= 15) percentile = 70;
            else if (sessionCount >= 10) percentile = 50;
            else if (sessionCount >= 5) percentile = 30;
            else percentile = 15;
          }
          break;

        case 'total_time':
          const { data: userData } = await supabase
            .from('users')
            .select('total_xp')
            .eq('id', userId)
            .single();

          if (userData) {
            // Estimate percentile based on total XP as proxy for total time
            const totalXP = userData.total_xp || 0;
            if (totalXP >= 5000) percentile = 95;
            else if (totalXP >= 2000) percentile = 85;
            else if (totalXP >= 1000) percentile = 70;
            else if (totalXP >= 500) percentile = 50;
            else if (totalXP >= 200) percentile = 30;
            else percentile = 15;
          }
          break;
      }

      // Determine badge level
      if (percentile >= 95) badgeLevel = 'platinum';
      else if (percentile >= 85) badgeLevel = 'gold';
      else if (percentile >= 70) badgeLevel = 'silver';
      else badgeLevel = 'bronze';

      const message = this.generatePercentileMessage(category, percentile);

      return {
        percentile,
        category,
        message,
        badgeLevel
      };
    } catch (error) {
      console.error('Error calculating percentile rank:', error);
      return null;
    }
  }

  private static generatePercentileMessage(category: string, percentile: number): string {
    const categoryNames = {
      streak: 'streak consistency',
      consistency: 'workout frequency',
      improvement: 'progress rate',
      total_time: 'total dedication'
    };

    const categoryName = categoryNames[category as keyof typeof categoryNames];

    if (percentile >= 95) {
      return `🏆 You're in the TOP 5% for ${categoryName}! Elite level!`;
    } else if (percentile >= 85) {
      return `🥇 Top 15% for ${categoryName}! Outstanding work!`;
    } else if (percentile >= 70) {
      return `🥈 Top 30% for ${categoryName}! Keep pushing!`;
    } else if (percentile >= 50) {
      return `📈 You're above average for ${categoryName}!`;
    } else {
      return `💪 Room to grow in ${categoryName} - you've got this!`;
    }
  }

  // Workout of the Day selection
  static async selectWorkoutOfTheDay(): Promise<WorkoutOfTheDay | null> {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      // Find standout performances from yesterday
      const { data: standoutWorkouts } = await supabase
        .from('user_sessions')
        .select(`
          user_id,
          duration_seconds,
          exercise_id,
          users!inner(username),
          exercises!inner(name)
        `)
        .gte('completed_at', yesterdayStr)
        .lt('completed_at', new Date().toISOString().split('T')[0])
        .neq('completed_at', null)
        .order('duration_seconds', { ascending: false })
        .limit(10);

      if (!standoutWorkouts || standoutWorkouts.length === 0) {
        return null;
      }

      // Select a random top performer
      const selectedWorkout = standoutWorkouts[Math.floor(Math.random() * Math.min(3, standoutWorkouts.length))];

      return {
        userId: selectedWorkout.user_id,
        username: (selectedWorkout.users as any)?.username || 'Anonymous Athlete',
        exerciseName: (selectedWorkout.exercises as any)?.name || 'Workout',
        duration: selectedWorkout.duration_seconds,
        achievement: 'Outstanding Performance',
        stats: {
          // Could add more detailed stats here
        }
      };
    } catch (error) {
      console.error('Error selecting workout of the day:', error);
      return null;
    }
  }

  // Rising Star Recognition (users showing improvement)
  static async findRisingStars(): Promise<Array<{
    userId: string;
    username: string;
    improvementPercent: number;
    category: string;
  }>> {
    try {
      // This is a simplified version - in a real implementation,
      // we'd calculate actual improvement rates over time
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const { data: recentAchievements } = await supabase
        .from('user_achievements')
        .select(`
          user_id,
          achievement_name,
          users!inner(username)
        `)
        .gte('earned_at', lastWeek.toISOString())
        .eq('achievement_type', 'personal_best')
        .limit(5);

      if (!recentAchievements) return [];

      return recentAchievements.map(achievement => ({
        userId: achievement.user_id,
        username: (achievement.users as any)?.username || 'Rising Star',
        improvementPercent: 25, // Placeholder - would calculate actual improvement
        category: 'Personal Best'
      }));
    } catch (error) {
      console.error('Error finding rising stars:', error);
      return [];
    }
  }
}