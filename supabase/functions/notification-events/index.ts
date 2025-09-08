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
  send_time: string; // HH:MM:SS
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
      case 'social_triggers':
        await handleSocialTriggers(supabase);
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

// Enhanced event notification with Hook Model trigger logging
async function handleEnhancedEventNotification(supabase: any, payload: EventPayload) {
  try {
    console.log('Processing enhanced event notification:', payload);
    
    const { type, user_id, data = {} } = payload;
    
    if (!type || !user_id) {
      throw new Error('Missing required fields: type or user_id');
    }

    // Check user preferences
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('notification_types')
      .eq('user_id', user_id)
      .single();

    const notificationTypes = preferences?.notification_types || {};
    const notificationCategory = getNotificationTypeFromEvent(type);
    
    if (!notificationTypes[notificationCategory]) {
      console.log(`User ${user_id} has disabled ${notificationCategory} notifications`);
      return;
    }

    // Check quiet hours
    const isQuietHours = await checkQuietHours(supabase, user_id, new Date());
    if (isQuietHours) {
      console.log(`Skipping notification for user ${user_id} - quiet hours`);
      return;
    }

    // Check daily fatigue caps
    const canSend = await checkDailyFatigueCaps(supabase, user_id, notificationCategory);
    if (!canSend) {
      console.log(`Skipping notification for user ${user_id} - daily limit reached`);
      return;
    }

    // Get or assign message variant for A/B testing
    const variant = await getOrAssignMessageVariant(supabase, user_id, notificationCategory);
    
    if (!variant) {
      console.log(`No message variant found for category: ${notificationCategory}`);
      // Fallback to basic notification
      await handleBasicEventNotification(supabase, payload);
      return;
    }

    // Prepare enhanced notification content using templates
    let title = variant.title_template || variant.content?.title || 'Notification';
    let body = variant.body_template || variant.content?.body || 'You have a new notification';
    
    // Replace placeholders based on event type
    if (type === 'achievement_unlocked' && data.achievement) {
      title = title.replace('{achievement_name}', data.achievement.name || 'New Achievement');
      body = body.replace('{achievement_name}', data.achievement.name || 'New Achievement');
    } else if (type === 'streak_milestone' && data.streak_days) {
      title = title.replace('{streak_days}', data.streak_days.toString());
      body = body.replace('{streak_days}', data.streak_days.toString());
    }

    // Log trigger effectiveness for Hook Model analytics
    const { data: triggerLog } = await supabase
      .from('trigger_effectiveness_logs')
      .insert({
        user_id,
        notification_id: null, // Will be updated when push notification is sent
        trigger_type: type,
        trigger_content: JSON.stringify({ title, body }),
        user_context: data,
        response_action: null, // Will be updated if user responds
        response_timestamp: null
      })
      .select('id')
      .single();

    // Prepare notification payload
    const notificationPayload = {
      userIds: [user_id],
      title,
      body,
      data: {
        type,
        variant_id: variant.id,
        variant_key: variant.variant_key,
        experiment_key: variant.experiment_key,
        trigger_log_id: triggerLog?.id, // Include for response tracking
        ...data
      },
      actions: variant.content?.actions || []
    };

    // Send notification
    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: notificationPayload
    });

    if (error) {
      console.error('Failed to send enhanced notification:', error);
    } else {
      console.log(`Enhanced ${type} notification sent to user ${user_id}`);
      
      // Update trigger log with notification ID if available
      if (triggerLog?.id && notificationPayload.data?.notification_id) {
        await supabase
          .from('trigger_effectiveness_logs')
          .update({ notification_id: notificationPayload.data.notification_id })
          .eq('id', triggerLog.id);
      }
    }

  } catch (error) {
    console.error('Error in handleEnhancedEventNotification:', error);
    // Fallback to basic notification
    await handleBasicEventNotification(supabase, payload);
  }
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

  const nowUtc = new Date();

  // 1) Fetch active schedules from new table; fallback to legacy if empty
  const { data: schedulesNew, error: schedErrNew } = await supabase
    .from('user_notification_schedules')
    .select('user_id, slot, send_time, enabled')
    .eq('enabled', true);

  let schedules: Array<{ user_id: string; slot: string; send_time: string; enabled: boolean }> = [];

  if (schedErrNew) {
    console.warn('user_notification_schedules query failed, falling back to user_reminder_slots:', schedErrNew.message);
  } else if (schedulesNew?.length) {
    schedules = schedulesNew as any;
  }

  if (!schedules.length) {
    const { data: schedulesLegacy, error: schedErrLegacy } = await supabase
      .from('user_reminder_slots')
      .select('user_id, slot, reminder_time, enabled')
      .eq('enabled', true);

    if (schedErrLegacy) {
      console.error('Error fetching reminder slots:', schedErrLegacy);
      return;
    }

    schedules = (schedulesLegacy || []).map((r: any) => ({
      user_id: r.user_id,
      slot: r.slot,
      send_time: r.reminder_time,
      enabled: r.enabled,
    }));
  }

  if (!schedules.length) {
    console.log('No active reminder slots found');
    return;
  }

  // 2) Fetch user preferences in batch
  const userIds = Array.from(new Set(schedules.map((s) => s.user_id)));
  const { data: prefsList, error: prefsErr } = await supabase
    .from('user_preferences')
    .select('user_id, push_notifications_enabled, notification_types, time_zone');

  if (prefsErr) {
    console.error('Error fetching user preferences:', prefsErr);
    return;
  }

  const prefMap = new Map<string, any>(prefsList?.map((p: any) => [p.user_id, p]) || []);

  // 3) Helper to get local time in HH:MM for a timezone
  const getLocalMinutes = (timeZone: string) => {
    try {
      const parts = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hourCycle: 'h23',
        timeZone,
      }).formatToParts(nowUtc);
      const hh = Number(parts.find((p) => p.type === 'hour')?.value || '0');
      const mm = Number(parts.find((p) => p.type === 'minute')?.value || '0');
      return hh * 60 + mm;
    } catch {
      // Fallback to UTC if timezone unsupported
      return nowUtc.getUTCHours() * 60 + nowUtc.getUTCMinutes();
    }
  };

  for (const sched of schedules) {
    try {
      const prefs = prefMap.get(sched.user_id);
      if (!prefs) continue;

      if (prefs.push_notifications_enabled === false) continue;
      if (prefs.notification_types?.reminders === false) continue;

      const tz = prefs.time_zone || 'UTC';
      const localNowMin = getLocalMinutes(tz);

      const [hh, mm] = (sched.send_time || '18:00:00').split(':').map((n) => Number(n));
      const targetMin = hh * 60 + mm;
      const diff = Math.abs(localNowMin - targetMin);

      // 15-minute send window
      if (diff > 15) continue;

      // Rate limit: avoid sending duplicate slot today (UTC day window kept simple)
      const dayStartUtc = new Date(Date.UTC(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), nowUtc.getUTCDate())).toISOString();
      const { data: recent } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('user_id', sched.user_id)
        .eq('notification_type', 'reminders')
        .contains('data', { slot: sched.slot })
        .gte('sent_at', dayStartUtc)
        .limit(1);

      if (recent?.length) continue;

      // A/B variant for this slot
      const variant = await getOrAssignMessageVariant(supabase, sched.user_id, 'daily_reminder', sched.slot);

      if (variant) {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: sched.user_id,
            title: variant.content.title,
            body: variant.content.body,
            notification_type: 'reminders',
            data: { ...variant.content.data, slot: sched.slot, variant_id: variant.id },
          },
        });
      } else {
        const { title, body } = getContextualReminderMessage(sched.slot);
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: sched.user_id,
            title,
            body,
            notification_type: 'reminders',
            data: { type: 'daily_reminder', slot: sched.slot },
          },
        });
      }

      console.log(`Sent ${sched.slot} reminder to user ${sched.user_id}`);
    } catch (error) {
      console.error(`Error sending reminder to user ${sched.user_id}:`, error);
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

// A/B Testing and Message Variant Management with Weighted Selection
async function getOrAssignMessageVariant(
  supabase: any, 
  userId: string, 
  category: string, 
  slot?: string
): Promise<any> {
  try {
    // Check for existing assignment
    const { data: existingAssignment } = await supabase
      .from('user_notification_variant_assignments')
      .select('variant_id, assignment_hash')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('slot', slot || '')
      .single();

    if (existingAssignment) {
      // Get the variant details
      const { data: variant } = await supabase
        .from('notification_message_variants')
        .select('*')
        .eq('id', existingAssignment.variant_id)
        .single();
      
      return variant;
    }

    // Get available variants for this category/slot with weights
    const { data: variants } = await supabase
      .from('notification_message_variants')
      .select('*')
      .eq('category', category)
      .eq('slot', slot || '')
      .eq('is_active', true)
      .order('weight', { ascending: false });

    if (!variants || variants.length === 0) {
      return null;
    }

    // Weighted random selection
    const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 1), 0);
    const randomNum = Math.random() * totalWeight;
    let currentWeight = 0;
    
    let selectedVariant = variants[0]; // fallback
    for (const variant of variants) {
      currentWeight += (variant.weight || 1);
      if (randomNum <= currentWeight) {
        selectedVariant = variant;
        break;
      }
    }
    
    // Store the assignment
    const assignmentHash = simpleHash(userId + category + (slot || '') + Date.now());
    await supabase
      .from('user_notification_variant_assignments')
      .insert({
        user_id: userId,
        variant_id: selectedVariant.id,
        category,
        slot: slot || null,
        assignment_hash: assignmentHash
      });

    return selectedVariant;
  } catch (error) {
    console.error('Error in getOrAssignMessageVariant:', error);
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

// Utility Functions
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(36);
}

async function checkQuietHours(supabase: any, userId: string, currentTime: Date): Promise<boolean> {
  try {
    const { data: preferences } = await supabase
      .from('user_preferences')
      .select('quiet_hours_start, quiet_hours_end, time_zone')
      .eq('user_id', userId)
      .single();

    if (!preferences) return false;

    const { quiet_hours_start, quiet_hours_end, time_zone } = preferences;
    if (!quiet_hours_start || !quiet_hours_end) return false;

    // Convert current time to user's timezone
    const userTime = new Date(currentTime.toLocaleString("en-US", { timeZone: time_zone || 'UTC' }));
    const currentHour = userTime.getHours();
    const currentMinute = userTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    // Parse quiet hours
    const [startHour, startMinute] = quiet_hours_start.split(':').map(Number);
    const [endHour, endMinute] = quiet_hours_end.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

    // Handle quiet hours that span midnight
    if (startTotalMinutes > endTotalMinutes) {
      return currentTotalMinutes >= startTotalMinutes || currentTotalMinutes <= endTotalMinutes;
    } else {
      return currentTotalMinutes >= startTotalMinutes && currentTotalMinutes <= endTotalMinutes;
    }
  } catch (error) {
    console.error('Error checking quiet hours:', error);
    return false;
  }
}

function addRandomization(baseTime: Date, windowMinutes: number = 30): Date {
  const randomOffset = Math.floor(Math.random() * (windowMinutes * 2)) - windowMinutes;
  return new Date(baseTime.getTime() + randomOffset * 60 * 1000);
}

async function checkDailyFatigueCaps(supabase: any, userId: string, notificationType: string, slot?: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Define daily limits per type
    const limits: Record<string, number> = {
      'reminder': 1, // Max 1 per slot per day
      'streak_risk': 1, // Max 1 per day
      'achievement': 5, // More lenient for achievements
      'social': 3, // Moderate for social
      'milestone': 2
    };

    const dailyLimit = limits[notificationType] || 1;

    // Count today's notifications for this type/slot
    let query = supabase
      .from('notification_logs')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
      .eq('notification_type', notificationType)
      .gte('sent_at', `${today}T00:00:00.000Z`)
      .lt('sent_at', `${today}T23:59:59.999Z`);

    if (slot) {
      query = query.eq('slot', slot);
    }

    const { count } = await query;
    return (count || 0) < dailyLimit;
  } catch (error) {
    console.error('Error checking daily fatigue caps:', error);
    return true; // Default to allowing notification on error
  }
}

async function handleSocialTriggers(supabase: any): Promise<void> {
  try {
    console.log('Processing social activity triggers...');
    
    // Get recent friend activities (last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const { data: recentActivities } = await supabase
      .from('friend_activities')
      .select(`
        user_id,
        activity_data,
        created_at,
        users!friend_activities_user_id_fkey(username)
      `)
      .gte('created_at', oneHourAgo.toISOString())
      .limit(100);

    if (!recentActivities || recentActivities.length === 0) {
      console.log('No recent friend activities found');
      return;
    }

    // For each activity, notify their friends
    for (const activity of recentActivities) {
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${activity.user_id},addressee_id.eq.${activity.user_id}`)
        .eq('status', 'accepted');

      if (!friendships) continue;

      // Get friends of the active user
      const friendIds = friendships.map(f => 
        f.requester_id === activity.user_id ? f.addressee_id : f.requester_id
      );

      for (const friendId of friendIds) {
        // Check if friend has social notifications enabled
        const { data: preferences } = await supabase
          .from('user_preferences')
          .select('notification_types')
          .eq('user_id', friendId)
          .single();

        const notificationTypes = preferences?.notification_types || {};
        if (!notificationTypes.social) continue;

        // Check quiet hours and fatigue caps
        const isQuietHours = await checkQuietHours(supabase, friendId, new Date());
        if (isQuietHours) continue;

        const canSend = await checkDailyFatigueCaps(supabase, friendId, 'social');
        if (!canSend) continue;

        // Get message variant
        const variant = await getOrAssignMessageVariant(supabase, friendId, 'social');
        if (!variant) continue;

        // Prepare notification payload
        const friendName = activity.users?.username || 'A friend';
        const title = variant.title_template.replace('{friend_name}', friendName);
        const body = variant.body_template.replace('{friend_name}', friendName);

        // Send notification
        const notificationPayload = {
          userIds: [friendId],
          title,
          body,
          data: {
            type: 'social',
            friend_id: activity.user_id,
            friend_name: friendName,
            activity_type: activity.activity_data?.type || 'workout',
            variant_key: variant.variant_key,
            experiment_key: variant.experiment_key
          },
          actions: [
            { action: 'view_activity', title: 'View Activity' },
            { action: 'start_workout', title: 'Start Workout' }
          ]
        };

        // Call send-push-notification function
        await supabase.functions.invoke('send-push-notification', {
          body: notificationPayload
        });

        console.log(`Social notification sent to user ${friendId} about ${friendName}'s activity`);
      }
    }
  } catch (error) {
    console.error('Error processing social triggers:', error);
  }
}