import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserAchievement = Tables<'user_achievements'>;

export interface HiddenAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  category: 'discovery' | 'timing' | 'behavior' | 'social' | 'surprise';
  checkCondition: (userId: string) => Promise<boolean>;
  unlockMessage: string;
  shareMessage: string;
}

export const HIDDEN_ACHIEVEMENTS: HiddenAchievement[] = [
  // TIME-BASED HIDDEN ACHIEVEMENTS
  {
    id: 'ACH_HIDDEN_001',
    name: 'Night Owl',
    description: 'Complete a workout after 10 PM',
    icon: '🦉',
    rarity: 'uncommon',
    points: 75,
    category: 'timing',
    checkCondition: async (userId: string) => {
      const { data } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', userId);
      
      return data?.some(session => {
        const hour = new Date(session.completed_at || '').getHours();
        return hour >= 22 || hour < 5;
      }) || false;
    },
    unlockMessage: 'The night is your domain! Some find their strength in darkness.',
    shareMessage: 'Unlocked the Night Owl achievement! 🦉 Working out when the world sleeps! #PlankCoach'
  },
  {
    id: 'ACH_HIDDEN_002',
    name: 'Early Riser',
    description: 'Complete a workout before 6 AM',
    icon: '🌅',
    rarity: 'uncommon',
    points: 75,
    category: 'timing',
    checkCondition: async (userId: string) => {
      const { data } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', userId);
      
      return data?.some(session => {
        const hour = new Date(session.completed_at || '').getHours();
        return hour >= 4 && hour < 6;
      }) || false;
    },
    unlockMessage: 'The early bird catches the gains! Your dedication knows no bounds.',
    shareMessage: 'Early Riser achievement unlocked! 🌅 Dawn warrior activated! #PlankCoach'
  },

  // BEHAVIOR-BASED HIDDEN ACHIEVEMENTS
  {
    id: 'ACH_HIDDEN_003',
    name: 'Weekend Warrior',
    description: 'Complete 5 weekend workouts in a row',
    icon: '⚔️',
    rarity: 'rare',
    points: 150,
    category: 'behavior',
    checkCondition: async (userId: string) => {
      const { data } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });
      
      if (!data || data.length < 5) return false;
      
      let weekendCount = 0;
      for (const session of data) {
        const date = new Date(session.completed_at || '');
        const dayOfWeek = date.getDay();
        if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday or Saturday
          weekendCount++;
          if (weekendCount >= 5) return true;
        }
      }
      return false;
    },
    unlockMessage: 'Weekend warrior mode activated! You never let relaxation stop your progress.',
    shareMessage: 'Weekend Warrior unlocked! ⚔️ 5 weekend workouts conquered! #PlankCoach'
  },
  {
    id: 'ACH_HIDDEN_004',
    name: 'Perfectionist',
    description: 'Complete 50 sessions without pausing',
    icon: '💎',
    rarity: 'epic',
    points: 250,
    category: 'behavior',
    checkCondition: async (userId: string) => {
      const { data } = await supabase
        .from('user_sessions')
        .select('duration_seconds')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(60);
      
      // For now, assume sessions over 15 seconds are "complete"
      const completeSessions = data?.filter(s => s.duration_seconds >= 15) || [];
      return completeSessions.length >= 50;
    },
    unlockMessage: 'Perfection achieved! Your focus and determination are unmatched.',
    shareMessage: 'Perfectionist achievement unlocked! 💎 50 flawless sessions! #PlankCoach'
  },

  // DISCOVERY HIDDEN ACHIEVEMENTS
  {
    id: 'ACH_HIDDEN_005',
    name: 'Explorer',
    description: 'Try 15 different exercise variations',
    icon: '🗺️',
    rarity: 'rare',
    points: 200,
    category: 'discovery',
    checkCondition: async (userId: string) => {
      const { data } = await supabase
        .from('user_sessions')
        .select('exercise_id')
        .eq('user_id', userId);
      
      const uniqueExercises = new Set(data?.map(s => s.exercise_id).filter(Boolean));
      return uniqueExercises.size >= 15;
    },
    unlockMessage: 'True explorer! You\'ve ventured into uncharted fitness territory.',
    shareMessage: 'Explorer achievement unlocked! 🗺️ 15 different exercises mastered! #PlankCoach'
  },

  // SURPRISE HIDDEN ACHIEVEMENTS
  {
    id: 'ACH_HIDDEN_006',
    name: 'Lucky Seven',
    description: 'Complete your 7th workout of the month on the 7th day',
    icon: '🍀',
    rarity: 'legendary',
    points: 777,
    category: 'surprise',
    checkCondition: async (userId: string) => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      // Check if today is the 7th
      if (now.getDate() !== 7) return false;
      
      const monthStart = new Date(currentYear, currentMonth, 1);
      const { data } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .gte('completed_at', monthStart.toISOString());
      
      return (data?.length || 0) === 7;
    },
    unlockMessage: 'INCREDIBLE! The stars have aligned - 7th workout on the 7th! Pure magic!',
    shareMessage: 'Lucky Seven achievement unlocked! 🍀 The universe smiled on my workout! #PlankCoach'
  },
  {
    id: 'ACH_HIDDEN_007',
    name: 'Birthday Dedication',
    description: 'Complete a workout on your birthday',
    icon: '🎂',
    rarity: 'legendary',
    points: 365,
    category: 'surprise',
    checkCondition: async (userId: string) => {
      // This would require birthday data - for now, check if user worked out on New Year's Day
      const newYearStart = new Date(new Date().getFullYear(), 0, 1);
      const newYearEnd = new Date(new Date().getFullYear(), 0, 2);
      
      const { data } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .gte('completed_at', newYearStart.toISOString())
        .lt('completed_at', newYearEnd.toISOString());
      
      return (data?.length || 0) > 0;
    },
    unlockMessage: 'Birthday dedication! The best gift you can give yourself is health.',
    shareMessage: 'Birthday Dedication unlocked! 🎂 Celebrated with a workout! #PlankCoach'
  }
];

export class HiddenAchievementEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async checkHiddenAchievements(): Promise<UserAchievement[]> {
    console.log('Checking hidden achievements for user:', this.userId);
    
    const newAchievements: UserAchievement[] = [];
    
    // Get existing achievements
    const { data: existingAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_name')
      .eq('user_id', this.userId);

    const existingNames = new Set(existingAchievements?.map(a => a.achievement_name) || []);

    // Check each hidden achievement
    for (const achievement of HIDDEN_ACHIEVEMENTS) {
      if (existingNames.has(achievement.name)) continue;

      try {
        const earned = await achievement.checkCondition(this.userId);
        if (earned) {
          const newAchievement = await this.awardHiddenAchievement(achievement);
          if (newAchievement) {
            newAchievements.push(newAchievement);
          }
        }
      } catch (error) {
        console.error(`Error checking hidden achievement ${achievement.id}:`, error);
      }
    }

    return newAchievements;
  }

  private async awardHiddenAchievement(achievement: HiddenAchievement): Promise<UserAchievement | null> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: this.userId,
          achievement_type: achievement.id,
          achievement_name: achievement.name,
          description: achievement.description,
          rarity: achievement.rarity,
          points: achievement.points,
          metadata: {
            icon: achievement.icon,
            category: achievement.category,
            hidden: true,
            unlockMessage: achievement.unlockMessage,
            shareMessage: achievement.shareMessage
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error awarding hidden achievement:', error);
        return null;
      }

      console.log('Hidden achievement awarded:', achievement.name);
      return data;
    } catch (error) {
      console.error('Error awarding hidden achievement:', error);
      return null;
    }
  }

  static getHiddenAchievementById(id: string): HiddenAchievement | undefined {
    return HIDDEN_ACHIEVEMENTS.find(a => a.id === id);
  }

  static getHiddenAchievementsByCategory(category: HiddenAchievement['category']): HiddenAchievement[] {
    return HIDDEN_ACHIEVEMENTS.filter(a => a.category === category);
  }
}