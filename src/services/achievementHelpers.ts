/**
 * Achievement Helper Utilities
 * Provides filtering and validation for the achievement system
 */

import { ACHIEVEMENT_DEFINITIONS, type Achievement } from './achievementDefinitions';

/**
 * Get all active (non-disabled) achievements
 */
export const getActiveAchievements = (): Achievement[] => {
  return ACHIEVEMENT_DEFINITIONS.filter(ach => !ach.isDisabled);
};

/**
 * Get all disabled achievements with reasons
 */
export const getDisabledAchievements = (): Achievement[] => {
  return ACHIEVEMENT_DEFINITIONS.filter(ach => ach.isDisabled);
};

/**
 * Get achievement by ID
 */
export const getAchievementById = (id: string): Achievement | undefined => {
  return ACHIEVEMENT_DEFINITIONS.find(ach => ach.id === id);
};

/**
 * Check if achievement is available for user
 * (not disabled and meets premium requirements)
 */
export const isAchievementAvailable = (
  achievement: Achievement,
  userIsPremium: boolean = false
): boolean => {
  // Disabled achievements are never available
  if (achievement.isDisabled) {
    return false;
  }
  
  // Premium achievements only available to premium users
  if (achievement.isPremium && !userIsPremium) {
    return false;
  }
  
  return true;
};

/**
 * Get achievements filtered by criteria type
 */
export const getAchievementsByCriteriaType = (
  criteriaType: string
): Achievement[] => {
  return ACHIEVEMENT_DEFINITIONS.filter(
    ach => ach.unlockCriteria?.type === criteriaType && !ach.isDisabled
  );
};

/**
 * Validate achievement system integrity
 * Returns report of any issues found
 */
export const validateAchievementSystem = () => {
  const report = {
    totalAchievements: ACHIEVEMENT_DEFINITIONS.length,
    activeAchievements: getActiveAchievements().length,
    disabledAchievements: getDisabledAchievements().length,
    premiumAchievements: ACHIEVEMENT_DEFINITIONS.filter(a => a.isPremium).length,
    secretAchievements: ACHIEVEMENT_DEFINITIONS.filter(a => a.isSecret).length,
    achievementsWithCriteria: ACHIEVEMENT_DEFINITIONS.filter(a => a.unlockCriteria).length,
    issues: [] as string[],
  };

  // Check for duplicate IDs
  const ids = ACHIEVEMENT_DEFINITIONS.map(a => a.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length > 0) {
    report.issues.push(`Duplicate IDs found: ${duplicates.join(', ')}`);
  }

  // Check for missing badge files
  const missingBadges = ACHIEVEMENT_DEFINITIONS.filter(
    a => !a.badgeFileName || a.badgeFileName.trim() === ''
  );
  if (missingBadges.length > 0) {
    report.issues.push(
      `${missingBadges.length} achievements missing badge file names`
    );
  }

  return report;
};
