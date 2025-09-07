import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { notification_type, category, action, data = {} } = await req.json();

    console.log('Logging notification interaction:', { notification_type, category, action });

    // We can't directly get the user ID from service worker context,
    // so we'll extract it from the notification data if available
    const userId = data.user_id || data.userId || null;

    if (!userId) {
      console.log('No user ID available in notification data, skipping interaction log');
      return new Response(
        JSON.stringify({ success: true, message: 'No user ID available' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Insert interaction record
    const { error } = await supabase
      .from('notification_interactions')
      .insert({
        user_id: userId,
        notification_type,
        category,
        action,
        data: data
      });

    if (error) {
      console.error('Error logging notification interaction:', error);
      throw error;
    }

    console.log('Notification interaction logged successfully');

    return new Response(
      JSON.stringify({ success: true, message: 'Interaction logged' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in log-notification-interaction function:', error);
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