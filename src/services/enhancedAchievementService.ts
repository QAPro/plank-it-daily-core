
import { supabase } from '@/integrations/supabase/client';
import { ACHIEVEMENTS, Achievement, AchievementService } from './achievementService';
import type { Tables } from '@/integrations/supabase/types';

type UserAchievement = Tables<'user_achievements'>;

export interface AchievementCategory {
  id: string;
  name: string;
  description: string;
  achievements: Achievement[];
}

// Extended achievement definitions with new categories
export const EXTENDED_ACHIEVEMENTS: Achievement[] = [
  ...ACHIEVEMENTS,
  
  // Special Event Achievements
  {
    id: 'weekend_warrior',
    type: 'consistency',
    name: 'Weekend Warrior',
    description: 'Complete workouts on both Saturday and Sunday',
    icon: '🏃‍♂️',
    condition: { type: 'weekly_consistency', value: 2, period: 'week' },
    rarity: 'rare',
    points: 50
  },
  {
    id: 'early_bird',
    type: 'consistency',
    name: 'Early Bird',
    description: 'Complete 5 morning workouts (before 9 AM)',
    icon: '🌅',
    condition: { type: 'morning_sessions', value: 5 },
    rarity: 'rare',
    points: 75
  },
  {
    id: 'night_owl',
    type: 'consistency',
    name: 'Night Owl',
    description: 'Complete 5 evening workouts (after 8 PM)',
    icon: '🦉',
    condition: { type: 'evening_sessions', value: 5 },
    rarity: 'rare',
    points: 75
  },

  // Social Achievements
  {
    id: 'variety_seeker',
    type: 'progress',
    name: 'Variety Seeker',
    description: 'Try 10 different exercise types',
    icon: '🎭',
    condition: { type: 'exercise_variety', value: 10 },
    rarity: 'epic',
    points: 150
  },
  {
    id: 'perfectionist',
    type: 'progress',
    name: 'Perfectionist',
    description: 'Complete 10 sessions without stopping',
    icon: '💎',
    condition: { type: 'perfect_sessions', value: 10 },
    rarity: 'legendary',
    points: 300
  },

  // Milestone Achievements
  {
    id: 'bronze_collector',
    type: 'progress',
    name: 'Bronze Collector',
    description: 'Earn 10 achievements',
    icon: '🥉',
    condition: { type: 'achievements_earned', value: 10 },
    rarity: 'rare',
    points: 100
  },
  {
    id: 'silver_collector',
    type: 'progress',
    name: 'Silver Collector',
    description: 'Earn 25 achievements',
    icon: '🥈',
    condition: { type: 'achievements_earned', value: 25 },
    rarity: 'epic',
    points: 250
  },
  {
    id: 'gold_collector',
    type: 'progress',
    name: 'Gold Collector',
    description: 'Earn 50 achievements',
    icon: '🥇',
    condition: { type: 'achievements_earned', value: 50 },
    rarity: 'legendary',
    points: 500
  }
];

// Achievement categories
export const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  {
    id: 'streak',
    name: 'Streaks',
    description: 'Consistency achievements',
    achievements: EXTENDED_ACHIEVEMENTS.filter(a => a.type === 'streak')
  },
  {
    id: 'duration',
    name: 'Endurance',
    description: 'Time-based achievements',
    achievements: EXTENDED_ACHIEVEMENTS.filter(a => a.type === 'duration')
  },
  {
    id: 'consistency',
    name: 'Consistency',
    description: 'Regular workout achievements',
    achievements: EXTENDED_ACHIEVEMENTS.filter(a => a.type === 'consistency')
  },
  {
    id: 'progress',
    name: 'Progress',
    description: 'Improvement achievements',
    achievements: EXTENDED_ACHIEVEMENTS.filter(a => a.type === 'progress')
  }
];

export class EnhancedAchievementService extends AchievementService {
  async checkSpecialAchievements(): Promise<UserAchievement[]> {
    const newAchievements: UserAchievement[] = [];
    
    // Get existing achievements to avoid duplicates
    const { data: existingAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_name')
      .eq('user_id', this.userId);

    const existingNames = new Set(existingAchievements?.map(a => a.achievement_name) || []);

    // Check special achievements
    for (const achievement of EXTENDED_ACHIEVEMENTS) {
      if (existingNames.has(achievement.name)) continue;

      const earned = await this.checkSpecialAchievement(achievement);
      if (earned) {
        const newAchievement = await this.awardAchievement(achievement);
        if (newAchievement) {
          newAchievements.push(newAchievement);
        }
      }
    }

    return newAchievements;
  }

  private async checkSpecialAchievement(achievement: Achievement): Promise<boolean> {
    switch (achievement.condition.type) {
      case 'morning_sessions':
        return this.checkMorningSessionsAchievement(achievement.condition.value);
      
      case 'evening_sessions':
        return this.checkEveningSessionsAchievement(achievement.condition.value);
      
      case 'exercise_variety':
        return this.checkExerciseVarietyAchievement(achievement.condition.value);
      
      case 'perfect_sessions':
        return this.checkPerfectSessionsAchievement(achievement.condition.value);
      
      case 'achievements_earned':
        return this.checkAchievementsEarnedAchievement(achievement.condition.value);
      
      default:
        return this.checkSingleAchievement(achievement);
    }
  }

  private async checkMorningSessionsAchievement(targetSessions: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId);

    const morningCount = sessions?.filter(session => {
      const hour = new Date(session.completed_at || '').getHours();
      return hour >= 5 && hour < 9;
    }).length || 0;

    return morningCount >= targetSessions;
  }

  private async checkEveningSessionsAchievement(targetSessions: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId);

    const eveningCount = sessions?.filter(session => {
      const hour = new Date(session.completed_at || '').getHours();
      return hour >= 20 || hour < 5;
    }).length || 0;

    return eveningCount >= targetSessions;
  }

  private async checkExerciseVarietyAchievement(targetVariety: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('exercise_id')
      .eq('user_id', this.userId);

    const uniqueExercises = new Set(sessions?.map(s => s.exercise_id).filter(Boolean));
    return uniqueExercises.size >= targetVariety;
  }

  private async checkPerfectSessionsAchievement(targetSessions: number): Promise<boolean> {
    // This would require additional tracking of session completion quality
    // For now, assume all completed sessions are "perfect"
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', this.userId);

    return (sessions?.length || 0) >= targetSessions;
  }

  private async checkAchievementsEarnedAchievement(targetAchievements: number): Promise<boolean> {
    const { data: achievements } = await supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', this.userId);

    return (achievements?.length || 0) >= targetAchievements;
  }

  static getAchievementsByCategory(categoryId: string): Achievement[] {
    const category = ACHIEVEMENT_CATEGORIES.find(c => c.id === categoryId);
    return category?.achievements || [];
  }

  static getAllCategories(): AchievementCategory[] {
    return ACHIEVEMENT_CATEGORIES;
  }
}
