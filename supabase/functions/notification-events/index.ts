import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface EventPayload {
  type?: string;
  user_id?: string;
  achievement?: any;
  streak_days?: number;
  session?: any;
  task?: string;
}

interface ReminderSlot {
  slot: string;
  reminder_time: string;
  enabled: boolean;
}

interface MessageVariant {
  id: string;
  content: {
    title: string;
    body: string;
    data?: any;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: EventPayload = await req.json();
    console.log('Notification event received:', payload);

    // Handle scheduled tasks
    if (payload.task) {
      switch (payload.task) {
        case 'daily_reminders':
          await handleEnhancedDailyReminders(supabase);
          break;
        case 'streak_risk_alerts':
          await handleEnhancedStreakRiskAlerts(supabase);
          break;
        case 'weekly_summary':
          await handleEnhancedWeeklySummary(supabase);
          break;
        case 'reengagement':
          await handleEnhancedReengagement(supabase);
          break;
        default:
          console.log('Unknown task:', payload.task);
      }
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Handle event-driven notifications
    if (payload.type && payload.user_id) {
      await handleEnhancedEventNotification(supabase, payload);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in notification-events function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Enhanced event notification with A/B testing and personalization
async function handleEnhancedEventNotification(supabase: any, payload: EventPayload) {
  const variant = await getOrAssignMessageVariant(supabase, payload.user_id!, payload.type!);
  
  if (!variant) {
    // Fallback to basic messages
    await handleBasicEventNotification(supabase, payload);
    return;
  }

  // Send notification with A/B tested variant
  await supabase.functions.invoke('send-push-notification', {
    body: {
      user_id: payload.user_id,
      title: variant.content.title,
      body: variant.content.body,
      notification_type: getNotificationTypeFromEvent(payload.type!),
      data: { ...variant.content.data, variant_id: variant.id }
    }
  });

  console.log(`Sent A/B tested ${payload.type} notification (variant ${variant.id}) to user ${payload.user_id}`);
}

// Fallback basic event notification
async function handleBasicEventNotification(supabase: any, payload: EventPayload) {
  let title = '';
  let body = '';
  let notification_type = '';
  let data = {};

  switch (payload.type) {
    case 'achievement_unlocked':
      title = '🎉 Achievement Unlocked!';
      body = `Congratulations! You've earned: ${payload.achievement?.name}`;
      notification_type = 'achievements';
      data = { achievement: payload.achievement };
      break;

    case 'streak_milestone':
      title = '🔥 Streak Milestone!';
      body = `Amazing! You've reached a ${payload.streak_days}-day workout streak!`;
      notification_type = 'streaks';
      data = { streak_days: payload.streak_days };
      break;

    case 'session_completed':
      title = '💪 Great Workout!';
      body = `You completed a ${Math.round((payload.session?.duration_seconds || 0) / 60)}-minute session. Keep it up!`;
      notification_type = 'milestones';
      data = { session: payload.session };
      break;

    default:
      console.log('Unknown event type:', payload.type);
      return;
  }

  await supabase.functions.invoke('send-push-notification', {
    body: {
      user_id: payload.user_id,
      title,
      body,
      notification_type,
      data
    }
  });

  console.log(`Sent basic ${payload.type} notification to user ${payload.user_id}`);
}

// Enhanced daily reminders with multiple time slots and contextual messages
async function handleEnhancedDailyReminders(supabase: any) {
  console.log('Processing enhanced daily workout reminders...');
  
  const now = new Date();
  const currentTimeStr = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:00`;
  
  // Get users with reminder slots that match current time (±15 min window for flexibility)
  const { data: reminderSlots, error } = await supabase
    .from('user_reminder_slots')
    .select(`
      user_id,
      slot,
      reminder_time,
      user_preferences!inner(
        push_notifications_enabled,
        notification_types,
        time_zone
      )
    `)
    .eq('enabled', true)
    .eq('user_preferences.push_notifications_enabled', true);

  if (error) {
    console.error('Error fetching reminder slots:', error);
    return;
  }

  if (!reminderSlots?.length) {
    console.log('No active reminder slots found');
    return;
  }

  for (const reminder of reminderSlots) {
    try {
      // Check if it's time for this reminder (within 15-minute window)
      const [reminderHour, reminderMinute] = reminder.reminder_time.split(':').map(Number);
      const timeDiff = Math.abs((now.getUTCHours() * 60 + now.getUTCMinutes()) - (reminderHour * 60 + reminderMinute));
      
      if (timeDiff > 15) continue;

      // Check if reminders are enabled in notification types
      if (reminder.user_preferences?.notification_types?.reminders === false) continue;

      // Check if we already sent this type of reminder today
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const { data: recentReminder } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('user_id', reminder.user_id)
        .eq('notification_type', 'reminders')
        .gte('sent_at', todayStart)
        .like('body', `%${reminder.slot}%`)
        .limit(1);

      if (recentReminder?.length) continue;

      // Get A/B tested message variant for this slot
      const variant = await getOrAssignMessageVariant(
        supabase, 
        reminder.user_id, 
        'daily_reminder', 
        reminder.slot
      );

      if (variant) {
        // Send A/B tested reminder
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: reminder.user_id,
            title: variant.content.title,
            body: variant.content.body,
            notification_type: 'reminders',
            data: { 
              ...variant.content.data,
              slot: reminder.slot,
              variant_id: variant.id
            }
          }
        });
      } else {
        // Fallback contextual reminder
        const { title, body } = getContextualReminderMessage(reminder.slot);
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: reminder.user_id,
            title,
            body,
            notification_type: 'reminders',
            data: { 
              type: 'daily_reminder',
              slot: reminder.slot
            }
          }
        });
      }

      console.log(`Sent ${reminder.slot} reminder to user ${reminder.user_id}`);
      
    } catch (error) {
      console.error(`Error sending reminder to user ${reminder.user_id}:`, error);
    }
  }
}

// Enhanced streak risk alerts with milestone-specific messaging
async function handleEnhancedStreakRiskAlerts(supabase: any) {
  console.log('Processing enhanced streak risk alerts...');
  
  const today = new Date().toISOString().split('T')[0];
  
  const { data: atRiskUsers, error } = await supabase
    .from('user_streaks')
    .select(`
      user_id,
      current_streak,
      last_workout_date,
      longest_streak
    `)
    .gt('current_streak', 0)
    .or(`last_workout_date.is.null,last_workout_date.neq.${today}`);

  if (error) {
    console.error('Error fetching streak data:', error);
    return;
  }

  if (!atRiskUsers?.length) {
    console.log('No users at streak risk found');
    return;
  }

  for (const user of atRiskUsers) {
    try {
      // Check user preferences
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('push_notifications_enabled, notification_types')
        .eq('user_id', user.user_id)
        .single();

      if (!prefs?.push_notifications_enabled || prefs?.notification_types?.streaks === false) {
        continue;
      }

      // Don't send if we already sent a streak risk alert today
      const { data: recentAlert } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('user_id', user.user_id)
        .eq('notification_type', 'streaks')
        .gte('sent_at', new Date().toISOString().split('T')[0])
        .limit(1);

      if (recentAlert?.length) continue;

      // Get A/B tested message variant
      const variant = await getOrAssignMessageVariant(
        supabase, 
        user.user_id, 
        'streak_risk'
      );

      if (variant) {
        // Use A/B tested message
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: user.user_id,
            title: variant.content.title,
            body: variant.content.body.replace('{streak}', user.current_streak),
            notification_type: 'streaks',
            data: { 
              ...variant.content.data,
              current_streak: user.current_streak,
              variant_id: variant.id
            }
          }
        });
      } else {
        // Fallback personalized message
        const { title, body } = getPersonalizedStreakMessage(user.current_streak, user.longest_streak);
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: user.user_id,
            title,
            body,
            notification_type: 'streaks',
            data: { 
              type: 'streak_risk',
              current_streak: user.current_streak
            }
          }
        });
      }

      console.log(`Sent enhanced streak risk alert to user ${user.user_id}`);
      
    } catch (error) {
      console.error(`Error sending streak alert to user ${user.user_id}:`, error);
    }
  }
}

// Enhanced weekly summary with social comparison
async function handleEnhancedWeeklySummary(supabase: any) {
  console.log('Processing enhanced weekly progress summaries...');
  
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Get weekly stats for all users
  const { data: weeklyStats, error } = await supabase
    .from('user_sessions')
    .select(`
      user_id,
      duration_seconds,
      completed_at
    `)
    .gte('completed_at', weekStart.toISOString())
    .lt('completed_at', weekEnd.toISOString());

  if (error || !weeklyStats?.length) {
    console.log('No weekly activity found');
    return;
  }

  // Calculate user stats and percentiles
  const userStats = weeklyStats.reduce((acc, session) => {
    if (!acc[session.user_id]) {
      acc[session.user_id] = { sessions: 0, totalDuration: 0 };
    }
    acc[session.user_id].sessions++;
    acc[session.user_id].totalDuration += session.duration_seconds || 0;
    return acc;
  }, {} as Record<string, { sessions: number; totalDuration: number }>);

  // Calculate percentiles for social comparison
  const sessionCounts = Object.values(userStats).map(s => s.sessions).sort((a, b) => b - a);
  const durations = Object.values(userStats).map(s => s.totalDuration).sort((a, b) => b - a);

  for (const [userId, stats] of Object.entries(userStats)) {
    try {
      // Check user preferences
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('push_notifications_enabled, notification_types')
        .eq('user_id', userId)
        .single();

      if (!prefs?.push_notifications_enabled || prefs?.notification_types?.milestones === false) {
        continue;
      }

      // Calculate user's percentile
      const sessionPercentile = Math.round((sessionCounts.filter(s => s <= stats.sessions).length / sessionCounts.length) * 100);
      
      // Get A/B tested message variant
      const variant = await getOrAssignMessageVariant(
        supabase, 
        userId, 
        'weekly_summary'
      );

      const totalMinutes = Math.round(stats.totalDuration / 60);

      if (variant) {
        // Use A/B tested message with template replacement
        let body = variant.content.body
          .replace('{sessions}', stats.sessions.toString())
          .replace('{minutes}', totalMinutes.toString())
          .replace('{percentile}', sessionPercentile.toString());

        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: userId,
            title: variant.content.title,
            body,
            notification_type: 'milestones',
            data: { 
              ...variant.content.data,
              sessions: stats.sessions,
              totalMinutes,
              percentile: sessionPercentile,
              variant_id: variant.id
            }
          }
        });
      } else {
        // Fallback personalized message
        const { title, body } = getPersonalizedWeeklySummary(stats.sessions, totalMinutes, sessionPercentile);
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: userId,
            title,
            body,
            notification_type: 'milestones',
            data: { 
              type: 'weekly_summary',
              sessions: stats.sessions,
              totalMinutes,
              percentile: sessionPercentile
            }
          }
        });
      }

      console.log(`Sent enhanced weekly summary to user ${userId}`);
      
    } catch (error) {
      console.error(`Error sending weekly summary to user ${userId}:`, error);
    }
  }
}

// Enhanced re-engagement with activity-based timing
async function handleEnhancedReengagement(supabase: any) {
  console.log('Processing enhanced re-engagement campaigns...');
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Segment users by inactivity period
  const { data: inactiveUsers } = await supabase
    .from('user_sessions')
    .select(`
      user_id,
      completed_at,
      duration_seconds
    `)
    .lt('completed_at', sevenDaysAgo.toISOString())
    .gte('completed_at', thirtyDaysAgo.toISOString());

  if (!inactiveUsers?.length) {
    console.log('No inactive users to re-engage');
    return;
  }

  // Group users by last activity date
  const userSegments = inactiveUsers.reduce((acc, session) => {
    const lastActivity = new Date(session.completed_at);
    const daysInactive = Math.floor((sevenDaysAgo.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    let segment = 'short_term'; // 7-14 days
    if (daysInactive >= 14) segment = 'medium_term'; // 14-30 days
    if (daysInactive >= 30) segment = 'long_term'; // 30+ days

    if (!acc[session.user_id]) {
      acc[session.user_id] = { segment, lastActivity, totalSessions: 0 };
    }
    acc[session.user_id].totalSessions++;
    
    return acc;
  }, {} as Record<string, { segment: string; lastActivity: Date; totalSessions: number }>);

  for (const [userId, userData] of Object.entries(userSegments)) {
    try {
      // Check user preferences
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('push_notifications_enabled, notification_types')
        .eq('user_id', userId)
        .single();

      if (!prefs?.push_notifications_enabled || prefs?.notification_types?.reminders === false) {
        continue;
      }

      // Don't send if we already sent re-engagement this week
      const { data: recentReengagement } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('notification_type', 'reminders')
        .like('body', '%miss%')
        .gte('sent_at', sevenDaysAgo.toISOString())
        .limit(1);

      if (recentReengagement?.length) continue;

      // Get A/B tested message variant for user segment
      const variant = await getOrAssignMessageVariant(
        supabase, 
        userId, 
        'reengagement',
        userData.segment
      );

      if (variant) {
        // Use A/B tested message
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: userId,
            title: variant.content.title,
            body: variant.content.body,
            notification_type: 'reminders',
            data: { 
              ...variant.content.data,
              segment: userData.segment,
              variant_id: variant.id
            }
          }
        });
      } else {
        // Fallback segmented message
        const { title, body } = getSegmentedReengagementMessage(userData.segment, userData.totalSessions);
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: userId,
            title,
            body,
            notification_type: 'reminders',
            data: { 
              category: 'reengagement',
              segment: userData.segment
            }
          }
        });
      }

      console.log(`Sent enhanced re-engagement (${userData.segment}) to user ${userId}`);
      
    } catch (error) {
      console.error(`Error sending re-engagement to user ${userId}:`, error);
    }
  }
}

// A/B Testing and Message Variant Management
async function getOrAssignMessageVariant(
  supabase: any, 
  userId: string, 
  category: string, 
  slot?: string
): Promise<MessageVariant | null> {
  try {
    // Check if user already has an assignment
    const { data: assignment } = await supabase
      .from('user_notification_variant_assignments')
      .select(`
        variant_id,
        notification_message_variants!inner(
          id,
          content,
          is_active
        )
      `)
      .eq('user_id', userId)
      .eq('category', category)
      .eq('slot', slot || null)
      .eq('notification_message_variants.is_active', true)
      .single();

    if (assignment) {
      return {
        id: assignment.variant_id,
        content: assignment.notification_message_variants.content
      };
    }

    // Get available variants for this category/slot
    const { data: variants } = await supabase
      .from('notification_message_variants')
      .select('id, content, variant_key')
      .eq('category', category)
      .eq('slot', slot || null)
      .eq('is_active', true);

    if (!variants?.length) {
      return null;
    }

    // Assign variant using deterministic hash
    const hash = simpleHash(userId + category + (slot || ''));
    const selectedVariant = variants[hash % variants.length];

    // Store assignment
    await supabase
      .from('user_notification_variant_assignments')
      .insert({
        user_id: userId,
        category,
        slot: slot || null,
        variant_id: selectedVariant.id,
        assignment_hash: hash.toString()
      });

    return {
      id: selectedVariant.id,
      content: selectedVariant.content
    };

  } catch (error) {
    console.error('Error in A/B variant assignment:', error);
    return null;
  }
}

// Utility functions for fallback messages
function getContextualReminderMessage(slot: string): { title: string; body: string } {
  const messages = {
    morning: {
      title: '🌅 Morning Energy Boost',
      body: 'Start your day strong! A quick plank session will energize your morning.'
    },
    lunch: {
      title: '☀️ Midday Movement',
      body: 'Perfect time for a workout break! Squeeze in some core strength.'
    },
    evening: {
      title: '🌆 Evening Strength',
      body: 'Wind down with purpose. End your day with a strengthening session.'
    },
    last_chance: {
      title: '🎯 Last Call',
      body: 'Don\'t let today slip by! Quick workout to keep your streak alive.'
    }
  };
  
  return messages[slot as keyof typeof messages] || messages.morning;
}

function getPersonalizedStreakMessage(currentStreak: number, longestStreak: number): { title: string; body: string } {
  if (currentStreak >= longestStreak) {
    return {
      title: '🔥 Personal Record at Risk!',
      body: `You're at ${currentStreak} days - your best streak yet! Don't break it now!`
    };
  } else if (currentStreak >= 7) {
    return {
      title: '⚡ Strong Streak in Danger',
      body: `Your ${currentStreak}-day streak is impressive! Keep the momentum going.`
    };
  } else {
    return {
      title: '🎯 Streak Alert',
      body: `${currentStreak} days strong! A quick session keeps your progress alive.`
    };
  }
}

function getPersonalizedWeeklySummary(sessions: number, minutes: number, percentile: number): { title: string; body: string } {
  let title = '📊 Weekly Progress';
  let body = `This week: ${sessions} workouts, ${minutes} minutes total.`;
  
  if (percentile >= 80) {
    title = '🏆 Outstanding Week!';
    body += ` You're in the top ${100 - percentile}% of users!`;
  } else if (percentile >= 60) {
    title = '💪 Strong Week!';
    body += ` You're above average - keep it up!`;
  } else {
    body += ` Every workout counts - you've got this!`;
  }
  
  return { title, body };
}

function getSegmentedReengagementMessage(segment: string, totalSessions: number): { title: string; body: string } {
  const messages = {
    short_term: {
      title: '👋 Quick Check-in',
      body: 'Just a week since your last workout. Ready to jump back in?'
    },
    medium_term: {
      title: '💫 Welcome Back!',
      body: `Remember your ${totalSessions} completed sessions? Let's add another one!`
    },
    long_term: {
      title: '🌟 Fresh Start',
      body: 'It\'s been a while, but every journey begins with a single step. Or plank!'
    }
  };
  
  return messages[segment as keyof typeof messages] || messages.short_term;
}

function getNotificationTypeFromEvent(eventType: string): string {
  const typeMap: Record<string, string> = {
    'achievement_unlocked': 'achievements',
    'streak_milestone': 'streaks',
    'session_completed': 'milestones'
  };
  
  return typeMap[eventType] || 'milestones';
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}