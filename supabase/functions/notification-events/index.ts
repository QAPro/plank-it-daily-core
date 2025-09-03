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
          await handleDailyReminders(supabase);
          break;
        case 'streak_risk':
          await handleStreakRiskAlerts(supabase);
          break;
        case 'weekly_summary':
          await handleWeeklySummary(supabase);
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
      await handleEventNotification(supabase, payload);
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

async function handleEventNotification(supabase: any, payload: EventPayload) {
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

  // Send notification via existing edge function
  await supabase.functions.invoke('send-push-notification', {
    body: {
      user_id: payload.user_id,
      title,
      body,
      notification_type,
      data
    }
  });

  console.log(`Sent ${payload.type} notification to user ${payload.user_id}`);
}

async function handleDailyReminders(supabase: any) {
  console.log('Processing daily workout reminders...');
  
  // Get current UTC time
  const now = new Date();
  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();
  
  // Find users whose reminder time matches current time (within 5-minute window)
  const { data: users, error } = await supabase
    .from('user_preferences')
    .select(`
      user_id,
      reminder_time,
      workout_reminders,
      push_notifications_enabled,
      notification_types,
      quiet_hours_start,
      quiet_hours_end
    `)
    .eq('workout_reminders', true)
    .eq('push_notifications_enabled', true);

  if (error) {
    console.error('Error fetching user preferences:', error);
    return;
  }

  if (!users || users.length === 0) {
    console.log('No users found with reminders enabled');
    return;
  }

  for (const user of users) {
    try {
      // Parse reminder time (stored as HH:MM:SS)
      const [reminderHour, reminderMinute] = (user.reminder_time || '09:00:00').split(':').map(Number);
      
      // Check if it's time for this user's reminder (within 5-minute window)
      const timeDiff = Math.abs((currentHour * 60 + currentMinute) - (reminderHour * 60 + reminderMinute));
      if (timeDiff > 5) continue;

      // Check if reminders are enabled in notification types
      if (user.notification_types?.reminders === false) continue;

      // Check if we already sent a reminder today
      const { data: recentReminder } = await supabase
        .from('notification_logs')
        .select('id')
        .eq('user_id', user.user_id)
        .eq('notification_type', 'reminders')
        .gte('sent_at', new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString())
        .limit(1);

      if (recentReminder && recentReminder.length > 0) continue;

      // Send reminder notification
      await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: user.user_id,
          title: '⏰ Workout Reminder',
          body: "It's time for your daily workout! Let's keep that streak going!",
          notification_type: 'reminders',
          data: { type: 'daily_reminder' }
        }
      });

      console.log(`Sent daily reminder to user ${user.user_id}`);
      
    } catch (error) {
      console.error(`Error sending reminder to user ${user.user_id}:`, error);
    }
  }
}

async function handleStreakRiskAlerts(supabase: any) {
  console.log('Processing streak risk alerts...');
  
  // Find users who haven't worked out today and have an active streak
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const { data: atRiskUsers, error } = await supabase
    .from('user_streaks')
    .select(`
      user_id,
      current_streak,
      last_workout_date
    `)
    .gt('current_streak', 0)
    .or(`last_workout_date.is.null,last_workout_date.lt.${today}`);

  if (error) {
    console.error('Error fetching streak data:', error);
    return;
  }

  if (!atRiskUsers || atRiskUsers.length === 0) {
    console.log('No users at streak risk found');
    return;
  }

  for (const user of atRiskUsers) {
    try {
      // Check if user has streak notification preferences enabled
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

      if (recentAlert && recentAlert.length > 0) continue;

      // Send streak risk notification
      await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: user.user_id,
          title: '🔥 Don\'t Break Your Streak!',
          body: `You have a ${user.current_streak}-day streak. Complete a quick workout to keep it alive!`,
          notification_type: 'streaks',
          data: { 
            type: 'streak_risk',
            current_streak: user.current_streak 
          }
        }
      });

      console.log(`Sent streak risk alert to user ${user.user_id}`);
      
    } catch (error) {
      console.error(`Error sending streak alert to user ${user.user_id}:`, error);
    }
  }
}

async function handleWeeklySummary(supabase: any) {
  console.log('Processing weekly progress summaries...');
  
  // Get start and end of current week
  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  // Get users who had activity this week
  const { data: weeklyStats, error } = await supabase
    .from('user_sessions')
    .select(`
      user_id,
      duration_seconds,
      completed_at
    `)
    .gte('completed_at', weekStart.toISOString())
    .lt('completed_at', weekEnd.toISOString());

  if (error) {
    console.error('Error fetching weekly stats:', error);
    return;
  }

  if (!weeklyStats || weeklyStats.length === 0) {
    console.log('No weekly activity found');
    return;
  }

  // Group by user
  const userStats = weeklyStats.reduce((acc, session) => {
    if (!acc[session.user_id]) {
      acc[session.user_id] = { sessions: 0, totalDuration: 0 };
    }
    acc[session.user_id].sessions++;
    acc[session.user_id].totalDuration += session.duration_seconds || 0;
    return acc;
  }, {} as Record<string, { sessions: number; totalDuration: number }>);

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

      const totalMinutes = Math.round(stats.totalDuration / 60);
      
      // Send weekly summary
      await supabase.functions.invoke('send-push-notification', {
        body: {
          user_id: userId,
          title: '📊 Weekly Progress Summary',
          body: `This week: ${stats.sessions} workouts, ${totalMinutes} minutes total. Great job!`,
          notification_type: 'milestones',
          data: { 
            type: 'weekly_summary',
            sessions: stats.sessions,
            totalMinutes 
          }
        }
      });

      console.log(`Sent weekly summary to user ${userId}`);
      
    } catch (error) {
      console.error(`Error sending weekly summary to user ${userId}:`, error);
    }
  }
}