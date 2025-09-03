import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationPayload {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  notification_type: string;
  actions?: Array<{
    action: string;
    title: string;
  }>;
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

    const { user_id, user_ids, title, body, data = {}, notification_type, actions = [] }: NotificationPayload = await req.json();

    // Determine target users
    const targetUserIds = user_ids || (user_id ? [user_id] : []);
    
    if (targetUserIds.length === 0) {
      throw new Error('No target users specified');
    }

    console.log(`Sending notification to ${targetUserIds.length} users:`, { title, body, notification_type });

    // Get active push subscriptions for target users
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', targetUserIds)
      .eq('is_active', true);

    if (subscriptionsError) {
      console.error('Error fetching subscriptions:', subscriptionsError);
      throw subscriptionsError;
    }

    if (!subscriptions || subscriptions.length === 0) {
      console.log('No active subscriptions found for target users');
      return new Response(
        JSON.stringify({ success: true, message: 'No active subscriptions found', sent: 0 }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user preferences to check notification settings
    const { data: userPrefs, error: prefsError } = await supabase
      .from('user_preferences')
      .select('user_id, push_notifications_enabled, notification_types, quiet_hours_start, quiet_hours_end, notification_frequency')
      .in('user_id', targetUserIds);

    if (prefsError) {
      console.error('Error fetching user preferences:', prefsError);
    }

    // Filter subscriptions based on user preferences
    const filteredSubscriptions = subscriptions.filter(sub => {
      const userPref = userPrefs?.find(p => p.user_id === sub.user_id);
      
      // Check if push notifications are enabled
      if (userPref?.push_notifications_enabled === false) {
        console.log(`Push notifications disabled for user ${sub.user_id}`);
        return false;
      }

      // Check notification type preferences
      if (userPref?.notification_types) {
        const typeEnabled = userPref.notification_types[notification_type];
        if (typeEnabled === false) {
          console.log(`Notification type ${notification_type} disabled for user ${sub.user_id}`);
          return false;
        }
      }

      // Check quiet hours (simplified - would need proper timezone handling in production)
      const now = new Date();
      const currentHour = now.getHours();
      if (userPref?.quiet_hours_start && userPref?.quiet_hours_end) {
        const startHour = parseInt(userPref.quiet_hours_start.split(':')[0]);
        const endHour = parseInt(userPref.quiet_hours_end.split(':')[0]);
        
        if (startHour > endHour) { // Overnight quiet hours
          if (currentHour >= startHour || currentHour < endHour) {
            console.log(`Quiet hours active for user ${sub.user_id}`);
            return false;
          }
        } else { // Same day quiet hours
          if (currentHour >= startHour && currentHour < endHour) {
            console.log(`Quiet hours active for user ${sub.user_id}`);
            return false;
          }
        }
      }

      return true;
    });

    console.log(`Filtered to ${filteredSubscriptions.length} eligible subscriptions`);

    // Send notifications
    const results = [];
    let successCount = 0;

    for (const subscription of filteredSubscriptions) {
      try {
        const payload = JSON.stringify({
          title,
          body,
          data: {
            ...data,
            notification_type,
            timestamp: new Date().toISOString()
          },
          actions
        });

        const response = await fetch(subscription.endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `key=${Deno.env.get('FCM_SERVER_KEY') || ''}`,
            'Content-Type': 'application/json',
            'TTL': '86400'
          },
          body: payload
        });

        const success = response.ok;
        
        // Log notification attempt
        await supabase
          .from('notification_logs')
          .insert({
            user_id: subscription.user_id,
            notification_type,
            title,
            body,
            data: data,
            delivery_status: success ? 'sent' : 'failed',
            error_message: success ? null : await response.text()
          });

        if (success) {
          successCount++;
        }

        results.push({
          user_id: subscription.user_id,
          success,
          status: response.status
        });

        console.log(`Notification ${success ? 'sent' : 'failed'} to user ${subscription.user_id}`);
        
      } catch (error) {
        console.error(`Error sending notification to user ${subscription.user_id}:`, error);
        
        // Log failed notification
        await supabase
          .from('notification_logs')
          .insert({
            user_id: subscription.user_id,
            notification_type,
            title,
            body,
            data: data,
            delivery_status: 'failed',
            error_message: error.message
          });

        results.push({
          user_id: subscription.user_id,
          success: false,
          error: error.message
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        sent: successCount,
        total: filteredSubscriptions.length,
        results
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in send-push-notification function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        success: false 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});