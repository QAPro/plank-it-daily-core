import { DatabaseAchievementService } from '@/services/databaseAchievementService';

export const getAchievementStats = async () => {
  const service = new DatabaseAchievementService('');
  const allAchievements = await service.getAllAchievements();
  const total = allAchievements.length;
  
  const categoryBreakdown = allAchievements.reduce((acc, achievement) => {
    acc[achievement.category] = (acc[achievement.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const rarityBreakdown = allAchievements.reduce((acc, achievement) => {
    acc[achievement.rarity] = (acc[achievement.rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  console.log('🏆 COMPLETE ACHIEVEMENT SYSTEM STATS 🏆');
  console.log(`Total Achievements: ${total}`);
  console.log('Category Breakdown:', categoryBreakdown);
  console.log('Rarity Breakdown:', rarityBreakdown);
  
  return { total, categoryBreakdown, rarityBreakdown };
};