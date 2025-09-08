import { StatusTrackService } from './statusTrackService';

/**
 * Service for managing featured users automation
 * This handles the automatic selection and rotation of featured users
 */
export class FeaturedUsersService {
  /**
   * Run the complete featured users update cycle
   * This should be called periodically (e.g., via cron job or scheduled task)
   */
  static async updateAllFeaturedUsers(): Promise<void> {
    console.log('Starting featured users update cycle...');
    
    try {
      // Update weekly featured users (runs weekly)
      await StatusTrackService.selectWeeklyFeaturedUsers();
      console.log('✅ Weekly featured users updated');
      
      // Update monthly featured users (runs monthly)
      await StatusTrackService.selectMonthlyFeaturedUsers();
      console.log('✅ Monthly featured users updated');
      
      // Update hall of fame (runs daily to catch new level 10 achievers)
      await StatusTrackService.selectHallOfFameUsers();
      console.log('✅ Hall of fame updated');
      
      console.log('Featured users update cycle completed successfully');
    } catch (error) {
      console.error('Error during featured users update cycle:', error);
      throw error;
    }
  }

  /**
   * Update only weekly featured users
   * Can be called manually or on a weekly schedule
   */
  static async updateWeeklyFeatured(): Promise<void> {
    try {
      await StatusTrackService.selectWeeklyFeaturedUsers();
      console.log('Weekly featured users updated successfully');
    } catch (error) {
      console.error('Error updating weekly featured users:', error);
      throw error;
    }
  }

  /**
   * Update only monthly featured users
   * Can be called manually or on a monthly schedule
   */
  static async updateMonthlyFeatured(): Promise<void> {
    try {
      await StatusTrackService.selectMonthlyFeaturedUsers();
      console.log('Monthly featured users updated successfully');
    } catch (error) {
      console.error('Error updating monthly featured users:', error);
      throw error;
    }
  }

  /**
   * Update only hall of fame
   * Can be called manually or on a daily schedule
   */
  static async updateHallOfFame(): Promise<void> {
    try {
      await StatusTrackService.selectHallOfFameUsers();
      console.log('Hall of fame updated successfully');
    } catch (error) {
      console.error('Error updating hall of fame:', error);
      throw error;
    }
  }

  /**
   * Get statistics about current featured users
   */
  static async getFeaturedUsersStats(): Promise<{
    weekly: number;
    monthly: number;
    hall_of_fame: number;
    total: number;
  }> {
    try {
      const [weekly, monthly, hallOfFame] = await Promise.all([
        StatusTrackService.getFeaturedUsers('weekly'),
        StatusTrackService.getFeaturedUsers('monthly'),
        StatusTrackService.getFeaturedUsers('hall_of_fame')
      ]);

      return {
        weekly: weekly.length,
        monthly: monthly.length,
        hall_of_fame: hallOfFame.length,
        total: weekly.length + monthly.length + hallOfFame.length
      };
    } catch (error) {
      console.error('Error getting featured users stats:', error);
      return { weekly: 0, monthly: 0, hall_of_fame: 0, total: 0 };
    }
  }
}