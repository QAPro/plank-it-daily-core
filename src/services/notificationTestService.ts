import { supabase } from '@/integrations/supabase/client';

export class NotificationTestService {
  /**
   * Test event-driven notifications by simulating events
   */
  static async testAchievementNotification(userId: string) {
    try {
      // Simulate an achievement unlock by calling the edge function directly
      const { data, error } = await supabase.functions.invoke('notification-events', {
        body: {
          type: 'achievement_unlocked',
          user_id: userId,
          achievement: {
            name: 'Test Achievement',
            description: 'This is a test achievement notification',
            rarity: 'rare',
            points: 100
          }
        }
      });

      if (error) throw error;
      console.log('Test achievement notification sent:', data);
      return data;
    } catch (error) {
      console.error('Error testing achievement notification:', error);
      throw error;
    }
  }

  /**
   * Test streak milestone notification
   */
  static async testStreakMilestone(userId: string, streakDays: number = 7) {
    try {
      const { data, error } = await supabase.functions.invoke('notification-events', {
        body: {
          type: 'streak_milestone',
          user_id: userId,
          streak_days: streakDays
        }
      });

      if (error) throw error;
      console.log('Test streak milestone notification sent:', data);
      return data;
    } catch (error) {
      console.error('Error testing streak milestone notification:', error);
      throw error;
    }
  }

  /**
   * Test session completion notification
   */
  static async testSessionCompletion(userId: string) {
    try {
      const { data, error } = await supabase.functions.invoke('notification-events', {
        body: {
          type: 'session_completed',
          user_id: userId,
          session: {
            duration_seconds: 300, // 5 minutes
            exercise_id: 'test-exercise',
            completed_at: new Date().toISOString()
          }
        }
      });

      if (error) throw error;
      console.log('Test session completion notification sent:', data);
      return data;
    } catch (error) {
      console.error('Error testing session completion notification:', error);
      throw error;
    }
  }

  /**
   * Test scheduled tasks (daily reminders)
   */
  static async testDailyReminders() {
    try {
      const { data, error } = await supabase.functions.invoke('notification-events', {
        body: {
          task: 'daily_reminders'
        }
      });

      if (error) throw error;
      console.log('Test daily reminders task completed:', data);
      return data;
    } catch (error) {
      console.error('Error testing daily reminders:', error);
      throw error;
    }
  }

  /**
   * Test streak risk alerts
   */
  static async testStreakRiskAlerts() {
    try {
      const { data, error } = await supabase.functions.invoke('notification-events', {
        body: {
          task: 'streak_risk'
        }
      });

      if (error) throw error;
      console.log('Test streak risk alerts task completed:', data);
      return data;
    } catch (error) {
      console.error('Error testing streak risk alerts:', error);
      throw error;
    }
  }

  /**
   * Test weekly summary
   */
  static async testWeeklySummary() {
    try {
      const { data, error } = await supabase.functions.invoke('notification-events', {
        body: {
          task: 'weekly_summary'
        }
      });

      if (error) throw error;
      console.log('Test weekly summary task completed:', data);
      return data;
    } catch (error) {
      console.error('Error testing weekly summary:', error);
      throw error;
    }
  }

  /**
   * Test re-engagement notifications for inactive users
   */
  static async testReEngagementNotifications() {
    try {
      const { data, error } = await supabase.functions.invoke('schedule-re-engagement-notifications', {
        body: {}
      });

      if (error) throw error;
      console.log('Test re-engagement notifications completed:', data);
      return data;
    } catch (error) {
      console.error('Error testing re-engagement notifications:', error);
      throw error;
    }
  }

  /**
   * Get recent notification logs for a user
   */
  static async getUserNotificationLogs(userId: string, limit: number = 10) {
    try {
      const { data, error } = await supabase
        .from('notification_logs')
        .select('*')
        .eq('user_id', userId)
        .order('sent_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching notification logs:', error);
      throw error;
    }
  }
}