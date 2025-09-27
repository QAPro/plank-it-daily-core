import { ALL_ACHIEVEMENTS } from '@/services/expandedAchievementService';

export const getAchievementStats = () => {
  const total = ALL_ACHIEVEMENTS.length;
  
  const categoryBreakdown = ALL_ACHIEVEMENTS.reduce((acc, achievement) => {
    acc[achievement.category] = (acc[achievement.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const rarityBreakdown = ALL_ACHIEVEMENTS.reduce((acc, achievement) => {
    acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('🏆 COMPLETE ACHIEVEMENT SYSTEM STATS 🏆');
  console.log(`Total Achievements: ${total}`);
  console.log('Category Breakdown:', categoryBreakdown);
  console.log('Rarity Breakdown:', rarityBreakdown);
  
  // Verify all 6 exercise categories are covered
  const categorySpecificCount = categoryBreakdown['category_specific'] || 0;
  const crossCategoryCount = categoryBreakdown['cross_category'] || 0;
  
  console.log(`\n📊 New Exercise System:`);
  console.log(`- Category-Specific Achievements: ${categorySpecificCount}`);
  console.log(`- Cross-Category Achievements: ${crossCategoryCount}`);
  console.log(`- Expected: 48 category + 37 cross = 85 new achievements`);
  
  return { total, categoryBreakdown, rarityBreakdown };
};