/**
 * Database Badge Verification Utility
 * Verifies all badges in database match uploaded assets
 */

import { supabase } from '@/integrations/supabase/client';
import { verifyBadgeExists } from '@/utils/badgeAssets';

interface BadgeVerificationResult {
  achievementId: string;
  achievementName: string;
  badgeFileName: string;
  exists: boolean;
  category: string;
  rarity: string;
}

export const verifyAllDatabaseBadges = async (): Promise<{
  total: number;
  found: number;
  missing: BadgeVerificationResult[];
  results: BadgeVerificationResult[];
}> => {
  console.log('🔍 Starting badge verification...');

  // Fetch all achievements from database
  const { data: achievements, error } = await supabase
    .from('achievements')
    .select('id, name, badge_file_name, category, rarity')
    .order('id');

  if (error) {
    console.error('❌ Error fetching achievements:', error);
    throw error;
  }

  if (!achievements || achievements.length === 0) {
    console.warn('⚠️ No achievements found in database');
    return { total: 0, found: 0, missing: [], results: [] };
  }

  console.log(`📊 Checking ${achievements.length} achievements...`);

  // Verify each badge exists
  const results = await Promise.all(
    achievements.map(async (ach) => {
      const exists = await verifyBadgeExists(ach.badge_file_name);
      return {
        achievementId: ach.id,
        achievementName: ach.name,
        badgeFileName: ach.badge_file_name,
        exists,
        category: ach.category,
        rarity: ach.rarity,
      };
    })
  );

  const missing = results.filter(r => !r.exists);
  const found = results.filter(r => r.exists).length;

  // Log detailed results
  console.log(`\n✅ ${found} badges found`);
  console.log(`❌ ${missing.length} badges missing`);

  if (missing.length > 0) {
    console.log('\n📋 Missing Badges:');
    missing.forEach(m => {
      console.log(`  - ${m.achievementId}: ${m.badgeFileName}`);
      console.log(`    Name: ${m.achievementName}`);
      console.log(`    Category: ${m.category} | Rarity: ${m.rarity}`);
    });
  }

  // Group by category
  const byCategory = results.reduce((acc, r) => {
    if (!acc[r.category]) acc[r.category] = [];
    acc[r.category].push(r);
    return acc;
  }, {} as Record<string, BadgeVerificationResult[]>);

  console.log('\n📊 Breakdown by Category:');
  Object.entries(byCategory).forEach(([category, items]) => {
    const categoryFound = items.filter(i => i.exists).length;
    console.log(`  ${category}: ${categoryFound}/${items.length}`);
  });

  return {
    total: achievements.length,
    found,
    missing,
    results,
  };
};

/**
 * Quick verification function for browser console
 */
export const quickVerifyBadges = async () => {
  const result = await verifyAllDatabaseBadges();
  
  if (result.missing.length === 0) {
    console.log('🎉 Perfect! All badges verified successfully!');
  } else {
    console.error(`⚠️ ${result.missing.length} badges need attention`);
  }
  
  return result;
};

/**
 * Verify badges for a specific category
 */
export const verifyBadgesByCategory = async (
  category: 'Milestones' | 'Consistency' | 'Momentum' | 'Performance' | 'Social' | 'Special'
) => {
  console.log(`🔍 Verifying badges for category: ${category}...`);

  const { data: achievements, error } = await supabase
    .from('achievements')
    .select('id, name, badge_file_name, category, rarity')
    .eq('category', category)
    .order('id');

  if (error) {
    console.error('❌ Error fetching achievements:', error);
    throw error;
  }

  if (!achievements || achievements.length === 0) {
    console.warn(`⚠️ No achievements found in category: ${category}`);
    return { total: 0, found: 0, missing: [], results: [] };
  }

  const results = await Promise.all(
    achievements.map(async (ach) => {
      const exists = await verifyBadgeExists(ach.badge_file_name);
      return {
        achievementId: ach.id,
        achievementName: ach.name,
        badgeFileName: ach.badge_file_name,
        exists,
        category: ach.category,
        rarity: ach.rarity,
      };
    })
  );

  const missing = results.filter(r => !r.exists);
  const found = results.filter(r => r.exists).length;

  console.log(`\n✅ ${found}/${achievements.length} badges found in ${category}`);
  
  if (missing.length > 0) {
    console.log(`❌ Missing badges in ${category}:`);
    missing.forEach(m => console.log(`  - ${m.achievementId}: ${m.badgeFileName}`));
  }

  return {
    total: achievements.length,
    found,
    missing,
    results,
  };
};
