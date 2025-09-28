import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PendingExecution {
  schedule_id: string;
  feature_name: string;
  target_percentage: number;
  step_index: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting rollout schedule execution...');

    // Get pending rollout executions
    const { data: pendingExecutions, error: fetchError } = await supabase.rpc('get_pending_rollout_executions');
    
    if (fetchError) {
      console.error('Error fetching pending executions:', fetchError);
      throw fetchError;
    }

    if (!pendingExecutions || pendingExecutions.length === 0) {
      console.log('No pending rollout executions found');
      return new Response(
        JSON.stringify({ message: 'No pending executions', executedCount: 0 }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    console.log(`Found ${pendingExecutions.length} pending executions`);

    let executedCount = 0;
    const errors: string[] = [];

    // Execute each pending rollout step
    for (const execution of pendingExecutions as PendingExecution[]) {
      try {
        console.log(`Executing rollout for ${execution.feature_name}: ${execution.target_percentage}%`);

        // Update the feature flag rollout percentage
        const { error: updateError } = await supabase
          .from('feature_flags')
          .update({ 
            rollout_percentage: execution.target_percentage,
            updated_at: new Date().toISOString()
          })
          .eq('feature_name', execution.feature_name);

        if (updateError) {
          console.error(`Error updating feature flag ${execution.feature_name}:`, updateError);
          errors.push(`Failed to update ${execution.feature_name}: ${updateError.message}`);
          continue;
        }

        // Mark the rollout step as executed
        const { error: executeError } = await supabase.rpc('execute_rollout_step', {
          _schedule_id: execution.schedule_id,
          _step_index: execution.step_index
        });

        if (executeError) {
          console.error(`Error marking step as executed:`, executeError);
          errors.push(`Failed to mark step as executed for ${execution.feature_name}: ${executeError.message}`);
          continue;
        }

        console.log(`Successfully executed rollout step for ${execution.feature_name}`);
        executedCount++;

      } catch (stepError) {
        console.error(`Error executing rollout step:`, stepError);
        const errorMessage = stepError instanceof Error ? stepError.message : String(stepError);
        errors.push(`Unexpected error for ${execution.feature_name}: ${errorMessage}`);
      }
    }

    const response = {
      message: `Executed ${executedCount} rollout steps`,
      executedCount,
      totalPending: pendingExecutions.length,
      errors: errors.length > 0 ? errors : undefined
    };

    console.log('Rollout execution completed:', response);

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Fatal error in rollout execution:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        message: errorMessage 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});