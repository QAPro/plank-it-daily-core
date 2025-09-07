import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserAchievement = Tables<'user_achievements'>;
type SeasonalEvent = Tables<'seasonal_events'>;

export interface SeasonalAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
  eventTheme: string;
  availableFrom: Date;
  availableUntil: Date;
  requirement: {
    type: 'sessions' | 'duration' | 'streak' | 'special';
    value: number;
    withinEvent?: boolean;
  };
  exclusiveReward?: {
    badge: string;
    title: string;
    unlockMessage: string;
  };
}

// Dynamic seasonal achievements that change based on current date
export const generateSeasonalAchievements = (): SeasonalAchievement[] => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const achievements: SeasonalAchievement[] = [];

  // January - New Year Resolution Theme
  if (currentMonth === 0) {
    achievements.push({
      id: 'new_year_champion',
      name: 'New Year Champion',
      description: 'Complete 15 workouts in January',
      icon: '🎊',
      rarity: 'epic',
      points: 300,
      eventTheme: 'New Year Resolution',
      availableFrom: new Date(currentYear, 0, 1),
      availableUntil: new Date(currentYear, 0, 31),
      requirement: { type: 'sessions', value: 15, withinEvent: true },
      exclusiveReward: {
        badge: 'Resolution Keeper',
        title: 'New Year Champion',
        unlockMessage: 'You kept your resolution! Champion of new beginnings!'
      }
    });
  }

  // February - Love Your Body Theme
  if (currentMonth === 1) {
    achievements.push({
      id: 'self_love_warrior',
      name: 'Self-Love Warrior',
      description: 'Show yourself love with 14 days of workouts',
      icon: '💝',
      rarity: 'rare',
      points: 200,
      eventTheme: 'Love Your Body',
      availableFrom: new Date(currentYear, 1, 1),
      availableUntil: new Date(currentYear, 1, 28),
      requirement: { type: 'streak', value: 14, withinEvent: true },
      exclusiveReward: {
        badge: 'Self-Love Heart',
        title: 'Love Warrior',
        unlockMessage: 'The greatest love is self-love! You are amazing!'
      }
    });
  }

  // March - Spring Into Action Theme
  if (currentMonth === 2) {
    achievements.push({
      id: 'spring_awakening',
      name: 'Spring Awakening',
      description: 'Awaken your strength with 21 days of March workouts',
      icon: '🌸',
      rarity: 'epic',
      points: 350,
      eventTheme: 'Spring Into Action',
      availableFrom: new Date(currentYear, 2, 1),
      availableUntil: new Date(currentYear, 2, 31),
      requirement: { type: 'sessions', value: 21, withinEvent: true },
      exclusiveReward: {
        badge: 'Spring Blossom',
        title: 'Spring Champion',
        unlockMessage: 'Like spring flowers, your strength has blossomed!'
      }
    });
  }

  // Summer - Summer Body Theme (June-August)
  if ([5, 6, 7].includes(currentMonth)) {
    achievements.push({
      id: 'summer_body_ready',
      name: 'Summer Body Ready',
      description: 'Complete 30 summer workouts',
      icon: '☀️',
      rarity: 'legendary',
      points: 500,
      eventTheme: 'Summer Body',
      availableFrom: new Date(currentYear, 5, 1),
      availableUntil: new Date(currentYear, 7, 31),
      requirement: { type: 'sessions', value: 30, withinEvent: true },
      exclusiveReward: {
        badge: 'Summer Sun',
        title: 'Summer Ready',
        unlockMessage: 'You are absolutely summer body ready! Shine bright!'
      }
    });
  }

  // October - Halloween Theme
  if (currentMonth === 9) {
    achievements.push({
      id: 'spooky_strong',
      name: 'Spooky Strong',
      description: 'Frighten weakness away with 31 October workouts',
      icon: '🎃',
      rarity: 'epic',
      points: 400,
      eventTheme: 'Halloween Horror',
      availableFrom: new Date(currentYear, 9, 1),
      availableUntil: new Date(currentYear, 9, 31),
      requirement: { type: 'sessions', value: 31, withinEvent: true },
      exclusiveReward: {
        badge: 'Pumpkin Power',
        title: 'Spooky Strong',
        unlockMessage: 'BOO! You scared away all your excuses! Spooktacular!'
      }
    });
  }

  // December - Holiday Season Theme
  if (currentMonth === 11) {
    achievements.push({
      id: 'holiday_hero',
      name: 'Holiday Hero',
      description: 'Stay strong through holiday season - 25 December workouts',
      icon: '🎄',
      rarity: 'legendary',
      points: 600,
      eventTheme: 'Holiday Season',
      availableFrom: new Date(currentYear, 11, 1),
      availableUntil: new Date(currentYear, 11, 31),
      requirement: { type: 'sessions', value: 25, withinEvent: true },
      exclusiveReward: {
        badge: 'Holiday Star',
        title: 'Holiday Hero',
        unlockMessage: 'You are the greatest gift to yourself! Holiday Hero!'
      }
    });
  }

  // Year-round special events
  achievements.push({
    id: 'weekend_warrior_monthly',
    name: 'Weekend Warrior',
    description: 'Complete all weekend days this month',
    icon: '⚔️',
    rarity: 'rare',
    points: 150,
    eventTheme: 'Monthly Challenge',
    availableFrom: new Date(currentYear, currentMonth, 1),
    availableUntil: new Date(currentYear, currentMonth + 1, 0),
    requirement: { type: 'special', value: 8, withinEvent: true }, // All weekends in month
    exclusiveReward: {
      badge: 'Weekend Shield',
      title: 'Weekend Warrior',
      unlockMessage: 'Weekends are for warriors like you!'
    }
  });

  return achievements;
};

export class SeasonalAchievementEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async checkSeasonalAchievements(): Promise<UserAchievement[]> {
    console.log('Checking seasonal achievements for user:', this.userId);
    
    const newAchievements: UserAchievement[] = [];
    const currentSeasonalAchievements = generateSeasonalAchievements();
    
    // Get existing achievements
    const { data: existingAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_name')
      .eq('user_id', this.userId);

    const existingNames = new Set(existingAchievements?.map(a => a.achievement_name) || []);

    // Check each seasonal achievement
    for (const achievement of currentSeasonalAchievements) {
      if (existingNames.has(achievement.name)) continue;

      // Check if achievement is currently available
      const now = new Date();
      if (now < achievement.availableFrom || now > achievement.availableUntil) continue;

      try {
        const earned = await this.checkSeasonalAchievement(achievement);
        if (earned) {
          const newAchievement = await this.awardSeasonalAchievement(achievement);
          if (newAchievement) {
            newAchievements.push(newAchievement);
          }
        }
      } catch (error) {
        console.error(`Error checking seasonal achievement ${achievement.id}:`, error);
      }
    }

    return newAchievements;
  }

  private async checkSeasonalAchievement(achievement: SeasonalAchievement): Promise<boolean> {
    const { requirement, availableFrom, availableUntil } = achievement;
    
    let query = supabase
      .from('user_sessions')
      .select('*')
      .eq('user_id', this.userId);

    // Filter to event period if required
    if (requirement.withinEvent) {
      query = query
        .gte('completed_at', availableFrom.toISOString())
        .lte('completed_at', availableUntil.toISOString());
    }

    const { data: sessions } = await query;

    switch (requirement.type) {
      case 'sessions':
        return (sessions?.length || 0) >= requirement.value;
      
      case 'duration':
        const totalDuration = sessions?.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) || 0;
        return totalDuration >= requirement.value;
      
      case 'streak':
        // Check for consecutive days within the event period
        if (!sessions || sessions.length < requirement.value) return false;
        
        const sessionDates = sessions
          .map(s => new Date(s.completed_at || '').toDateString())
          .filter((date, index, arr) => arr.indexOf(date) === index)
          .sort();
        
        let consecutiveDays = 1;
        for (let i = 1; i < sessionDates.length; i++) {
          const prevDate = new Date(sessionDates[i - 1]);
          const currDate = new Date(sessionDates[i]);
          const dayDiff = (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (dayDiff === 1) {
            consecutiveDays++;
            if (consecutiveDays >= requirement.value) return true;
          } else {
            consecutiveDays = 1;
          }
        }
        return false;
      
      case 'special':
        // Special logic for weekend warrior and other custom requirements
        if (achievement.id === 'weekend_warrior_monthly') {
          const weekendSessions = sessions?.filter(session => {
            const date = new Date(session.completed_at || '');
            const dayOfWeek = date.getDay();
            return dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday
          }) || [];
          
          // Count unique weekend days
          const uniqueWeekendDays = new Set(
            weekendSessions.map(s => new Date(s.completed_at || '').toDateString())
          );
          
          return uniqueWeekendDays.size >= requirement.value;
        }
        return false;
      
      default:
        return false;
    }
  }

  private async awardSeasonalAchievement(achievement: SeasonalAchievement): Promise<UserAchievement | null> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: this.userId,
          achievement_type: 'seasonal',
          achievement_name: achievement.name,
          description: achievement.description,
          rarity: achievement.rarity,
          points: achievement.points,
          metadata: {
            icon: achievement.icon,
            theme: achievement.eventTheme,
            seasonal: true,
            availableFrom: achievement.availableFrom.toISOString(),
            availableUntil: achievement.availableUntil.toISOString(),
            exclusiveReward: achievement.exclusiveReward
          }
        })
        .select()
        .single();

      if (error) {
        console.error('Error awarding seasonal achievement:', error);
        return null;
      }

      console.log('Seasonal achievement awarded:', achievement.name);
      return data;
    } catch (error) {
      console.error('Error awarding seasonal achievement:', error);
      return null;
    }
  }

  static getCurrentSeasonalAchievements(): SeasonalAchievement[] {
    return generateSeasonalAchievements().filter(achievement => {
      const now = new Date();
      return now >= achievement.availableFrom && now <= achievement.availableUntil;
    });
  }

  static getSeasonalThemes(): string[] {
    const achievements = generateSeasonalAchievements();
    return [...new Set(achievements.map(a => a.eventTheme))];
  }
}