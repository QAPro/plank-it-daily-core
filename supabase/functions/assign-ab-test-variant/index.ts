import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    const { featureName, userId } = await req.json();

    if (!featureName || !userId) {
      return new Response(
        JSON.stringify({ error: 'Missing featureName or userId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`[assign-ab-test-variant] Assigning variant for feature: ${featureName}, user: ${userId}`);

    // Check if user already has an assignment
    const { data: existingAssignment, error: existingError } = await supabaseClient
      .from('ab_test_assignments')
      .select('variant')
      .eq('feature_name', featureName)
      .eq('user_id', userId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('[assign-ab-test-variant] Error checking existing assignment:', existingError);
      throw existingError;
    }

    if (existingAssignment) {
      console.log(`[assign-ab-test-variant] User already has variant: ${existingAssignment.variant}`);
      return new Response(
        JSON.stringify({ variant: existingAssignment.variant }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get experiment details for this feature
    const { data: experiment, error: expError } = await supabaseClient
      .from('ab_test_experiments')
      .select(`
        id,
        traffic_split,
        status
      `)
      .eq('feature_flag_id', (
        await supabaseClient
          .from('feature_flags')
          .select('id')
          .eq('feature_name', featureName)
          .single()
      ).data?.id)
      .eq('status', 'running')
      .single();

    if (expError || !experiment) {
      // No active experiment, assign control by default
      const variant = 'control';
      
      // Create assignment record
      const { error: insertError } = await supabaseClient
        .from('ab_test_assignments')
        .insert([{
          user_id: userId,
          feature_name: featureName,
          variant,
          assignment_hash: hashString(userId + featureName)
        }]);

      if (insertError) {
        console.error('[assign-ab-test-variant] Error inserting assignment:', insertError);
        throw insertError;
      }

      return new Response(
        JSON.stringify({ variant }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Determine variant based on traffic split and consistent hashing
    const hash = hashString(userId + featureName);
    const hashValue = Math.abs(hash) % 100;
    
    const trafficSplit = experiment.traffic_split as { control: number; variant_a: number };
    const controlPercentage = trafficSplit.control || 50;
    
    const variant = hashValue < controlPercentage ? 'control' : 'variant_a';

    console.log(`[assign-ab-test-variant] Assigned variant: ${variant} (hash: ${hashValue}, control%: ${controlPercentage})`);

    // Create assignment record
    const { error: insertError } = await supabaseClient
      .from('ab_test_assignments')
      .insert([{
        user_id: userId,
        feature_name: featureName,
        variant,
        assignment_hash: hash.toString()
      }]);

    if (insertError) {
      console.error('[assign-ab-test-variant] Error inserting assignment:', insertError);
      throw insertError;
    }

    return new Response(
      JSON.stringify({ variant }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[assign-ab-test-variant] Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Simple hash function for consistent user assignment
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash;
}