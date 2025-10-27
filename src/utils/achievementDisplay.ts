/**
 * Utility functions for achievement display styling
 * 
 * @deprecated These rarity-based functions are deprecated. 
 * Use category-based styling from categoryGradients.ts instead.
 * These functions should not be used in user-facing components.
 */

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export const getRarityColor = (rarity: AchievementRarity): string => {
  const colors = {
    common: 'text-gray-600 bg-gray-100 border-gray-200',
    uncommon: 'text-green-600 bg-green-100 border-green-200',
    rare: 'text-blue-600 bg-blue-100 border-blue-200',
    epic: 'text-purple-600 bg-purple-100 border-purple-200',
    legendary: 'text-yellow-600 bg-yellow-100 border-yellow-200'
  };
  return colors[rarity];
};

export const getRarityGlow = (rarity: AchievementRarity): string => {
  const glows = {
    common: '',
    uncommon: 'shadow-green-200/50',
    rare: 'shadow-blue-200/50', 
    epic: 'shadow-purple-200/50',
    legendary: 'shadow-yellow-200/50 shadow-lg'
  };
  return glows[rarity];
};
