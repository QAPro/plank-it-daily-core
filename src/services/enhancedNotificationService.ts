import { NotificationService } from './notificationService';
import { messageTemplates, getRandomTemplate, personalizeMessage, getTimeOfDay } from '@/config/notificationMessages';
import { supabase } from '@/integrations/supabase/client';

interface ContextualNotificationOptions {
  timeOfDay?: 'morning' | 'afternoon' | 'evening';
  currentStreak?: number;
  lastWorkoutDays?: number;
  preferredExercise?: string;
  preferredDuration?: number;
}

export class EnhancedNotificationService extends NotificationService {
  /**
   * Send context-aware workout reminder with personalization
   */
  static async sendContextualWorkoutReminder(
    userId: string,
    options: ContextualNotificationOptions
  ) {
    const firstName = await NotificationService['getUserFirstName'](userId);
    const timeOfDay = options.timeOfDay || getTimeOfDay();
    
    // Get random template based on time of day
    const template = getRandomTemplate(messageTemplates.workout_reminder[timeOfDay]);
    const personalizedTemplate = personalizeMessage(template, { firstName });
    
    const duration = this.getRecommendedDuration(timeOfDay);
    
    return this.sendToUser(userId, 'reminders', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: {
        url: '/?tab=workout',
        category: 'contextual_reminder',
        notification_type: 'reminders',
        timeOfDay,
        streak: options.currentStreak,
        lastWorkout: options.lastWorkoutDays,
      },
      actions: [
        { action: 'start-workout', title: '🚀 Start Now' },
        { action: 'quick-workout', title: `⚡ Quick ${duration}s` }
      ]
    });
  }

  /**
   * Send performance-based progression notification
   */
  static async sendProgressionSuggestion(
    userId: string,
    currentDuration: number,
    suggestedDuration: number,
    exerciseId: string
  ) {
    const firstName = await NotificationService['getUserFirstName'](userId);
    const milestoneName = `${suggestedDuration}s workout`;
    const template = getRandomTemplate(messageTemplates.milestone);
    const personalizedTemplate = personalizeMessage(template, { firstName, milestoneName });

    return this.sendToUser(userId, 'milestones', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: {
        url: '/?tab=workout',
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
   * Send streak maintenance notification
   */
  static async sendStreakRecovery(
    userId: string,
    currentStreak: number,
    daysSinceLastWorkout: number
  ) {
    const firstName = await NotificationService['getUserFirstName'](userId);
    
    // Get random streak protection template
    const template = getRandomTemplate(messageTemplates.streak_protection);
    const personalizedTemplate = personalizeMessage(template, { 
      firstName, 
      streakDays: currentStreak 
    });
    
    return this.sendToUser(userId, 'streaks', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: {
        url: '/?tab=workout',
        category: 'streak_recovery',
        notification_type: 'streaks',
        currentStreak,
        daysSinceLastWorkout,
      },
      actions: [
        { action: 'quick-workout', title: '⚡ 30s Plank' },
        { action: 'full-workout', title: '💪 Full Session' }
      ]
    });
  }

  /**
   * Send achievement celebration with personalization
   */
  static async sendAchievementCelebration(
    userId: string,
    achievementName: string,
    achievementTier: string = 'gold'
  ) {
    const firstName = await NotificationService['getUserFirstName'](userId);
    
    // Get random achievement template
    const template = getRandomTemplate(messageTemplates.achievement);
    const personalizedTemplate = personalizeMessage(template, { 
      firstName, 
      achievementName 
    });
    
    return this.sendToUser(userId, 'achievements', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: {
        url: '/?tab=achievements',
        category: 'achievement',
        notification_type: 'achievements',
        achievementName,
        achievementTier
      },
      actions: [
        { action: 'view-achievement', title: '👀 View' },
        { action: 'share', title: '📤 Share' }
      ]
    });
  }

  /**
   * Get recommended duration based on time of day
   */
  private static getRecommendedDuration(timeOfDay?: string): number {
    switch (timeOfDay) {
      case 'morning':
        return 45;
      case 'afternoon':
        return 60;
      case 'evening':
        return 30;
      default:
        return 60;
    }
  }

  /**
   * Send surprise reward notification
   */
  static async sendSurpriseRewardNotification(userId: string, xpAmount: number) {
    const firstName = await NotificationService['getUserFirstName'](userId);
    const milestoneName = `${xpAmount} bonus XP`;
    const template = getRandomTemplate(messageTemplates.milestone);
    const personalizedTemplate = personalizeMessage(template, { firstName, milestoneName });

    return this.sendToUser(userId, 'milestones', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: {
        url: '/?tab=stats',
        xpAmount,
        rewardType: 'surprise_xp',
        category: 'reward',
        notification_type: 'milestones'
      },
      actions: [
        { action: 'claim-reward', title: '🎁 Claim Reward' },
        { action: 'share-luck', title: '✨ Share' }
      ]
    });
  }

  /**
   * Send milestone approach notification
   */
  static async sendMilestoneApproachNotification(
    userId: string,
    milestone: string,
    progress: number
  ) {
    const firstName = await NotificationService['getUserFirstName'](userId);
    const template = getRandomTemplate(messageTemplates.milestone);
    const personalizedTemplate = personalizeMessage(template, { firstName, milestoneName: milestone });

    return this.sendToUser(userId, 'milestones', {
      title: personalizedTemplate.title,
      body: `You're ${progress}% of the way there!`,
      data: {
        url: '/?tab=achievements',
        milestone,
        progress,
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
    const firstName = await NotificationService['getUserFirstName'](userId);
    let template;

    if (daysSinceLastWorkout >= 14) {
      template = getRandomTemplate(messageTemplates.re_engagement.days_14);
    } else if (daysSinceLastWorkout >= 7) {
      template = getRandomTemplate(messageTemplates.re_engagement.days_7);
    } else {
      template = getRandomTemplate(messageTemplates.re_engagement.days_3);
    }

    const personalizedTemplate = personalizeMessage(template, { firstName });

    return this.sendToUser(userId, 're_engagement', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: {
        url: '/?tab=workout',
        daysSinceLastWorkout,
        category: 'comeback',
        notification_type: 're_engagement'
      },
      actions: [
        { action: 'start-comeback', title: '🚀 Start Now' },
        { action: 'gentle-return', title: '🌱 Gentle Start' }
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
          await this.sendContextualWorkoutReminder(userId, {
            lastWorkoutDays: daysSinceLastWorkout,
            preferredExercise: userData.last_exercise_id,
            preferredDuration: userData.last_duration || userData.preferred_workout_duration,
            timeOfDay: getTimeOfDay()
          });
        }
      }
    } catch (error) {
      console.error('Error scheduling contextual reminders:', error);
    }
  }
}
