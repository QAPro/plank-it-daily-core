import { supabase } from '@/integrations/supabase/client';
import { NotificationService } from './notificationService';

interface ContextualNotificationOptions {
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  userStreak?: number;
  lastWorkoutDays?: number;
  preferredExercise?: string;
  preferredDuration?: number;
  userId: string;
}

export class EnhancedNotificationService extends NotificationService {
  
  /**
   * Send context-aware workout reminder with direct deep linking
   */
  static async sendContextualWorkoutReminder(options: ContextualNotificationOptions) {
    const { userId, timeOfDay, userStreak, lastWorkoutDays, preferredExercise, preferredDuration } = options;

    // Choose exercise based on context
    const exerciseId = preferredExercise || 'plank-basic';
    const duration = preferredDuration || this.getRecommendedDuration(timeOfDay);
    
    // Create deep link for instant workout start
    const workoutUrl = `/?exercise-id=${exerciseId}&duration=${duration}&auto-start=true&source=notification`;
    const quickStartUrl = `/?quick-start=true&source=notification`;

    // Context-aware messaging
    const { title, body } = this.getContextualMessage(timeOfDay, userStreak, lastWorkoutDays);

    return this.sendToUser(userId, 'reminders', {
      title,
      body,
      data: { 
        url: workoutUrl,
        quickStartUrl,
        exerciseId,
        duration,
        category: 'contextual-reminder',
        notification_type: 'reminders',
        timeOfDay,
        userStreak
      },
      actions: [
        { action: 'start-workout', title: '🚀 Start Now' },
        { action: 'quick-start', title: '⚡ Quick Start' },
        { action: 'remind-later', title: '⏰ Later' }
      ]
    });
  }

  /**
   * Send performance-based progression notification
   */
  static async sendProgressionSuggestion(userId: string, currentDuration: number, suggestedDuration: number, exerciseId: string) {
    const workoutUrl = `/?exercise-id=${exerciseId}&duration=${suggestedDuration}&auto-start=false&source=progression`;

    return this.sendToUser(userId, 'milestones', {
      title: '📈 Ready for the next challenge?',
      body: `You've mastered ${currentDuration}s! Try ${suggestedDuration}s and push your limits.`,
      data: { 
        url: workoutUrl,
        exerciseId,
        currentDuration,
        suggestedDuration,
        category: 'progression',
        notification_type: 'milestones'
      },
      actions: [
        { action: 'accept-challenge', title: '💪 Accept Challenge' },
        { action: 'current-level', title: '🔄 Keep Current' }
      ]
    });
  }

  /**
   * Send streak maintenance notification with quick recovery options
   */
  static async sendStreakRecovery(userId: string, streak: number, lastWorkoutHours: number) {
    const quickStartUrl = `/?quick-start=true&source=streak-recovery`;
    const urgency = lastWorkoutHours > 48 ? 'high' : 'medium';

    const title = urgency === 'high' 
      ? '🔥 Your streak is at risk!'
      : '⏰ Keep your momentum going!';

    const body = urgency === 'high'
      ? `Your ${streak}-day streak could end today. A 30-second plank will keep it alive!`
      : `${lastWorkoutHours}h since your last workout. A quick session will maintain your ${streak}-day streak.`;

    return this.sendToUser(userId, 'streaks', {
      title,
      body,
      data: { 
        url: quickStartUrl,
        streak,
        lastWorkoutHours,
        urgency,
        category: 'streak-recovery',
        notification_type: 'streaks'
      },
      actions: [
        { action: 'quick-plank', title: '⚡ 30s Quick Plank' },
        { action: 'full-workout', title: '💪 Full Workout' }
      ]
    });
  }

  /**
   * Send celebration notification with sharing options
   */
  static async sendAchievementCelebration(userId: string, achievement: string, shareData?: any) {
    const achievementUrl = `/?tab=achievements&highlight=${encodeURIComponent(achievement)}`;

    return this.sendToUser(userId, 'achievements', {
      title: '🎉 Outstanding Achievement!',
      body: `You've unlocked "${achievement}"! Share your success with friends.`,
      data: { 
        url: achievementUrl,
        achievement,
        shareData,
        category: 'celebration',
        notification_type: 'achievements'
      },
      actions: [
        { action: 'view-achievement', title: '🏆 View Achievement' },
        { action: 'share-success', title: '📤 Share Success' },
        { action: 'next-challenge', title: '🎯 Next Challenge' }
      ]
    });
  }

  /**
   * Get recommended duration based on time of day
   */
  private static getRecommendedDuration(timeOfDay?: string): number {
    switch (timeOfDay) {
      case 'morning':
        return 45; // Energizing morning workout
      case 'afternoon':
        return 60; // Standard midday workout
      case 'evening':
        return 30; // Relaxing evening workout
      default:
        return 60;
    }
  }

  /**
   * Generate context-aware notification messages
   */
  private static getContextualMessage(timeOfDay?: string, streak?: number, lastWorkoutDays?: number) {
    const streakMotivation = streak ? (streak >= 7 ? '🔥 Streak Champion!' : '💪 Building momentum!') : '🌟 Start strong!';
    
    if (lastWorkoutDays && lastWorkoutDays >= 3) {
      return {
        title: '👋 We miss you!',
        body: `It's been ${lastWorkoutDays} days. Let's get back to building your core strength!`
      };
    }

    switch (timeOfDay) {
      case 'morning':
        return {
          title: '🌅 Morning Power-Up!',
          body: `${streakMotivation} Start your day with a core-strengthening plank session.`
        };
      case 'afternoon':
        return {
          title: '⚡ Midday Energy Boost!',
          body: `${streakMotivation} Take a productive break with a quick plank workout.`
        };
      case 'evening':
        return {
          title: '🌙 Evening Wind-Down',
          body: `${streakMotivation} End your day strong with a relaxing plank session.`
        };
      default:
        return {
          title: '💪 Time for your plank workout!',
          body: `${streakMotivation} Keep your core strong and your progress steady.`
        };
    }
  }

  /**
   * Send surprise reward notification with XP bonus
   */
  static async sendSurpriseRewardNotification(userId: string, xpAmount: number) {
    const rewardUrl = `/?tab=stats&highlight=xp-boost&source=surprise-reward`;

    return this.sendToUser(userId, 'rewards', {
      title: '🎉 Surprise XP Bonus!',
      body: `Lucky you! You've earned ${xpAmount} bonus XP just for being awesome!`,
      data: { 
        url: rewardUrl,
        xpAmount,
        rewardType: 'surprise_xp',
        category: 'reward',
        notification_type: 'rewards'
      },
      actions: [
        { action: 'claim-reward', title: '🎁 Claim Reward' },
        { action: 'share-luck', title: '✨ Share Luck' }
      ]
    });
  }

  /**
   * Send milestone approach notification
   */
  static async sendMilestoneApproachNotification(userId: string, milestone: string, progress: number) {
    const milestoneUrl = `/?tab=achievements&highlight=${encodeURIComponent(milestone)}`;

    return this.sendToUser(userId, 'milestones', {
      title: '🎯 Milestone in Sight!',
      body: `You're ${progress}% of the way to "${milestone}". Don't stop now!`,
      data: { 
        url: milestoneUrl,
        milestone,
        progress,
        rewardType: 'milestone_nudge',
        category: 'motivation',
        notification_type: 'milestones'
      },
      actions: [
        { action: 'push-milestone', title: '💪 Push Forward' },
        { action: 'view-progress', title: '📊 View Progress' }
      ]
    });
  }

  /**
   * Send comeback encouragement notification
   */
  static async sendComebackEncouragement(userId: string, daysSinceLastWorkout: number) {
    const workoutUrl = `/?quick-start=true&source=comeback-encourage`;

    const message = daysSinceLastWorkout >= 5 
      ? `It's been ${daysSinceLastWorkout} days - but every champion has comeback stories! Ready to write yours?`
      : `${daysSinceLastWorkout} days away is nothing! Jump back in and reclaim your momentum.`;

    return this.sendToUser(userId, 'reminders', {
      title: '👋 Your Comeback Awaits!',
      body: message,
      data: { 
        url: workoutUrl,
        daysSinceLastWorkout,
        rewardType: 'comeback_encourage',
        category: 'comeback',
        notification_type: 'reminders'
      },
      actions: [
        { action: 'start-comeback', title: '🚀 Start Comeback' },
        { action: 'gentle-return', title: '🌱 Gentle Return' }
      ]
    });
  }

  /**
   * Schedule context-aware notifications based on user patterns
   */
  static async scheduleContextualReminders(userId: string) {
    try {
      // Get user's workout patterns and preferences
      const { data: userData } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      const { data: recentSessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (userData && recentSessions) {
        // Analyze patterns and schedule appropriate notifications
        const lastWorkout = recentSessions[0];
        const daysSinceLastWorkout = lastWorkout 
          ? Math.floor((Date.now() - new Date(lastWorkout.completed_at).getTime()) / (1000 * 60 * 60 * 24))
          : 7;

        // Schedule based on user patterns
        if (daysSinceLastWorkout >= 2) {
          await this.sendContextualWorkoutReminder({
            userId,
            lastWorkoutDays: daysSinceLastWorkout,
            preferredExercise: userData.last_exercise_id,
            preferredDuration: userData.last_duration || userData.preferred_workout_duration,
            timeOfDay: this.getCurrentTimeOfDay()
          });
        }
      }
    } catch (error) {
      console.error('Error scheduling contextual reminders:', error);
    }
  }

  private static getCurrentTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  }
}