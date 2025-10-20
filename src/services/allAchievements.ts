/**
 * Complete Achievement Definitions - All 346 Achievements
 * Re-exports from the main achievement definitions file
 */

import { ACHIEVEMENT_DEFINITIONS, type Achievement as AchievementType } from './achievementDefinitions';

// Export all achievements
export const ALL_ACHIEVEMENTS = ACHIEVEMENT_DEFINITIONS;

// Export types
export type Achievement = AchievementType;
export type NewAchievement = AchievementType;

// For backward compatibility
export const NEW_ACHIEVEMENT_DEFINITIONS = ACHIEVEMENT_DEFINITIONS;

console.log(`✅ Loaded ${ALL_ACHIEVEMENTS.length} achievement definitions`);
