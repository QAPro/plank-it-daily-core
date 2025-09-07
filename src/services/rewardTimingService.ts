import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface RewardTimingContext {
  userId: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  daysSinceLastWorkout?: number;
  currentStreak?: number;
  recentEngagement?: 'high' | 'medium' | 'low';
  lastRewardTime?: string;
  weeklySessionCount?: number;
}

export interface RewardDecision {
  shouldSendReward: boolean;
  rewardType?: 'surprise_xp' | 'milestone_nudge' | 'comeback_encourage' | 'streak_boost';
  priority?: 'low' | 'medium' | 'high';
  delayMinutes?: number;
  message?: string;
  xpAmount?: number;
  slot?: string;
  experiment?: string;
  variant?: string;
}

export class RewardTimingService {
  /**
   * Request reward timing decision from Edge Function
   */
  static async requestRewardDecision(context: RewardTimingContext): Promise<RewardDecision> {
    try {
      const { data, error } = await supabase.functions.invoke('reward-timing-decide', {
        body: { context }
      });

      if (error) throw error;
      
      return data as RewardDecision;
    } catch (error) {
      console.error('Error requesting reward decision:', error);
      return { shouldSendReward: false };
    }
  }

  /**
   * Trigger in-app reward nudge (instant feedback)
   */
  static async triggerInAppNudge(rewardType: string, xpAmount?: number): Promise<void> {
    try {
      const messages = {
        'surprise_xp': `🎉 Surprise! You earned ${xpAmount || 50} bonus XP!`,
        'milestone_nudge': '🎯 You\'re close to a milestone! Keep going!',
        'comeback_encourage': '👋 Welcome back! Ready to rebuild your streak?',
        'streak_boost': `🔥 Streak power! ${xpAmount || 25} bonus XP for consistency!`
      };

      const message = messages[rewardType as keyof typeof messages] || 'Keep up the great work!';

      toast({
        title: "Motivation Boost",
        description: message,
        duration: 4000
      });

      // Could trigger additional UI animations here
      this.triggerRewardAnimation(rewardType);
      
    } catch (error) {
      console.error('Error triggering in-app nudge:', error);
    }
  }

  /**
   * Gather user context for reward timing decisions
   */
  static async gatherUserContext(userId: string): Promise<RewardTimingContext> {
    try {
      const now = new Date();
      const hour = now.getHours();
      const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

      // Get recent session data
      const { data: recentSessions } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10);

      // Get streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .single();

      // Calculate engagement metrics
      const lastSession = recentSessions?.[0];
      const daysSinceLastWorkout = lastSession 
        ? Math.floor((Date.now() - new Date(lastSession.completed_at).getTime()) / (1000 * 60 * 60 * 24))
        : 7;

      const weekStartDate = new Date(now);
      weekStartDate.setDate(now.getDate() - now.getDay());
      weekStartDate.setHours(0, 0, 0, 0);

      const weeklySessionCount = recentSessions?.filter(session => 
        new Date(session.completed_at) >= weekStartDate
      ).length || 0;

      const recentEngagement = weeklySessionCount >= 4 ? 'high' : 
                               weeklySessionCount >= 2 ? 'medium' : 'low';

      // Get last reward time from logs
      const { data: lastReward } = await supabase
        .from('notification_logs')
        .select('sent_at')
        .eq('user_id', userId)
        .like('slot', '%reward%')
        .order('sent_at', { ascending: false })
        .limit(1)
        .single();

      return {
        userId,
        timeOfDay,
        daysSinceLastWorkout,
        currentStreak: streakData?.current_streak || 0,
        recentEngagement,
        lastRewardTime: lastReward?.sent_at,
        weeklySessionCount
      };

    } catch (error) {
      console.error('Error gathering user context:', error);
      return {
        userId,
        timeOfDay: 'afternoon',
        recentEngagement: 'low'
      };
    }
  }

  /**
   * Trigger visual reward animation
   */
  private static triggerRewardAnimation(rewardType: string): void {
    // Create and dispatch custom event for UI components to listen to
    const event = new CustomEvent('rewardAnimation', {
      detail: { type: rewardType, timestamp: Date.now() }
    });
    window.dispatchEvent(event);
  }
}