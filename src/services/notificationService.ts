import { supabase } from '@/integrations/supabase/client';

interface NotificationOptions {
  title: string;
  body: string;
  data?: Record<string, any>;
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

export class NotificationService {
  static async sendToUser(userId: string, type: string, options: NotificationOptions) {
    try {
      const { data, error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          notification_type: type,
          ...options
        }
      });

      if (error) {
        console.error('Error sending notification:', error);
        return false;
      }

      console.log('Notification sent successfully:', data);
      return true;
    } catch (error) {
      console.error('Failed to send notification:', error);
      return false;
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

  // Predefined notification templates
  static async sendWorkoutReminder(userId: string) {
    return this.sendToUser(userId, 'reminders', {
      title: '💪 Time for your plank workout!',
      body: 'Keep your streak alive and strengthen your core today.',
      data: { 
        url: '/?tab=workout',
        category: 'reminder'
      },
      actions: [
        { action: 'start-workout', title: '🚀 Start Now' },
        { action: 'dismiss', title: '⏰ Remind Later' }
      ]
    });
  }

  static async sendAchievementUnlocked(userId: string, achievementName: string) {
    return this.sendToUser(userId, 'achievements', {
      title: '🏆 Achievement Unlocked!',
      body: `Congratulations! You've earned the "${achievementName}" achievement.`,
      data: { 
        achievement: achievementName,
        url: '/?tab=achievements',
        category: 'achievement'
      },
      actions: [
        { action: 'view-achievement', title: '👀 View Achievement' },
        { action: 'share', title: '📤 Share' }
      ]
    });
  }

  static async sendStreakAlert(userId: string, currentStreak: number) {
    return this.sendToUser(userId, 'streaks', {
      title: '🔥 Don\'t break your streak!',
      body: `You're on a ${currentStreak}-day streak. A quick workout will keep it going!`,
      data: { 
        streak: currentStreak,
        url: '/?tab=workout',
        category: 'streak'
      },
      actions: [
        { action: 'quick-workout', title: '⚡ Quick Plank' },
        { action: 'full-workout', title: '💪 Full Workout' }
      ]
    });
  }

  static async sendWeeklyProgress(userId: string, sessionsThisWeek: number, totalDuration: number) {
    const hours = Math.floor(totalDuration / 3600);
    const minutes = Math.floor((totalDuration % 3600) / 60);
    const timeStr = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;

    return this.sendToUser(userId, 'milestones', {
      title: '📊 Your weekly progress is in!',
      body: `${sessionsThisWeek} workouts completed, ${timeStr} of core strength training.`,
      data: { 
        sessions: sessionsThisWeek,
        duration: totalDuration,
        url: '/?tab=stats',
        category: 'progress'
      },
      actions: [
        { action: 'view-stats', title: '📈 View Stats' },
        { action: 'plan-week', title: '📅 Plan This Week' }
      ]
    });
  }

  static async sendMilestoneReached(userId: string, milestone: string, value: number) {
    return this.sendToUser(userId, 'milestones', {
      title: '🎉 Milestone Reached!',
      body: `Amazing! You've reached ${value} ${milestone}. Keep up the great work!`,
      data: { 
        milestone,
        value,
        url: '/?tab=stats',
        category: 'milestone'
      },
      actions: [
        { action: 'view-progress', title: '🎯 View Progress' },
        { action: 'next-goal', title: '🚀 Set Next Goal' }
      ]
    });
  }
}