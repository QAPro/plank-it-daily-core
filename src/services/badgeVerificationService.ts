/**
 * Badge Verification Service
 * Cross-references achievement definitions with uploaded badge assets
 */

import { supabase } from '@/integrations/supabase/client';
import { DatabaseAchievementService } from './databaseAchievementService';

export interface BadgeVerificationReport {
  // ... keep existing code
}

export interface BadgeVerificationReport {
  totalAchievements: number;
  totalBadgesInStorage: number;
  missingBadges: Array<{
    achievementId: string;
    achievementName: string;
    expectedBadgeFile: string;
  }>;
  extraBadges: string[];
  validationErrors: Array<{
    achievementId: string;
    error: string;
  }>;
  isValid: boolean;
}

/**
 * Verify all badge assets are uploaded and match achievement definitions
 */
export const verifyBadgeAssets = async (): Promise<BadgeVerificationReport> => {
  const service = new DatabaseAchievementService('');
  const allAchievements = await service.getAllAchievements();
  
  const report: BadgeVerificationReport = {
    totalAchievements: allAchievements.length,
    totalBadgesInStorage: 0,
    missingBadges: [],
    extraBadges: [],
    validationErrors: [],
    isValid: true
  };

  try {
    // Get list of all files in the achievement-badges bucket
    const { data: files, error } = await supabase.storage
      .from('achievement-badges')
      .list('', {
        limit: 500,
        sortBy: { column: 'name', order: 'asc' }
      });

    if (error) {
      report.validationErrors.push({
        achievementId: 'SYSTEM',
        error: `Failed to list badges in storage: ${error.message}`
      });
      report.isValid = false;
      return report;
    }

    report.totalBadgesInStorage = files?.length || 0;

    // Create a Set of uploaded badge file names
    const uploadedBadges = new Set(files?.map(f => f.name) || []);

    // Create a Set of required badge file names from achievements
    const requiredBadges = new Set(
      allAchievements.map(a => a.badge_file_name)
    );

    // Find missing badges (in achievements but not uploaded)
    allAchievements.forEach(achievement => {
      if (!uploadedBadges.has(achievement.badge_file_name)) {
        report.missingBadges.push({
          achievementId: achievement.id,
          achievementName: achievement.name,
          expectedBadgeFile: achievement.badge_file_name
        });
      }
    });

    // Find extra badges (uploaded but not in achievements)
    uploadedBadges.forEach(badgeFile => {
      if (!requiredBadges.has(badgeFile)) {
        report.extraBadges.push(badgeFile);
      }
    });

    // Validate achievement data integrity
    allAchievements.forEach(achievement => {
      // Check for required fields
      if (!achievement.id || !achievement.name) {
        report.validationErrors.push({
          achievementId: achievement.id || 'UNKNOWN',
          error: 'Missing required fields (id or name)'
        });
      }

      // Check badge file name format
      if (!achievement.badge_file_name.endsWith('.png')) {
        report.validationErrors.push({
          achievementId: achievement.id,
          error: `Badge file should be PNG: ${achievement.badge_file_name}`
        });
      }

      // Check points match rarity
      const rarityPointRanges = {
        common: { min: 10, max: 50 },
        uncommon: { min: 50, max: 200 },
        rare: { min: 100, max: 500 },
        epic: { min: 300, max: 2000 }
      };

      const range = rarityPointRanges[achievement.rarity];
      if (range && (achievement.points < range.min || achievement.points > range.max)) {
        report.validationErrors.push({
          achievementId: achievement.id,
          error: `Points (${achievement.points}) outside expected range for ${achievement.rarity} rarity (${range.min}-${range.max})`
        });
      }
    });

    // Set overall validity
    report.isValid = report.missingBadges.length === 0 && report.validationErrors.length === 0;

  } catch (error) {
    report.validationErrors.push({
      achievementId: 'SYSTEM',
      error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    });
    report.isValid = false;
  }

  return report;
};

/**
 * Get a summary string of the verification report
 */
export const getVerificationSummary = (report: BadgeVerificationReport): string => {
  const lines = [
    `🏆 Badge Verification Report`,
    `━━━━━━━━━━━━━━━━━━━━━━━━`,
    `Total Achievements: ${report.totalAchievements}`,
    `Total Badges in Storage: ${report.totalBadgesInStorage}`,
    ``,
    `✓ Valid: ${report.isValid ? 'YES' : 'NO'}`,
    ``,
  ];

  if (report.missingBadges.length > 0) {
    lines.push(`❌ Missing Badges (${report.missingBadges.length}):`);
    report.missingBadges.forEach(mb => {
      lines.push(`  - ${mb.achievementId}: ${mb.expectedBadgeFile}`);
    });
    lines.push('');
  }

  if (report.extraBadges.length > 0) {
    lines.push(`⚠️  Extra Badges (${report.extraBadges.length}):`);
    report.extraBadges.forEach(eb => {
      lines.push(`  - ${eb}`);
    });
    lines.push('');
  }

  if (report.validationErrors.length > 0) {
    lines.push(`⚠️  Validation Errors (${report.validationErrors.length}):`);
    report.validationErrors.forEach(ve => {
      lines.push(`  - ${ve.achievementId}: ${ve.error}`);
    });
    lines.push('');
  }

  if (report.isValid && report.extraBadges.length === 0) {
    lines.push(`✨ Perfect! All badges match achievement definitions.`);
  }

  return lines.join('\n');
};
