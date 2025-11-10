import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface MessageTemplate {
  title: string;
  body: string;
}

const reEngagementTemplates = {
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
};

function getRandomTemplate(templates: MessageTemplate[]): MessageTemplate {
  return templates[Math.floor(Math.random() * templates.length)];
}

function personalizeMessage(template: MessageTemplate, firstName?: string): MessageTemplate {
  let title = template.title;
  let body = template.body;

  if (firstName) {
    title = title.replace(/{firstName}/g, firstName);
    body = body.replace(/{firstName}/g, firstName);
  }

  return { title, body };
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
    console.log('Starting re-engagement notification scheduler...');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const now = new Date();
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Get all users who have had at least one session
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select('id');

    if (usersError || !allUsers?.length) {
      console.log('No users found or error fetching users:', usersError);
      return new Response(JSON.stringify({ success: true, sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let sentCount = 0;
    const userIds = allUsers.map(u => u.id);

    // Batch process users
    for (let i = 0; i < userIds.length; i += 100) {
      const batchIds = userIds.slice(i, i + 100);

      // Get last session for each user in batch
      const { data: lastSessions } = await supabase
        .from('user_sessions')
        .select('user_id, completed_at')
        .in('user_id', batchIds)
        .order('completed_at', { ascending: false });

      // Create map of user_id to last session date
      const lastSessionMap = new Map<string, Date>();
      if (lastSessions) {
        for (const session of lastSessions) {
          if (!lastSessionMap.has(session.user_id)) {
            lastSessionMap.set(session.user_id, new Date(session.completed_at));
          }
        }
      }

      // Get user preferences for this batch
      const { data: preferencesList } = await supabase
        .from('user_preferences')
        .select('user_id, push_notifications_enabled, notification_types')
        .in('user_id', batchIds);

      const prefsMap = new Map(preferencesList?.map(p => [p.user_id, p]) || []);

      // Process each user in batch
      for (const userId of batchIds) {
        try {
          const prefs = prefsMap.get(userId);
          
          // Skip if notifications disabled
          if (!prefs?.push_notifications_enabled || prefs?.notification_types?.re_engagement === false) {
            continue;
          }

          const lastSessionDate = lastSessionMap.get(userId);
          
          // Skip if never had a session or too old (>60 days)
          if (!lastSessionDate || lastSessionDate < sixtyDaysAgo) {
            continue;
          }

          // Calculate days since last session
          const daysSinceLastSession = Math.floor((now.getTime() - lastSessionDate.getTime()) / (1000 * 60 * 60 * 24));

          // Determine which template to use based on inactivity
          let templateKey: '3_days' | '7_days' | '14_days' | '30_days' | null = null;
          let checkSince: Date | null = null;

          if (daysSinceLastSession >= 30) {
            templateKey = '30_days';
            checkSince = thirtyDaysAgo;
          } else if (daysSinceLastSession >= 14) {
            templateKey = '14_days';
            checkSince = fourteenDaysAgo;
          } else if (daysSinceLastSession >= 7) {
            templateKey = '7_days';
            checkSince = sevenDaysAgo;
          } else if (daysSinceLastSession >= 3) {
            templateKey = '3_days';
            checkSince = threeDaysAgo;
          }

          // Skip if not in any re-engagement window
          if (!templateKey || !checkSince) {
            continue;
          }

          // Check if already sent re-engagement notification for this period
          const { data: recentNotif } = await supabase
            .from('notification_logs')
            .select('id')
            .eq('user_id', userId)
            .eq('notification_type', 're_engagement')
            .gte('sent_at', checkSince.toISOString())
            .limit(1);

          if (recentNotif?.length) {
            continue;
          }

          // Get user's first name
          const firstName = await getUserFirstName(supabase, userId);

          // Select and personalize message
          const template = getRandomTemplate(reEngagementTemplates[templateKey]);
          const message = personalizeMessage(template, firstName);

          // Send notification
          const { error: sendError } = await supabase.functions.invoke('send-push-notification', {
            body: {
              user_id: userId,
              title: message.title,
              body: message.body,
              first_name: firstName,
              notification_type: 're_engagement',
              data: {
                type: 're_engagement',
                days_inactive: daysSinceLastSession,
                template_key: templateKey
              }
            }
          });

          if (sendError) {
            console.error(`Failed to send re-engagement to user ${userId}:`, sendError);
          } else {
            sentCount++;
            console.log(`Sent ${templateKey} re-engagement notification to user ${userId}`);
          }

        } catch (error) {
          console.error(`Error processing user ${userId}:`, error);
        }
      }
    }

    console.log(`Re-engagement scheduler completed. Sent ${sentCount} notifications.`);

    return new Response(
      JSON.stringify({ success: true, sent: sentCount }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in schedule-re-engagement-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
