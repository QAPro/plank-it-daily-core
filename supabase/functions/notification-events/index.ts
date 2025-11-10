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
  send_time: string;
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

// Message Templates (copied from src/config/notificationMessages.ts)
interface MessageTemplate {
  title: string;
  body: string;
}

const messageTemplates = {
  workout_reminder: {
    morning: [
      { title: '🌅 Rise & Shine!', body: 'Morning {firstName}! Start your day with strength.' },
      { title: '☀️ Good Morning!', body: 'A quick plank to energize your morning, {firstName}?' },
      { title: '🌄 New Day, New Strength', body: '{firstName}, let\'s make this morning count!' }
    ],
    afternoon: [
      { title: '☀️ Midday Power', body: '{firstName}, perfect time for a strength boost!' },
      { title: '⚡ Afternoon Energy', body: 'Quick workout break, {firstName}?' },
      { title: '💪 Power Through', body: '{firstName}, recharge with a quick session!' }
    ],
    evening: [
      { title: '🌆 Evening Strength', body: '{firstName}, end your day strong!' },
      { title: '🌙 Wind Down Strong', body: 'Evening workout time, {firstName}!' },
      { title: '✨ Nighttime Power', body: '{firstName}, close out the day with strength!' }
    ]
  },
  streak_protection: [
    { title: '🔥 Streak Alert!', body: '{firstName}, your {streakDays}-day streak needs you!' },
    { title: '⚡ Don\'t Break It!', body: 'Quick session to save your streak, {firstName}?' },
    { title: '🎯 Streak on the Line', body: '{firstName}, {streakDays} days strong - keep it alive!' }
  ],
  achievement: [
    { title: '🎉 Achievement Unlocked!', body: 'Congrats {firstName}! You earned: {achievementName}' },
    { title: '⭐ New Badge!', body: '{firstName}, you\'ve unlocked {achievementName}!' },
    { title: '🏆 You Did It!', body: 'Amazing work {firstName}! {achievementName} is yours!' }
  ],
  milestone: [
    { title: '🎯 Milestone Reached!', body: '{firstName}, you hit {milestone}!' },
    { title: '⚡ New Record!', body: 'Incredible {firstName}! {milestone} achieved!' },
    { title: '💫 Progress Made!', body: '{firstName}, celebrate {milestone}!' }
  ],
  social: [
    { title: '👋 Friend Activity', body: '{friendName} just completed a workout, {firstName}!' },
    { title: '🤝 Social Update', body: '{firstName}, {friendName} {activityType}' }
  ],
  re_engagement: {
    '3_days': [
      { title: '👋 We Miss You!', body: '{firstName}, it\'s been 3 days. Ready to come back?' },
      { title: '💪 Quick Check-in', body: '{firstName}, a quick session today?' }
    ],
    '7_days': [
      { title: '🌟 Welcome Back?', body: '{firstName}, it\'s been a week. Let\'s restart!' },
      { title: '✨ Fresh Start', body: '{firstName}, ready to jump back in?' }
    ],
    '14_days': [
      { title: '💫 Miss Your Progress', body: '{firstName}, 2 weeks away. Let\'s reconnect!' },
      { title: '🎯 Come Back Strong', body: '{firstName}, your comeback starts now!' }
    ],
    '30_days': [
      { title: '🌈 New Beginning', body: '{firstName}, it\'s been a month. Start fresh today!' },
      { title: '⚡ Reset & Restart', body: '{firstName}, every journey begins again. Ready?' }
    ]
  }
};

function getRandomTemplate(templates: MessageTemplate[]): MessageTemplate {
  return templates[Math.floor(Math.random() * templates.length)];
}

function personalizeMessage(
  template: MessageTemplate,
  context: { 
    firstName?: string;
    streakDays?: number;
    achievementName?: string;
    milestone?: string;
    friendName?: string;
    activityType?: string;
  }
): MessageTemplate {
  let title = template.title;
  let body = template.body;

  if (context.firstName) {
    title = title.replace(/{firstName}/g, context.firstName);
    body = body.replace(/{firstName}/g, context.firstName);
  }
  if (context.streakDays !== undefined) {
    title = title.replace(/{streakDays}/g, context.streakDays.toString());
    body = body.replace(/{streakDays}/g, context.streakDays.toString());
  }
  if (context.achievementName) {
    title = title.replace(/{achievementName}/g, context.achievementName);
    body = body.replace(/{achievementName}/g, context.achievementName);
  }
  if (context.milestone) {
    title = title.replace(/{milestone}/g, context.milestone);
    body = body.replace(/{milestone}/g, context.milestone);
  }
  if (context.friendName) {
    title = title.replace(/{friendName}/g, context.friendName);
    body = body.replace(/{friendName}/g, context.friendName);
  }
  if (context.activityType) {
    title = title.replace(/{activityType}/g, context.activityType);
    body = body.replace(/{activityType}/g, context.activityType);
  }

  return { title, body };
}

function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  return 'evening';
}

async function getUserFirstName(supabase: any, userId: string): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('first_name')
      .eq('id', userId)
      .single();

    if (error || !data?.first_name) {
      return '';
    }

    return data.first_name;
  } catch (error) {
    console.error('Error fetching user first name:', error);
    return '';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Authentication required', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const payload: EventPayload = await req.json();
    console.log('Notification event received:', payload);

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

async function handleEnhancedEventNotification(supabase: any, payload: EventPayload) {
  try {
    console.log('Processing enhanced event notification:', payload);
    
    const { type, user_id, data = {} } = payload;
    
    if (!type || !user_id) {
      throw new Error('Missing required fields: type or user_id');
    }

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

    const isQuietHours = await checkQuietHours(supabase, user_id, new Date());
    if (isQuietHours) {
      console.log(`Skipping notification for user ${user_id} - quiet hours`);
      return;
    }

    const canSend = await checkDailyFatigueCaps(supabase, user_id, notificationCategory);
    if (!canSend) {
      console.log(`Skipping notification for user ${user_id} - daily limit reached`);
      return;
    }

    const firstName = await getUserFirstName(supabase, user_id);
    const variant = await getOrAssignMessageVariant(supabase, user_id, notificationCategory);
    
    if (!variant) {
      console.log(`No message variant found for category: ${notificationCategory}`);
      await handleBasicEventNotification(supabase, payload, firstName);
      return;
    }

    let title = variant.title_template || variant.content?.title || 'Notification';
    let body = variant.body_template || variant.content?.body || 'You have a new notification';
    
    if (type === 'achievement_unlocked' && data.achievement) {
      title = title.replace('{achievement_name}', data.achievement.name || 'New Achievement');
      body = body.replace('{achievement_name}', data.achievement.name || 'New Achievement');
    } else if (type === 'streak_milestone' && data.streak_days) {
      title = title.replace('{streak_days}', data.streak_days.toString());
      body = body.replace('{streak_days}', data.streak_days.toString());
    }

    const notificationPayload = {
      userIds: [user_id],
      title,
      body,
      first_name: firstName,
      data: {
        type,
        variant_id: variant.id,
        variant_key: variant.variant_key,
        experiment_key: variant.experiment_key,
        ...data
      },
      actions: variant.content?.actions || []
    };

    const { error } = await supabase.functions.invoke('send-push-notification', {
      body: notificationPayload
    });

    if (error) {
      console.error('Failed to send enhanced notification:', error);
    } else {
      console.log(`Enhanced ${type} notification sent to user ${user_id}`);
    }

  } catch (error) {
    console.error('Error in handleEnhancedEventNotification:', error);
    const firstName = await getUserFirstName(supabase, payload.user_id);
    await handleBasicEventNotification(supabase, payload, firstName);
  }
}

async function handleBasicEventNotification(supabase: any, payload: EventPayload, firstName?: string) {
  let title = '';
  let body = '';
  let notification_type = '';
  let data = {};

  switch (payload.type) {
    case 'achievement_unlocked':
      const achievementTemplate = getRandomTemplate(messageTemplates.achievement);
      const achievementMsg = personalizeMessage(achievementTemplate, {
        firstName,
        achievementName: payload.achievement?.name
      });
      title = achievementMsg.title;
      body = achievementMsg.body;
      notification_type = 'achievements';
      data = { achievement: payload.achievement };
      break;

    case 'streak_milestone':
      const streakTemplate = getRandomTemplate(messageTemplates.streak_protection);
      const streakMsg = personalizeMessage(streakTemplate, {
        firstName,
        streakDays: payload.streak_days
      });
      title = streakMsg.title;
      body = streakMsg.body;
      notification_type = 'streaks';
      data = { streak_days: payload.streak_days };
      break;

    case 'session_completed':
      const milestoneTemplate = getRandomTemplate(messageTemplates.milestone);
      const milestoneMsg = personalizeMessage(milestoneTemplate, {
        firstName,
        milestone: `${Math.round((payload.session?.duration_seconds || 0) / 60)}-minute session`
      });
      title = milestoneMsg.title;
      body = milestoneMsg.body;
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
      first_name: firstName,
      notification_type,
      data
    }
  });

  console.log(`Sent basic ${payload.type} notification to user ${payload.user_id}`);
}

async function handleEnhancedDailyReminders(supabase: any) {
  console.log('Processing enhanced daily workout reminders...');

  const nowUtc = new Date();

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

  const userIds = Array.from(new Set(schedules.map((s) => s.user_id)));
  const { data: prefsList, error: prefsErr } = await supabase
    .from('user_preferences')
    .select('user_id, push_notifications_enabled, notification_types, time_zone');

  if (prefsErr) {
    console.error('Error fetching user preferences:', prefsErr);
    return;
  }

  const prefMap = new Map<string, any>(prefsList?.map((p: any) => [p.user_id, p]) || []);

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

      if (diff > 15) continue;

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

      const firstName = await getUserFirstName(supabase, sched.user_id);
      const variant = await getOrAssignMessageVariant(supabase, sched.user_id, 'daily_reminder', sched.slot);

      if (variant) {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: sched.user_id,
            title: variant.content.title,
            body: variant.content.body,
            first_name: firstName,
            notification_type: 'reminders',
            data: { ...variant.content.data, slot: sched.slot, variant_id: variant.id },
          },
        });
      } else {
        const timeOfDay = getTimeOfDay();
        const template = getRandomTemplate(messageTemplates.workout_reminder[timeOfDay]);
        const message = personalizeMessage(template, { firstName });
        
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: sched.user_id,
            title: message.title,
            body: message.body,
            first_name: firstName,
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
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('push_notifications_enabled, notification_types')
        .eq('user_id', user.user_id)
        .single();

      if (!prefs?.push_notifications_enabled || prefs?.notification_types?.streaks === false) {
        continue;
      }

      const { data: recentAlert } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('user_id', user.user_id)
        .eq('notification_type', 'streaks')
        .gte('sent_at', new Date().toISOString().split('T')[0])
        .limit(1);

      if (recentAlert?.length) continue;

      const firstName = await getUserFirstName(supabase, user.user_id);
      const variant = await getOrAssignMessageVariant(supabase, user.user_id, 'streak_risk');

      if (variant) {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: user.user_id,
            title: variant.content.title,
            body: variant.content.body.replace('{streak}', user.current_streak),
            first_name: firstName,
            notification_type: 'streaks',
            data: { 
              ...variant.content.data,
              current_streak: user.current_streak,
              variant_id: variant.id
            }
          }
        });
      } else {
        const template = getRandomTemplate(messageTemplates.streak_protection);
        const message = personalizeMessage(template, {
          firstName,
          streakDays: user.current_streak
        });
        
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: user.user_id,
            title: message.title,
            body: message.body,
            first_name: firstName,
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

async function handleEnhancedWeeklySummary(supabase: any) {
  console.log('Processing enhanced weekly progress summaries...');
  
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  
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

  const userStats = weeklyStats.reduce((acc, session) => {
    if (!acc[session.user_id]) {
      acc[session.user_id] = { sessions: 0, totalDuration: 0 };
    }
    acc[session.user_id].sessions++;
    acc[session.user_id].totalDuration += session.duration_seconds || 0;
    return acc;
  }, {} as Record<string, { sessions: number; totalDuration: number }>);

  const sessionCounts = Object.values(userStats).map(s => s.sessions).sort((a, b) => b - a);

  for (const [userId, stats] of Object.entries(userStats)) {
    try {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('push_notifications_enabled, notification_types')
        .eq('user_id', userId)
        .single();

      if (!prefs?.push_notifications_enabled || prefs?.notification_types?.milestones === false) {
        continue;
      }

      const sessionPercentile = Math.round((sessionCounts.filter(s => s <= stats.sessions).length / sessionCounts.length) * 100);
      const firstName = await getUserFirstName(supabase, userId);
      const variant = await getOrAssignMessageVariant(supabase, userId, 'weekly_summary');
      const totalMinutes = Math.round(stats.totalDuration / 60);

      if (variant) {
        let body = variant.content.body
          .replace('{sessions}', stats.sessions.toString())
          .replace('{minutes}', totalMinutes.toString())
          .replace('{percentile}', sessionPercentile.toString());

        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: userId,
            title: variant.content.title,
            body,
            first_name: firstName,
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
        const template = getRandomTemplate(messageTemplates.milestone);
        const message = personalizeMessage(template, {
          firstName,
          milestone: `${stats.sessions} workouts, ${totalMinutes} minutes`
        });
        
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: userId,
            title: message.title,
            body: message.body,
            first_name: firstName,
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

async function handleEnhancedReengagement(supabase: any) {
  console.log('Processing enhanced re-engagement campaigns...');
  
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const fourteenDaysAgo = new Date();
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

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

  const userSegments = inactiveUsers.reduce((acc, session) => {
    const lastActivity = new Date(session.completed_at);
    const daysInactive = Math.floor((sevenDaysAgo.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
    
    let segment = 'short_term';
    if (daysInactive >= 14) segment = 'medium_term';
    if (daysInactive >= 30) segment = 'long_term';

    if (!acc[session.user_id]) {
      acc[session.user_id] = { segment, lastActivity, totalSessions: 0 };
    }
    acc[session.user_id].totalSessions++;
    
    return acc;
  }, {} as Record<string, { segment: string; lastActivity: Date; totalSessions: number }>);

  for (const [userId, userData] of Object.entries(userSegments)) {
    try {
      const { data: prefs } = await supabase
        .from('user_preferences')
        .select('push_notifications_enabled, notification_types')
        .eq('user_id', userId)
        .single();

      if (!prefs?.push_notifications_enabled || prefs?.notification_types?.reminders === false) {
        continue;
      }

      const { data: recentReengagement } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('user_id', userId)
        .eq('notification_type', 'reminders')
        .like('body', '%miss%')
        .gte('sent_at', sevenDaysAgo.toISOString())
        .limit(1);

      if (recentReengagement?.length) continue;

      const firstName = await getUserFirstName(supabase, userId);
      const variant = await getOrAssignMessageVariant(supabase, userId, 'reengagement', userData.segment);

      if (variant) {
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: userId,
            title: variant.content.title,
            body: variant.content.body,
            first_name: firstName,
            notification_type: 'reminders',
            data: { 
              ...variant.content.data,
              segment: userData.segment,
              variant_id: variant.id
            }
          }
        });
      } else {
        const daysInactive = Math.floor((new Date().getTime() - userData.lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        let templateKey = '7_days';
        if (daysInactive >= 30) templateKey = '30_days';
        else if (daysInactive >= 14) templateKey = '14_days';
        else if (daysInactive >= 3) templateKey = '3_days';

        const template = getRandomTemplate(messageTemplates.re_engagement[templateKey]);
        const message = personalizeMessage(template, { firstName });
        
        await supabase.functions.invoke('send-push-notification', {
          body: {
            user_id: userId,
            title: message.title,
            body: message.body,
            first_name: firstName,
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

async function getOrAssignMessageVariant(
  supabase: any, 
  userId: string, 
  category: string, 
  slot?: string
): Promise<any> {
  try {
    const { data: existingAssignment } = await supabase
      .from('user_notification_variant_assignments')
      .select('variant_id, assignment_hash')
      .eq('user_id', userId)
      .eq('category', category)
      .eq('slot', slot || '')
      .single();

    if (existingAssignment) {
      const { data: variant } = await supabase
        .from('notification_message_variants')
        .select('*')
        .eq('id', existingAssignment.variant_id)
        .single();
      
      return variant;
    }

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

    const totalWeight = variants.reduce((sum, v) => sum + (v.weight || 1), 0);
    const randomNum = Math.random() * totalWeight;
    let currentWeight = 0;
    
    let selectedVariant = variants[0];
    for (const variant of variants) {
      currentWeight += (variant.weight || 1);
      if (randomNum <= currentWeight) {
        selectedVariant = variant;
        break;
      }
    }
    
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

function getNotificationTypeFromEvent(eventType: string): string {
  const typeMap: Record<string, string> = {
    'achievement_unlocked': 'achievements',
    'streak_milestone': 'streaks',
    'session_completed': 'milestones'
  };
  
  return typeMap[eventType] || 'milestones';
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
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

    const userTime = new Date(currentTime.toLocaleString("en-US", { timeZone: time_zone || 'UTC' }));
    const currentHour = userTime.getHours();
    const currentMinute = userTime.getMinutes();
    const currentTotalMinutes = currentHour * 60 + currentMinute;

    const [startHour, startMinute] = quiet_hours_start.split(':').map(Number);
    const [endHour, endMinute] = quiet_hours_end.split(':').map(Number);
    const startTotalMinutes = startHour * 60 + startMinute;
    const endTotalMinutes = endHour * 60 + endMinute;

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

async function checkDailyFatigueCaps(supabase: any, userId: string, notificationType: string, slot?: string): Promise<boolean> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const limits: Record<string, number> = {
      'reminder': 1,
      'streak_risk': 1,
      'achievement': 5,
      'social': 3,
      'milestone': 2
    };

    const dailyLimit = limits[notificationType] || 1;

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
    return true;
  }
}

async function handleSocialTriggers(supabase: any): Promise<void> {
  try {
    console.log('Processing social activity triggers...');
    
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

    for (const activity of recentActivities) {
      const { data: friendships } = await supabase
        .from('friendships')
        .select('requester_id, addressee_id')
        .or(`requester_id.eq.${activity.user_id},addressee_id.eq.${activity.user_id}`)
        .eq('status', 'accepted');

      if (!friendships) continue;

      const friendIds = friendships.map((f: any) => 
        f.requester_id === activity.user_id ? f.addressee_id : f.requester_id
      );

      for (const friendId of friendIds) {
        try {
          const { data: prefs } = await supabase
            .from('user_preferences')
            .select('push_notifications_enabled, notification_types')
            .eq('user_id', friendId)
            .single();

          if (!prefs?.push_notifications_enabled || prefs?.notification_types?.social === false) {
            continue;
          }

          const { data: recent } = await supabase
            .from('notification_logs')
            .select('id')
            .eq('user_id', friendId)
            .eq('notification_type', 'social')
            .gte('sent_at', oneHourAgo.toISOString())
            .limit(3);

          if (recent && recent.length >= 3) continue;

          const firstName = await getUserFirstName(supabase, friendId);
          const friendName = activity.users?.username || 'Your friend';
          
          const template = getRandomTemplate(messageTemplates.social);
          const message = personalizeMessage(template, {
            firstName,
            friendName,
            activityType: 'completed a workout'
          });

          await supabase.functions.invoke('send-push-notification', {
            body: {
              user_id: friendId,
              title: message.title,
              body: message.body,
              first_name: firstName,
              notification_type: 'social',
              data: {
                type: 'friend_activity',
                friend_id: activity.user_id,
                friend_name: friendName
              }
            }
          });

          console.log(`Sent social notification to user ${friendId}`);
        } catch (error) {
          console.error(`Error sending social notification to ${friendId}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error in handleSocialTriggers:', error);
  }
}
