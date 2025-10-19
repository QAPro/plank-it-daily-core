/**
 * Badge Background Removal Script
 * Automatically removes colored square backgrounds from badge PNGs
 * Preserves the circular badge artwork with transparency
 */

import sharp from 'sharp';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const SUPABASE_URL = "https://kgwmplptoctmoaefnpfg.supabase.co";
const BUCKET_NAME = "achievement-badges";
const OUTPUT_DIR = join(__dirname, '../output/processed-badges');
const LOG_FILE = join(__dirname, '../output/processing-log.txt');

// Test batch: 10 diverse badges including the 4 examples shown
const TEST_BADGES = [
  // User's 4 examples
  'badge_cardio_century_epic.png',
  'badge_cardio_marathon_rare.png',
  'badge_cardio_marathon_streak_rare.png',
  'badge_cardio_streak_master_uncommon.png',
  // Additional diverse examples
  'badge_milestones_first_steps_common.png',
  'badge_social_friend_request_accepted_common.png',
  'badge_strength_personal_best_uncommon.png',
  'badge_yoga_zen_master_rare.png',
  'badge_challenges_weekly_warrior_uncommon.png',
  'badge_discoveries_hidden_gem_epic.png'
];

// Color distance calculation (Euclidean distance in RGB space)
function colorDistance(color1, color2) {
  const rDiff = color1.r - color2.r;
  const gDiff = color1.g - color2.g;
  const bDiff = color1.b - color2.b;
  return Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
}

// Sample pixels from corners to detect background color
function detectBackgroundColor(buffer, width, height, channels) {
  const samples = [];
  const sampleSize = 5; // Sample 5x5 pixels from each corner
  
  // Sample all four corners
  const corners = [
    { x: 0, y: 0 }, // Top-left
    { x: width - sampleSize, y: 0 }, // Top-right
    { x: 0, y: height - sampleSize }, // Bottom-left
    { x: width - sampleSize, y: height - sampleSize } // Bottom-right
  ];
  
  corners.forEach(corner => {
    for (let y = 0; y < sampleSize; y++) {
      for (let x = 0; x < sampleSize; x++) {
        const px = corner.x + x;
        const py = corner.y + y;
        const idx = (py * width + px) * channels;
        
        samples.push({
          r: buffer[idx],
          g: buffer[idx + 1],
          b: buffer[idx + 2]
        });
      }
    }
  });
  
  // Find most common color (mode)
  const colorCounts = new Map();
  samples.forEach(sample => {
    const key = `${sample.r},${sample.g},${sample.b}`;
    colorCounts.set(key, (colorCounts.get(key) || 0) + 1);
  });
  
  let maxCount = 0;
  let bgColor = { r: 255, g: 255, b: 255 };
  
  colorCounts.forEach((count, key) => {
    if (count > maxCount) {
      maxCount = count;
      const [r, g, b] = key.split(',').map(Number);
      bgColor = { r, g, b };
    }
  });
  
  return bgColor;
}

// Remove background and create transparency
async function removeBadgeBackground(badgeFileName) {
  const inputUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${badgeFileName}`;
  const outputPath = join(OUTPUT_DIR, badgeFileName);
  
  console.log(`\n📥 Processing: ${badgeFileName}`);
  console.log(`   Downloading from: ${inputUrl}`);
  
  try {
    // Download image
    const response = await fetch(inputUrl);
    if (!response.ok) {
      throw new Error(`Failed to download: ${response.status} ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Load image with sharp
    const image = sharp(buffer);
    const metadata = await image.metadata();
    const { width, height, channels } = metadata;
    
    console.log(`   Dimensions: ${width}x${height}, Channels: ${channels}`);
    
    // Get raw pixel data
    const rawBuffer = await image.raw().toBuffer();
    
    // Detect background color
    const bgColor = detectBackgroundColor(rawBuffer, width, height, channels);
    console.log(`   Detected background: RGB(${bgColor.r}, ${bgColor.g}, ${bgColor.b})`);
    
    // Create new buffer with alpha channel
    const newBuffer = Buffer.alloc(width * height * 4);
    const tolerance = 30; // Color tolerance for background removal
    
    for (let i = 0; i < width * height; i++) {
      const srcIdx = i * channels;
      const dstIdx = i * 4;
      
      const r = rawBuffer[srcIdx];
      const g = rawBuffer[srcIdx + 1];
      const b = rawBuffer[srcIdx + 2];
      
      // Calculate distance from background color
      const distance = colorDistance({ r, g, b }, bgColor);
      
      // Copy RGB values
      newBuffer[dstIdx] = r;
      newBuffer[dstIdx + 1] = g;
      newBuffer[dstIdx + 2] = b;
      
      // Set alpha based on distance from background color
      if (distance < tolerance) {
        // Make background transparent
        newBuffer[dstIdx + 3] = 0;
      } else {
        // Keep original pixel fully opaque
        newBuffer[dstIdx + 3] = 255;
      }
    }
    
    // Create output image with transparency
    await sharp(newBuffer, {
      raw: {
        width,
        height,
        channels: 4
      }
    })
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
    
    console.log(`   ✅ Success: Saved to ${outputPath}`);
    
    return {
      success: true,
      fileName: badgeFileName,
      bgColor,
      outputPath
    };
    
  } catch (error) {
    console.error(`   ❌ Error: ${error.message}`);
    return {
      success: false,
      fileName: badgeFileName,
      error: error.message
    };
  }
}

// Main execution
async function main() {
  console.log('🎨 Badge Background Removal Script');
  console.log('===================================\n');
  
  // Create output directory
  if (!existsSync(OUTPUT_DIR)) {
    mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log(`📁 Created output directory: ${OUTPUT_DIR}\n`);
  }
  
  const mode = process.argv[2] || '--test';
  let badgesToProcess = [];
  
  if (mode === '--test') {
    console.log('🧪 Running in TEST mode (10 badges)\n');
    badgesToProcess = TEST_BADGES;
  } else if (mode === '--all') {
    console.log('⚠️  Full batch mode not yet implemented');
    console.log('   Run with --test first to validate the approach\n');
    process.exit(1);
  } else {
    console.log('Usage: node remove-badge-backgrounds.js [--test|--all]');
    process.exit(1);
  }
  
  console.log(`Processing ${badgesToProcess.length} badges...\n`);
  
  const results = [];
  let successCount = 0;
  let failureCount = 0;
  
  // Process each badge sequentially
  for (const badge of badgesToProcess) {
    const result = await removeBadgeBackground(badge);
    results.push(result);
    
    if (result.success) {
      successCount++;
    } else {
      failureCount++;
    }
    
    // Small delay to avoid overwhelming the server
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  // Generate summary report
  console.log('\n\n📊 Processing Summary');
  console.log('====================');
  console.log(`Total: ${badgesToProcess.length}`);
  console.log(`✅ Success: ${successCount}`);
  console.log(`❌ Failed: ${failureCount}`);
  console.log(`\n📁 Output directory: ${OUTPUT_DIR}`);
  
  // Write detailed log
  const logContent = [
    'Badge Background Removal Log',
    '============================',
    `Date: ${new Date().toISOString()}`,
    `Mode: ${mode}`,
    `Total: ${badgesToProcess.length}`,
    `Success: ${successCount}`,
    `Failed: ${failureCount}`,
    '\nDetailed Results:',
    '----------------',
    ...results.map(r => {
      if (r.success) {
        return `✅ ${r.fileName}\n   Background: RGB(${r.bgColor.r}, ${r.bgColor.g}, ${r.bgColor.b})\n   Output: ${r.outputPath}`;
      } else {
        return `❌ ${r.fileName}\n   Error: ${r.error}`;
      }
    })
  ].join('\n');
  
  writeFileSync(LOG_FILE, logContent);
  console.log(`📝 Detailed log saved to: ${LOG_FILE}`);
  
  console.log('\n✨ Done! Please review the processed badges in the output directory.');
  console.log('   Compare them with the originals to ensure quality.');
  console.log('   If satisfied, we can proceed with the full batch.\n');
}

main().catch(console.error);
