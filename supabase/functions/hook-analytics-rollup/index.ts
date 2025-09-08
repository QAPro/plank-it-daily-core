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
    console.log('Starting hook analytics rollup...');
    
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const results = {
      correlations_updated: 0,
      optimizations_applied: 0,
      cleanup_completed: false,
      errors: []
    };

    // 1. Update user success correlations
    console.log('Updating user success correlations...');
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id')
      .limit(100); // Process in batches

    if (usersError) {
      console.error('Failed to fetch users:', usersError);
      results.errors.push(`Failed to fetch users: ${usersError.message}`);
    } else if (users) {
      for (const user of users) {
        try {
          await updateUserCorrelations(supabase, user.id);
          results.correlations_updated++;
        } catch (error) {
          console.error(`Failed to update correlations for user ${user.id}:`, error);
          results.errors.push(`User ${user.id}: ${error.message}`);
        }
      }
    }

    // 2. Apply high-confidence auto-optimizations
    console.log('Applying auto-optimizations...');
    
    const { data: autoOptUsers, error: autoOptError } = await supabase
      .from('user_preferences')
      .select('user_id')
      .eq('auto_optimization_enabled', true)
      .limit(50);

    if (!autoOptError && autoOptUsers) {
      for (const userPref of autoOptUsers) {
        try {
          const applied = await applyAutoOptimization(supabase, userPref.user_id);
          if (applied) results.optimizations_applied++;
        } catch (error) {
          console.error(`Failed to apply optimization for user ${userPref.user_id}:`, error);
          results.errors.push(`Auto-opt ${userPref.user_id}: ${error.message}`);
        }
      }
    }

    // 3. Cleanup old data (optional)
    console.log('Cleaning up old analytics data...');
    
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      // Clean up old friction logs (keep last 30 days)
      const { error: cleanupError } = await supabase
        .from('friction_point_logs')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());
      
      if (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
        results.errors.push(`Cleanup failed: ${cleanupError.message}`);
      } else {
        results.cleanup_completed = true;
      }
    } catch (error) {
      console.error('Cleanup error:', error);
      results.errors.push(`Cleanup error: ${error.message}`);
    }

    console.log('Hook analytics rollup completed:', results);

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in hook-analytics-rollup:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// Update user success correlations based on recent hook cycles
async function updateUserCorrelations(supabase: any, userId: string) {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get recent hook cycles for analysis
  const { data: cycles, error } = await supabase
    .from('hook_cycle_events')
    .select('*')
    .eq('user_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false });

  if (error || !cycles?.length) return;

  // Analyze trigger timing success rates
  const timeCorrelations = analyzeTriggerTiming(cycles);
  
  // Analyze reward effectiveness
  const rewardCorrelations = analyzeRewardEffectiveness(cycles);

  // Update correlations in database
  for (const correlation of [...timeCorrelations, ...rewardCorrelations]) {
    await supabase
      .from('user_success_correlations')
      .upsert({
        user_id: userId,
        correlation_type: correlation.type,
        correlation_key: correlation.key,
        success_rate: correlation.success_rate,
        sample_size: correlation.sample_size,
        confidence_level: correlation.confidence,
        last_updated: new Date().toISOString()
      }, {
        onConflict: 'user_id,correlation_type,correlation_key'
      });
  }
}

// Analyze trigger timing patterns
function analyzeTriggerTiming(cycles: any[]) {
  const timingMap = new Map();
  
  cycles.forEach(cycle => {
    const hour = new Date(cycle.created_at).getUTCHours();
    const key = `hour_${hour}`;
    
    if (!timingMap.has(key)) {
      timingMap.set(key, { successes: 0, total: 0 });
    }
    
    const stats = timingMap.get(key);
    stats.total++;
    if (cycle.action_taken) stats.successes++;
  });

  return Array.from(timingMap.entries()).map(([key, stats]) => ({
    type: 'trigger_timing',
    key,
    success_rate: stats.total > 0 ? stats.successes / stats.total : 0,
    sample_size: stats.total,
    confidence: Math.min(0.95, stats.total / 50) // Higher confidence with more samples
  }));
}

// Analyze reward effectiveness patterns
function analyzeRewardEffectiveness(cycles: any[]) {
  const rewardMap = new Map();
  
  cycles.forEach(cycle => {
    if (!cycle.reward_given) return;
    
    const key = cycle.reward_given;
    if (!rewardMap.has(key)) {
      rewardMap.set(key, { successes: 0, total: 0 });
    }
    
    const stats = rewardMap.get(key);
    stats.total++;
    if (cycle.action_taken) stats.successes++;
  });

  return Array.from(rewardMap.entries()).map(([key, stats]) => ({
    type: 'reward_effectiveness',
    key,
    success_rate: stats.total > 0 ? stats.successes / stats.total : 0,
    sample_size: stats.total,
    confidence: Math.min(0.9, stats.total / 30)
  }));
}

// Apply high-confidence auto-optimizations
async function applyAutoOptimization(supabase: any, userId: string): Promise<boolean> {
  try {
    // Get high-confidence correlations
    const { data: correlations, error } = await supabase
      .from('user_success_correlations')
      .select('*')
      .eq('user_id', userId)
      .gte('confidence_level', 0.8)
      .gte('sample_size', 20)
      .order('success_rate', { ascending: false });

    if (error || !correlations?.length) return false;

    let optimizationApplied = false;

    // Optimize notification timing
    const timingCorrelations = correlations.filter(c => c.correlation_type === 'trigger_timing');
    if (timingCorrelations.length > 0) {
      const bestTiming = timingCorrelations[0];
      const hour = parseInt(bestTiming.correlation_key.replace('hour_', ''));
      
      // Update user's notification schedule
      await supabase
        .from('user_notification_schedules')
        .upsert({
          user_id: userId,
          slot: 'optimized_daily',
          send_time: `${hour.toString().padStart(2, '0')}:00:00`,
          enabled: true
        }, {
          onConflict: 'user_id,slot'
        });

      optimizationApplied = true;
    }

    // Log optimization activity
    if (optimizationApplied) {
      await supabase
        .from('admin_audit_log')
        .insert({
          admin_user_id: null, // System action
          target_user_id: userId,
          action_type: 'auto_optimization_applied',
          action_details: {
            correlations_used: correlations.length,
            optimization_types: ['notification_timing']
          },
          reason: 'Automated optimization based on hook model analytics'
        });
    }

    return optimizationApplied;
  } catch (error) {
    console.error(`Auto-optimization failed for user ${userId}:`, error);
    return false;
  }
}
