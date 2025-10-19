import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.4';
import { decode, encode, Image } from 'https://deno.land/x/pngs@0.1.1/mod.ts';

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

// Detect background color by sampling entire edge perimeter
function detectBackgroundColor(imageData: Uint8Array, width: number, height: number): { r: number; g: number; b: number } {
  const samples: { r: number; g: number; b: number }[] = [];
  const edgeThickness = 10; // Sample 10 pixels deep from edge

  // Sample top edge
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < edgeThickness; y++) {
      const idx = (y * width + x) * 4;
      samples.push({
        r: imageData[idx],
        g: imageData[idx + 1],
        b: imageData[idx + 2],
      });
    }
  }

  // Sample bottom edge
  for (let x = 0; x < width; x++) {
    for (let y = height - edgeThickness; y < height; y++) {
      const idx = (y * width + x) * 4;
      samples.push({
        r: imageData[idx],
        g: imageData[idx + 1],
        b: imageData[idx + 2],
      });
    }
  }

  // Sample left edge (excluding corners already sampled)
  for (let y = edgeThickness; y < height - edgeThickness; y++) {
    for (let x = 0; x < edgeThickness; x++) {
      const idx = (y * width + x) * 4;
      samples.push({
        r: imageData[idx],
        g: imageData[idx + 1],
        b: imageData[idx + 2],
      });
    }
  }

  // Sample right edge (excluding corners already sampled)
  for (let y = edgeThickness; y < height - edgeThickness; y++) {
    for (let x = width - edgeThickness; x < width; x++) {
      const idx = (y * width + x) * 4;
      samples.push({
        r: imageData[idx],
        g: imageData[idx + 1],
        b: imageData[idx + 2],
      });
    }
  }

  // Group colors into buckets (more aggressive grouping for gradient detection)
  const colorCounts = new Map<string, { count: number; color: { r: number; g: number; b: number } }>();
  for (const sample of samples) {
    // Group colors into 20-unit buckets to handle gradients
    const key = `${Math.round(sample.r / 20) * 20},${Math.round(sample.g / 20) * 20},${Math.round(sample.b / 20) * 20}`;
    const existing = colorCounts.get(key);
    if (existing) {
      existing.count++;
    } else {
      colorCounts.set(key, { count: 1, color: sample });
    }
  }

  // Find most common color family
  let maxCount = 0;
  let bgColor = { r: 255, g: 255, b: 255 };
  for (const [, value] of colorCounts) {
    if (value.count > maxCount) {
      maxCount = value.count;
      bgColor = value.color;
    }
  }

  console.log(`Detected background color: RGB(${bgColor.r}, ${bgColor.g}, ${bgColor.b}) from ${samples.length} edge samples`);
  return bgColor;
}

// Remove background and make transparent with gradient-aware feathering
function removeBackground(
  imageData: Uint8Array,
  width: number,
  height: number,
  bgColor: { r: number; g: number; b: number },
  tolerance: number = 100 // Increased from 30 to handle gradients
): Uint8Array {
  const result = new Uint8Array(imageData);
  let transparentPixels = 0;

  for (let i = 0; i < result.length; i += 4) {
    const r = result[i];
    const g = result[i + 1];
    const b = result[i + 2];

    // Calculate Euclidean color distance
    const distance = Math.sqrt(
      Math.pow(r - bgColor.r, 2) + 
      Math.pow(g - bgColor.g, 2) + 
      Math.pow(b - bgColor.b, 2)
    );

    // Full transparency for close matches
    if (distance < tolerance * 0.7) {
      result[i + 3] = 0; // Fully transparent
      transparentPixels++;
    } 
    // Feathering for edge pixels (gradual transparency)
    else if (distance < tolerance) {
      const alpha = Math.floor(((distance - (tolerance * 0.7)) / (tolerance * 0.3)) * 255);
      result[i + 3] = Math.min(255, alpha);
      transparentPixels++;
    }
    // Keep original alpha for non-background pixels
  }

  console.log(`Made ${transparentPixels} pixels transparent (${((transparentPixels / (result.length / 4)) * 100).toFixed(1)}% of image)`);
  return result;
}

// Fetch real badge file list from storage
async function getBadgeFileList(supabase: any): Promise<string[]> {
  const { data, error } = await supabase.storage
    .from('achievement-badges')
    .list('', {
      limit: 1000,
      sortBy: { column: 'name', order: 'asc' }
    });
    
  if (error) {
    throw new Error(`Failed to list badges: ${error.message}`);
  }
  
  // Filter to only PNG files starting with "badge_" (exclude existing transparent versions)
  return data
    .filter((file: any) => 
      file.name.startsWith('badge_') && 
      file.name.endsWith('.png') &&
      !file.name.includes('_transparent')
    )
    .map((file: any) => file.name);
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

    if (downloadError || !fileData) {
      const errorMsg = downloadError?.message || 
        downloadError?.error || 
        'File not found or inaccessible';
      throw new Error(`Download failed: ${errorMsg}`);
    }

    // Convert to ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    console.log(`Downloaded ${badgeFileName}: ${arrayBuffer.byteLength} bytes`);

    // Decode PNG to get raw image data
    const image = decode(uint8Array);
    if (!image) {
      throw new Error('Failed to decode PNG image');
    }

    const width = image.width;
    const height = image.height;
    console.log(`Image dimensions: ${width}x${height}px`);

    // Get raw RGBA pixel data
    const imageData = new Uint8Array(image.image);
    
    // Detect background color from edges
    const bgColor = detectBackgroundColor(imageData, width, height);
    
    // Remove background with high tolerance for gradients
    const transparentImageData = removeBackground(imageData, width, height, bgColor, 100);
    
    // Create new image with transparent background
    const transparentImage: Image = {
      width,
      height,
      image: transparentImageData,
    };
    
    // Encode back to PNG
    const processedPng = encode(transparentImage);
    
    console.log(`Successfully processed: ${badgeFileName}`);
    
    // Upload processed version with _transparent suffix
    const processedFileName = badgeFileName.replace('.png', '_transparent.png');
    const { error: uploadError } = await supabase.storage
      .from('achievement-badges')
      .upload(processedFileName, processedPng, {
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

// Replace original badge with transparent version
async function replaceBadgeOriginal(
  supabase: any,
  badgeFileName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const transparentFileName = badgeFileName.replace('.png', '_transparent.png');
    
    console.log(`Replacing original: ${badgeFileName} with ${transparentFileName}`);
    
    // 1. Verify transparent version exists
    const { data: transparentFile, error: checkError } = await supabase.storage
      .from('achievement-badges')
      .download(transparentFileName);
    
    if (checkError || !transparentFile) {
      throw new Error(`Transparent version not found: ${transparentFileName}`);
    }
    
    // 2. Download the transparent version
    const arrayBuffer = await transparentFile.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // 3. Upload with original filename (overwrite)
    const { error: uploadError } = await supabase.storage
      .from('achievement-badges')
      .upload(badgeFileName, uint8Array, {
        contentType: 'image/png',
        upsert: true, // This overwrites the original
      });
    
    if (uploadError) {
      throw new Error(`Failed to replace original: ${uploadError.message}`);
    }
    
    // 4. Delete the _transparent version (cleanup)
    const { error: deleteError } = await supabase.storage
      .from('achievement-badges')
      .remove([transparentFileName]);
    
    if (deleteError) {
      console.warn(`Warning: Could not delete ${transparentFileName}:`, deleteError);
      // Don't fail the operation, just log the warning
    }
    
    console.log(`Successfully replaced: ${badgeFileName}`);
    return { success: true };
  } catch (error) {
    console.error(`Error replacing ${badgeFileName}:`, error);
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

    // Fetch real badge list from storage
    const allBadges = await getBadgeFileList(supabase);
    console.log(`Found ${allBadges.length} badges in storage`);

    let badgesToProcess: string[] = [];

    if (requestData.action === 'test') {
      // Test with first 10 real badges from storage
      badgesToProcess = allBadges.slice(0, 10);
    } else if (requestData.action === 'process_all') {
      // Process all badges
      badgesToProcess = allBadges;
    } else if (requestData.action === 'replace_originals') {
      // Get list of badges that have _transparent versions
      const { data: storageFiles, error: listError } = await supabase.storage
        .from('achievement-badges')
        .list('', { limit: 1000 });
      
      if (listError) {
        throw new Error(`Failed to list storage: ${listError.message}`);
      }
      
      // Find badges that have _transparent versions ready
      const transparentFiles = storageFiles
        .filter((f: any) => f.name.includes('_transparent.png'))
        .map((f: any) => f.name.replace('_transparent.png', '.png'));
      
      badgesToProcess = transparentFiles;
      console.log(`Found ${badgesToProcess.length} badges with transparent versions ready to replace`);
      
      // Use replaceBadgeOriginal instead of processBadge
      const results: ProcessingResult = {
        success: true,
        processed: 0,
        total: badgesToProcess.length,
        errors: [],
        badges: [],
      };
      
      for (let i = 0; i < badgesToProcess.length; i++) {
        const badge = badgesToProcess[i];
        const result = await replaceBadgeOriginal(supabase, badge);
        
        if (result.success) {
          results.processed++;
          results.badges.push({
            original: badge,
            processed: badge,
            status: 'replaced',
          });
        } else {
          results.errors.push(`${badge}: ${result.error}`);
          results.badges.push({
            original: badge,
            processed: '',
            status: 'error',
          });
        }
      }
      
      results.success = results.errors.length === 0;
      
      return new Response(
        JSON.stringify(results),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
