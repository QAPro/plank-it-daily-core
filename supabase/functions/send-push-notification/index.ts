import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Web Push utility functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map(char => char.charCodeAt(0)));
}

async function sendWebPushNotification(
  subscription: any,
  payload: string,
  vapidPublicKey: string,
  vapidPrivateKey: string
): Promise<Response> {
  // Validate/prepare VAPID keys
  const publicKeyBytes = urlBase64ToUint8Array(vapidPublicKey);
  if (publicKeyBytes.length !== 65 || publicKeyBytes[0] !== 0x04) {
    throw new Error(`Invalid VAPID public key: expected 65 bytes uncompressed (starts with 0x04), got ${publicKeyBytes.length}`);
  }

  // Extract x and y coordinates from public key (65 bytes: 0x04 + 32-byte X + 32-byte Y)
  const x = publicKeyBytes.slice(1, 33);
  const y = publicKeyBytes.slice(33, 65);
  
  // Convert to base64url format for JWK
  const toBase64Url = (buffer: Uint8Array) => 
    btoa(String.fromCharCode(...buffer)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  // Build complete EC JWK with x, y coordinates and private scalar d
  const jwkPrivate: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    d: vapidPrivateKey, // base64url 32-byte scalar
    x: toBase64Url(x),  // base64url X coordinate
    y: toBase64Url(y),  // base64url Y coordinate
  };

  let cryptoKey: CryptoKey;
  try {
    cryptoKey = await crypto.subtle.importKey(
      'jwk',
      jwkPrivate,
      { name: 'ECDSA', namedCurve: 'P-256' },
      false,
      ['sign']
    );
  } catch (e) {
    console.error('[VAPID] Failed to import private key as JWK', e);
    throw new Error('VAPID private key is invalid. Ensure it is the 32-byte base64url "d" value from a P-256 key.');
  }

  // Create JWT header and payload for VAPID
  const header = { typ: 'JWT', alg: 'ES256' };
  const jwtPayload = {
    aud: new URL(subscription.endpoint).origin,
    exp: Math.floor(Date.now() / 1000) + 12 * 60 * 60, // 12 hours
    sub: 'mailto:support@plankcoach.com',
  };

  const toB64Url = (input: string) => btoa(input).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  const encodedHeader = toB64Url(JSON.stringify(header));
  const encodedPayload = toB64Url(JSON.stringify(jwtPayload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  // Sign JWT with ECDSA P-256
  const signature = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' },
    cryptoKey,
    new TextEncoder().encode(unsignedToken)
  );
  const encodedSignature = toB64Url(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${encodedSignature}`;

  // Send the push notification (note: some endpoints require encrypted payloads)
  const response = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `vapid t=${jwt}, k=${vapidPublicKey}`,
      'Content-Type': 'application/octet-stream',
      'TTL': '86400',
    },
    body: payload,
  });

  return response;
}

interface NotificationPayload {
  user_id?: string;
  user_ids?: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  notification_type: string;
  first_name?: string;
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
    // Security: Verify JWT token is present (authenticated request)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Push notification rejected: Missing or invalid Authorization header');
      return new Response(
        JSON.stringify({ error: 'Authentication required', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client with user's JWT for authentication
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.log('Push notification rejected: Invalid user token');
      return new Response(
        JSON.stringify({ error: 'Invalid authentication token', success: false }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin/superadmin for multi-user notifications
    const { data: userRoles, error: rolesError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = userRoles?.some(r => r.role === 'admin' || r.role === 'superadmin') || false;

    const { user_id, user_ids, title, body, data = {}, notification_type, actions = [] }: NotificationPayload = await req.json();

    // Determine target users
    const targetUserIds = user_ids || (user_id ? [user_id] : []);
    
    if (targetUserIds.length === 0) {
      throw new Error('No target users specified');
    }

    // Authorization: Non-admins can only send to themselves
    if (!isAdmin && targetUserIds.some(id => id !== user.id)) {
      console.log(`Push notification rejected: User ${user.id} tried to send to other users without admin privileges`);
      return new Response(
        JSON.stringify({ error: 'Insufficient privileges to send notifications to other users', success: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Rate limiting: Check recent notification sends by this user
    const rateLimitWindow = 2 * 60 * 1000; // 2 minutes in milliseconds
    const maxNotifications = 3; // Max 3 notifications per 2 minutes
    
    // Use service role for reliable rate limit checks
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: recentNotifications, error: rateLimitError } = await adminClient
      .from('notification_logs')
      .select('created_at')
      .eq('sender_user_id', user.id)
      .gte('created_at', new Date(Date.now() - rateLimitWindow).toISOString());

    if (rateLimitError) {
      console.error('Error checking rate limit:', rateLimitError);
    } else if (recentNotifications && recentNotifications.length >= maxNotifications) {
      console.log(`Push notification rejected: Rate limit exceeded for user ${user.id}`);
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before sending more notifications.', success: false }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Sending notification from user ${user.id} to ${targetUserIds.length} users:`, { title, body, notification_type });

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

    // Get VAPID keys
    const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
    const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error('VAPID keys not configured');
    }

    // Send notifications
    const results = [];
    let successCount = 0;

    // Initialize Supabase client with service role for logging
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    for (const subscription of filteredSubscriptions) {
      try {
        const payload = JSON.stringify({
          title,
          body,
          data: {
            ...data,
            notification_type,
            user_id: subscription.user_id, // Include user_id for interaction tracking
            timestamp: new Date().toISOString()
          },
          actions
        });

        // For test notifications, use empty payload to avoid encryption requirements
        const isTestNotification = notification_type === 'test';
        const payloadToSend = isTestNotification ? '' : payload;

        const response = await sendWebPushNotification(
          subscription,
          payloadToSend,
          vapidPublicKey,
          vapidPrivateKey
        );

        const success = response.ok;
        const responseText = success ? 'OK' : await response.text();
        
        // Log notification attempt with sender info
        await supabaseServiceRole
          .from('notification_logs')
          .insert({
            user_id: subscription.user_id,
            sender_user_id: user.id,
            notification_type,
            title,
            body,
            data: data,
            delivery_status: success ? 'sent' : 'failed',
            error_message: success ? null : responseText
          });

        if (success) {
          successCount++;
        }

        results.push({
          user_id: subscription.user_id,
          success,
          status: response.status,
          error: success ? undefined : responseText
        });

        console.log(`Notification ${success ? 'sent' : 'failed'} to user ${subscription.user_id}`);
        
      } catch (error) {
        console.error(`Error sending notification to user ${subscription.user_id}:`, error);
        
        // Log failed notification with sender info
        await supabaseServiceRole
          .from('notification_logs')
          .insert({
            user_id: subscription.user_id,
            sender_user_id: user.id,
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
})