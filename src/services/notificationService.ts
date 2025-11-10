import { supabase } from '@/integrations/supabase/client';
import { messageTemplates, getRandomTemplate, personalizeMessage, getTimeOfDay } from '@/config/notificationMessages';

interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

interface NotificationResult {
  successCount: number;
  totalAttempts: number;
  sent?: number;
  total?: number;
  message?: string;
  results?: Array<{
    success: boolean;
    subscription_id?: string;
    user_id?: string;
    error?: string;
  }>;
  timestamp?: string;
}

export class NotificationService {
  /**
   * Fetch user's first name from the database
   */
  private static async getUserFirstName(userId: string): Promise<string> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('first_name, username')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return 'friend';
      }

      return data.first_name || data.username || 'friend';
    } catch (error) {
      console.error('Error fetching user first name:', error);
      return 'friend';
    }
  }

  static async sendToUser(userId: string, type: string, options: NotificationOptions): Promise<NotificationResult> {
    try {
      // Fetch user's first name
      const firstName = await this.getUserFirstName(userId);

      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          notification_type: type,
          user_first_name: firstName,
          ...options
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
        throw new Error(error.message || 'Failed to send notification');
      }

      console.log('Notification sent successfully:', data);
      return {
        successCount: data?.sent || data?.successCount || 0,
        totalAttempts: data?.total || data?.totalAttempts || 0,
        message: data?.message,
        results: data?.results || [],
        timestamp: new Date().toISOString(),
        ...data
      };
    } catch (error: any) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  static async sendToMultipleUsers(userIds: string[], type: string, options: NotificationOptions) {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_ids: userIds,
          notification_type: type,
          ...options
        }
      });

      if (error) {
        console.error('Error sending notifications:', error);
        return false;
      }

      console.log('Notifications sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Failed to send notifications:', error);
      return false;
    }
  }

  // Predefined notification templates with personalization
  static async sendWorkoutReminder(userId: string) {
    const firstName = await this.getUserFirstName(userId);
    const timeOfDay = getTimeOfDay();
    const template = getRandomTemplate(messageTemplates.workout_reminder[timeOfDay]);
    const personalizedTemplate = personalizeMessage(template, { firstName });

    return this.sendToUser(userId, 'reminders', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: { 
        url: '/?tab=workout',
        category: 'reminder',
        notification_type: 'reminders'
      },
      actions: [
        { action: 'start-workout', title: '🚀 Start Now' },
        { action: 'dismiss', title: '⏰ Remind Later' }
      ]
    });
  }

  static async sendAchievementUnlocked(userId: string, achievementName: string) {
    const firstName = await this.getUserFirstName(userId);
    const template = getRandomTemplate(messageTemplates.achievement);
    const personalizedTemplate = personalizeMessage(template, { firstName, achievementName });

    return this.sendToUser(userId, 'achievements', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: { 
        achievement: achievementName,
        url: '/?tab=achievements',
        category: 'achievement',
        notification_type: 'achievements'
      },
      actions: [
        { action: 'view-achievement', title: '👀 View Achievement' },
        { action: 'share', title: '📤 Share' }
      ]
    });
  }

  static async sendStreakAlert(userId: string, currentStreak: number) {
    const firstName = await this.getUserFirstName(userId);
    const template = getRandomTemplate(messageTemplates.streak_protection);
    const personalizedTemplate = personalizeMessage(template, { firstName, streakDays: currentStreak });

    return this.sendToUser(userId, 'streaks', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: { 
        streak: currentStreak,
        url: '/?tab=workout',
        category: 'streak',
        notification_type: 'streaks'
      },
      actions: [
        { action: 'quick-workout', title: '⚡ Quick Plank' },
        { action: 'full-workout', title: '💪 Full Workout' }
      ]
    });
  }

  static async sendWeeklyProgress(userId: string, sessionsThisWeek: number, totalDuration: number) {
    const firstName = await this.getUserFirstName(userId);
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    
    const milestoneName = `${sessionsThisWeek} workouts, ${timeStr}`;
    const template = getRandomTemplate(messageTemplates.milestone);
    const personalizedTemplate = personalizeMessage(template, { firstName, milestoneName });

    return this.sendToUser(userId, 'milestones', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: { 
        sessions: sessionsThisWeek,
        duration: totalDuration,
        url: '/?tab=stats',
        category: 'progress',
        notification_type: 'milestones'
      },
      actions: [
        { action: 'view-stats', title: '📈 View Stats' },
        { action: 'plan-week', title: '📅 Plan This Week' }
      ]
    });
  }

  static async sendMilestoneReached(userId: string, milestone: string, value: number) {
    const firstName = await this.getUserFirstName(userId);
    const milestoneName = `${value} ${milestone}`;
    const template = getRandomTemplate(messageTemplates.milestone);
    const personalizedTemplate = personalizeMessage(template, { firstName, milestoneName });

    return this.sendToUser(userId, 'milestones', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: { 
        milestone,
        value,
        url: '/?tab=stats',
        category: 'milestone',
        notification_type: 'milestones'
      },
      actions: [
        { action: 'view-progress', title: '🎯 View Progress' },
        { action: 'next-goal', title: '🚀 Set Next Goal' }
      ]
    });
  }

  static async sendSocialNotification(userId: string, friendName: string, activityType: string) {
    const firstName = await this.getUserFirstName(userId);
    const template = getRandomTemplate(messageTemplates.social);
    const personalizedTemplate = personalizeMessage(template, { firstName, friendName });

    return this.sendToUser(userId, 'social', {
      title: personalizedTemplate.title,
      body: personalizedTemplate.body,
      data: { 
        friendName,
        activityType,
        url: '/?tab=social',
        category: 'social',
        notification_type: 'social'
      },
      actions: [
        { action: 'view-activity', title: '👀 View Activity' },
        { action: 'cheer', title: '👏 Cheer' }
      ]
    });
  }
}
