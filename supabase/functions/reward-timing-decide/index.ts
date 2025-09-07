import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RewardTimingContext {
  userId: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening';
  daysSinceLastWorkout?: number;
  currentStreak?: number;
  recentEngagement?: 'high' | 'medium' | 'low';
  lastRewardTime?: string;
  weeklySessionCount?: number;
}

interface RewardDecision {
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

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { context }: { context: RewardTimingContext } = await req.json();
    console.log('Processing reward timing decision for context:', context);

    // Check daily/weekly caps to prevent spam
    const dailyCap = await checkDailyCap(supabase, context.userId);
    const weeklyCap = await checkWeeklyCap(supabase, context.userId);

    if (dailyCap.exceeded || weeklyCap.exceeded) {
      console.log('Reward caps exceeded:', { daily: dailyCap.exceeded, weekly: weeklyCap.exceeded });
      return new Response(
        JSON.stringify({ shouldSendReward: false, reason: 'caps_exceeded' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check quiet hours
    const isQuietHours = await checkQuietHours(supabase, context.userId, context.timeOfDay);
    if (isQuietHours) {
      console.log('User is in quiet hours');
      return new Response(
        JSON.stringify({ shouldSendReward: false, reason: 'quiet_hours' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Analyze engagement and decide on reward
    const decision = analyzeAndDecide(context);

    if (decision.shouldSendReward) {
      // Send notification if appropriate
      if (decision.rewardType !== 'surprise_xp') {
        await scheduleRewardNotification(supabase, context.userId, decision);
      }

      // Log the decision
      await supabase
        .from('notification_logs')
        .insert({
          user_id: context.userId,
          notification_type: 'rewards',
          title: decision.message || 'Reward Decision',
          body: `Reward type: ${decision.rewardType}`,
          data: {
            reward_type: decision.rewardType,
            priority: decision.priority,
            xp_amount: decision.xpAmount,
            context: context
          },
          delivery_status: 'scheduled',
          slot: decision.slot,
          experiment_key: decision.experiment,
          variant_key: decision.variant
        });

      console.log('Reward decision made:', decision);
    }

    return new Response(
      JSON.stringify(decision),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in reward-timing-decide:', error);
    return new Response(
      JSON.stringify({ 
        shouldSendReward: false,
        error: error.message 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

/**
 * Core decision algorithm based on engagement patterns
 */
function analyzeAndDecide(context: RewardTimingContext): RewardDecision {
  const {
    daysSinceLastWorkout = 0,
    currentStreak = 0,
    recentEngagement = 'low',
    lastRewardTime,
    weeklySessionCount = 0
  } = context;

  // Check minimum time since last reward (avoid spam)
  if (lastRewardTime) {
    const hoursSinceLastReward = (Date.now() - new Date(lastRewardTime).getTime()) / (1000 * 60 * 60);
    if (hoursSinceLastReward < 2) {
      return { shouldSendReward: false };
    }
  }

  // High-priority scenarios
  
  // 1. Comeback encouragement (user returning after absence)
  if (daysSinceLastWorkout >= 3 && daysSinceLastWorkout <= 7) {
    return {
      shouldSendReward: true,
      rewardType: 'comeback_encourage',
      priority: 'high',
      delayMinutes: Math.random() * 30, // Random delay up to 30 mins
      message: '👋 Welcome back! Ready to rebuild your streak?',
      slot: 'comeback_slot',
      experiment: 'comeback_experiment_v1',
      variant: daysSinceLastWorkout >= 5 ? 'strong_comeback' : 'gentle_comeback'
    };
  }

  // 2. Streak milestone approach (close to achievement)
  if (currentStreak > 0 && (currentStreak === 2 || currentStreak === 6 || currentStreak === 13)) {
    return {
      shouldSendReward: true,
      rewardType: 'milestone_nudge',
      priority: 'medium',
      delayMinutes: Math.random() * 60,
      message: `🎯 ${currentStreak + 1} days to your next milestone! Keep going!`,
      slot: 'milestone_slot',
      experiment: 'milestone_nudge_v1',
      variant: currentStreak >= 10 ? 'high_milestone' : 'early_milestone'
    };
  }

  // 3. Streak boost for consistent users
  if (currentStreak >= 3 && recentEngagement === 'high' && weeklySessionCount >= 4) {
    return {
      shouldSendReward: true,
      rewardType: 'streak_boost',
      priority: 'low',
      delayMinutes: Math.random() * 120,
      message: '🔥 Amazing consistency! Bonus XP for your dedication!',
      xpAmount: 25 + (currentStreak * 2), // Scaling XP based on streak
      slot: 'consistency_slot',
      experiment: 'streak_boost_v1',
      variant: currentStreak >= 7 ? 'veteran_boost' : 'building_boost'
    };
  }

  // 4. Surprise XP for medium engagement users (dopamine hit)
  if (recentEngagement === 'medium' && weeklySessionCount >= 2 && Math.random() < 0.3) {
    return {
      shouldSendReward: true,
      rewardType: 'surprise_xp',
      priority: 'low',
      delayMinutes: Math.random() * 180, // Up to 3 hours delay
      message: '🎉 Surprise! Random XP bonus just for you!',
      xpAmount: 50 + Math.floor(Math.random() * 25), // 50-75 XP
      slot: 'surprise_slot',
      experiment: 'surprise_xp_v1',
      variant: context.timeOfDay === 'evening' ? 'evening_surprise' : 'day_surprise'
    };
  }

  // No reward decision
  return { shouldSendReward: false };
}

/**
 * Check daily reward cap (max 3 rewards per day)
 */
async function checkDailyCap(supabase: any, userId: string): Promise<{ exceeded: boolean, count: number }> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('notification_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('notification_type', 'rewards')
    .gte('sent_at', today.toISOString());

  const count = data?.length || 0;
  return { exceeded: count >= 3, count };
}

/**
 * Check weekly reward cap (max 10 rewards per week)
 */
async function checkWeeklyCap(supabase: any, userId: string): Promise<{ exceeded: boolean, count: number }> {
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const { data, error } = await supabase
    .from('notification_logs')
    .select('id')
    .eq('user_id', userId)
    .eq('notification_type', 'rewards')
    .gte('sent_at', weekStart.toISOString());

  const count = data?.length || 0;
  return { exceeded: count >= 10, count };
}

/**
 * Check if user is in quiet hours
 */
async function checkQuietHours(supabase: any, userId: string, timeOfDay: string): Promise<boolean> {
  const { data } = await supabase
    .from('user_preferences')
    .select('quiet_hours_start, quiet_hours_end')
    .eq('user_id', userId)
    .single();

  if (!data?.quiet_hours_start || !data?.quiet_hours_end) {
    return false;
  }

  const now = new Date();
  const currentHour = now.getHours();
  const startHour = parseInt(data.quiet_hours_start.split(':')[0]);
  const endHour = parseInt(data.quiet_hours_end.split(':')[0]);

  if (startHour > endHour) { // Overnight quiet hours
    return currentHour >= startHour || currentHour < endHour;
  } else { // Same day quiet hours
    return currentHour >= startHour && currentHour < endHour;
  }
}

/**
 * Schedule reward notification via push notification service
 */
async function scheduleRewardNotification(supabase: any, userId: string, decision: RewardDecision): Promise<void> {
  try {
    // For immediate notifications, send directly
    if (!decision.delayMinutes || decision.delayMinutes < 5) {
      await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          title: getRewardNotificationTitle(decision.rewardType!),
          body: decision.message || 'You have a new reward waiting!',
          notification_type: 'rewards',
          data: {
            reward_type: decision.rewardType,
            xp_amount: decision.xpAmount,
            priority: decision.priority,
            slot: decision.slot
          }
        }
      });
    } else {
      // For delayed notifications, create a schedule entry
      const sendTime = new Date(Date.now() + (decision.delayMinutes * 60 * 1000));
      
      await supabase
        .from('user_notification_schedules')
        .insert({
          user_id: userId,
          slot: decision.slot || 'reward_default',
          send_time: sendTime.toTimeString().split(' ')[0], // HH:MM:SS format
          enabled: true
        });
    }
  } catch (error) {
    console.error('Error scheduling reward notification:', error);
  }
}

/**
 * Generate notification titles based on reward type
 */
function getRewardNotificationTitle(rewardType: string): string {
  const titles = {
    'surprise_xp': '🎉 Surprise XP Bonus!',
    'milestone_nudge': '🎯 Milestone Alert!',
    'comeback_encourage': '👋 Welcome Back!',
    'streak_boost': '🔥 Streak Bonus!'
  };
  
  return titles[rewardType as keyof typeof titles] || '🎁 Reward Available!';
}