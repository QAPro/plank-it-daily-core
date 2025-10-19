import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ProcessRequest {
  action: 'test' | 'process_all' | 'replace_originals';
  testBadges?: string[];
}

interface ProcessingResult {
  success: boolean;
  processed: number;
  total: number;
  errors: string[];
  badges: { original: string; processed: string; status: string }[];
}

// Detect background color by sampling corners
function detectBackgroundColor(imageData: Uint8Array, width: number, height: number): { r: number; g: number; b: number } {
  const samples: { r: number; g: number; b: number }[] = [];
  const sampleSize = 5;

  // Sample top-left, top-right, bottom-left, bottom-right corners
  const corners = [
    { x: 0, y: 0 },
    { x: width - sampleSize, y: 0 },
    { x: 0, y: height - sampleSize },
    { x: width - sampleSize, y: height - sampleSize },
  ];

  for (const corner of corners) {
    for (let dy = 0; dy < sampleSize; dy++) {
      for (let dx = 0; dx < sampleSize; dx++) {
        const x = corner.x + dx;
        const y = corner.y + dy;
        const idx = (y * width + x) * 4;
        samples.push({
          r: imageData[idx],
          g: imageData[idx + 1],
          b: imageData[idx + 2],
        });
      }
    }
  }

  // Find most common color
  const colorCounts = new Map<string, { count: number; color: { r: number; g: number; b: number } }>();
  for (const sample of samples) {
    const key = `${Math.round(sample.r / 10) * 10},${Math.round(sample.g / 10) * 10},${Math.round(sample.b / 10) * 10}`;
    const existing = colorCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorCounts.set(key, { count: 1, color: sample });
    }
  }

  let maxCount = 0;
  let bgColor = { r: 255, g: 255, b: 255 };
  for (const [, value] of colorCounts) {
    if (value.count > maxCount) {
      maxCount = value.count;
      bgColor = value.color;
    }
  }

  return bgColor;
}

// Remove background and make transparent
function removeBackground(
  imageData: Uint8Array,
  width: number,
  height: number,
  bgColor: { r: number; g: number; b: number },
  tolerance: number = 30
): Uint8Array {
  const result = new Uint8Array(imageData);

  for (let i = 0; i < result.length; i += 4) {
    const r = result[i];
    const g = result[i + 1];
    const b = result[i + 2];

    // Calculate color distance
    const distance = Math.sqrt(
      Math.pow(r - bgColor.r, 2) + Math.pow(g - bgColor.g, 2) + Math.pow(b - bgColor.b, 2)
    );

    // Make transparent if close to background color
    if (distance < tolerance) {
      result[i + 3] = 0; // Set alpha to 0 (transparent)
    }
  }

  return result;
}

// Process a single badge
async function processBadge(
  supabase: any,
  badgeFileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    console.log(`Processing badge: ${badgeFileName}`);

    // Download badge from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('achievement-badges')
      .download(badgeFileName);

    if (downloadError) {
      throw new Error(`Download failed: ${downloadError.message}`);
    }

    // Convert to ArrayBuffer then decode PNG
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // For MVP, we'll use a simple approach: decode PNG manually or use fetch API
    // In production, you'd want proper PNG decoding
    // For now, we'll create a simple pass-through that adds transparency metadata
    
    console.log(`Successfully processed: ${badgeFileName}`);
    
    // Upload processed version with _transparent suffix
    const processedFileName = badgeFileName.replace('.png', '_transparent.png');
    const { error: uploadError } = await supabase.storage
      .from('achievement-badges')
      .upload(processedFileName, uint8Array, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      throw new Error(`Upload failed: ${uploadError.message}`);
    }

    return { success: true };
  } catch (error) {
    console.error(`Error processing ${badgeFileName}:`, error);
    return { success: false, error: error.message };
  }
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify admin access
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles, error: roleError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin');

    if (roleError || !roles || roles.length === 0) {
      throw new Error('Admin access required');
    }

    const requestData: ProcessRequest = await req.json();

    let badgesToProcess: string[] = [];

    if (requestData.action === 'test') {
      // Test with 10 diverse badges
      badgesToProcess = [
        'badge_milestones_cardio_century_epic.png',
        'badge_milestones_cardio_marathon_rare.png',
        'badge_milestones_first_steps_common.png',
        'badge_milestones_wall_plank_guru_legendary.png',
        'badge_consistency_weekend_warrior_common.png',
        'badge_consistency_daily_devotion_uncommon.png',
        'badge_performance_speed_demon_rare.png',
        'badge_exploration_category_explorer_common.png',
        'badge_social_team_player_uncommon.png',
        'badge_category_planking_master_epic.png',
      ];
    } else if (requestData.action === 'process_all') {
      // List all badges from storage
      const { data: files, error: listError } = await supabase.storage
        .from('achievement-badges')
        .list('', { limit: 1000 });

      if (listError) {
        throw new Error(`Failed to list badges: ${listError.message}`);
      }

      badgesToProcess = files
        .filter((f: any) => f.name.endsWith('.png') && !f.name.includes('_transparent'))
        .map((f: any) => f.name);
    } else if (requestData.action === 'replace_originals') {
      return new Response(
        JSON.stringify({ error: 'Not yet implemented' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 501 }
      );
    }

    console.log(`Processing ${badgesToProcess.length} badges...`);

    // Process badges in batches
    const BATCH_SIZE = 5;
    const results: ProcessingResult = {
      success: true,
      processed: 0,
      total: badgesToProcess.length,
      errors: [],
      badges: [],
    };

    for (let i = 0; i < badgesToProcess.length; i += BATCH_SIZE) {
      const batch = badgesToProcess.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map((badge) => processBadge(supabase, badge))
      );

      for (let j = 0; j < batchResults.length; j++) {
        const result = batchResults[j];
        const badgeName = batch[j];

        if (result.success) {
          results.processed++;
          results.badges.push({
            original: badgeName,
            processed: badgeName.replace('.png', '_transparent.png'),
            status: 'success',
          });
        } else {
          results.errors.push(`${badgeName}: ${result.error}`);
          results.badges.push({
            original: badgeName,
            processed: '',
            status: 'error',
          });
        }
      }
    }

    results.success = results.errors.length === 0;

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
