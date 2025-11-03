import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type Achievement = Tables<'achievements'>;
type UserAchievement = Tables<'user_achievements'>;

export interface SessionData {
  duration_seconds: number;
  exercise_id: string;
  user_id: string;
  completed_at?: string;
}

export class DatabaseAchievementService {
  protected userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Query methods
  async getAchievementById(id: string): Promise<Achievement | null> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('id', id)
      .eq('is_disabled', false)
      .single();

    if (error) {
      console.error('Error fetching achievement:', error);
      return null;
    }

    return data;
  }

  async getAchievementsByCategory(category: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('category', category as any)
      .eq('is_disabled', false)
      .order('points', { ascending: true });

    if (error) {
      console.error('Error fetching achievements by category:', error);
      return [];
    }

    return data || [];
  }

  async getAchievementsByRarity(rarity: string): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('rarity', rarity as any)
      .eq('is_disabled', false)
      .order('points', { ascending: true });

    if (error) {
      console.error('Error fetching achievements by rarity:', error);
      return [];
    }

    return data || [];
  }

  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await supabase
      .from('achievements')
      .select('*')
      .eq('is_disabled', false)
      .order('category', { ascending: true })
      .order('points', { ascending: true });

    if (error) {
      console.error('Error fetching all achievements:', error);
      return [];
    }

    return data || [];
  }

  async getUserEarnedAchievements(): Promise<UserAchievement[]> {
    const { data, error } = await supabase
      .from('user_achievements')
      .select('*')
      .eq('user_id', this.userId)
      .order('earned_at', { ascending: false });

    if (error) {
      console.error('Error fetching user achievements:', error);
      return [];
    }

    return data || [];
  }

  // Check & award methods
  async checkAllAchievements(sessionData: SessionData): Promise<UserAchievement[]> {
    console.log('Checking achievements for user:', this.userId);
    
    const newAchievements: UserAchievement[] = [];
    
    // Get existing achievements to avoid duplicates
    const { data: existingAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_type')
      .eq('user_id', this.userId);

    const earnedIds = new Set(existingAchievements?.map(a => a.achievement_type) || []);

    // Get all active achievements
    const allAchievements = await this.getAllAchievements();

    // Check each achievement
    for (const achievement of allAchievements) {
      if (earnedIds.has(achievement.id)) continue;

      const earned = await this.checkSingleAchievement(achievement, sessionData);
      if (earned) {
        const newAchievement = await this.awardAchievement(achievement);
        if (newAchievement) {
          newAchievements.push(newAchievement);
        }
      }
    }

    return newAchievements;
  }

  private async checkSingleAchievement(achievement: Achievement, sessionData: SessionData): Promise<boolean> {
    const criteria = achievement.unlock_criteria as any;
    
    if (!criteria || !criteria.type) {
      return false;
    }

    switch (criteria.type) {
      case 'streak':
        return this.checkStreakAchievement(criteria.value);
      
      case 'duration':
        return this.checkSessionDurationAchievement(criteria.value);
      
      case 'count':
        return this.checkSessionCountAchievement(criteria.value, criteria.category);
      
      case 'time_based':
        return this.checkTimeBasedAchievement(criteria.value, criteria.time_of_day);
      
      case 'variety':
        return this.checkVarietyAchievement(criteria.value, criteria.within_days);
      
      case 'improvement':
        return this.checkImprovementAchievement(criteria.value);
      
      case 'category_specific':
        return this.checkCategorySpecificAchievement(criteria.value, criteria.category, criteria.streak_days);
      
      default:
        return false;
    }
  }

  private async checkStreakAchievement(targetDays: number): Promise<boolean> {
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_streak')
      .eq('user_id', this.userId)
      .maybeSingle();

    return (streak?.current_streak || 0) >= targetDays;
  }

  private async checkSessionDurationAchievement(targetSeconds: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', this.userId)
      .gte('duration_seconds', targetSeconds)
      .limit(1);

    return (sessions?.length || 0) > 0;
  }

  private async checkSessionCountAchievement(targetCount: number, category?: string): Promise<boolean> {
    let query = supabase
      .from('user_sessions')
      .select('id', { count: 'exact' })
      .eq('user_id', this.userId);

    if (category) {
      query = query.eq('category', category);
    }

    const { count } = await query;
    return (count || 0) >= targetCount;
  }

  private async checkTimeBasedAchievement(targetCount: number, timeOfDay?: string): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId);

    if (!sessions || !timeOfDay) return false;

    const filteredSessions = sessions.filter(session => {
      const hour = new Date(session.completed_at || '').getHours();
      
      if (timeOfDay === 'morning') {
        return hour >= 5 && hour < 9;
      } else if (timeOfDay === 'evening') {
        return hour >= 19 || hour < 5;
      } else if (timeOfDay === 'weekend') {
        const day = new Date(session.completed_at || '').getDay();
        return day === 0 || day === 6;
      }
      
      return false;
    });

    return filteredSessions.length >= targetCount;
  }

  private async checkVarietyAchievement(targetVariety: number, withinDays?: number): Promise<boolean> {
    let query = supabase
      .from('user_sessions')
      .select('exercise_id')
      .eq('user_id', this.userId);

    if (withinDays) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - withinDays);
      query = query.gte('completed_at', startDate.toISOString());
    }

    const { data: sessions } = await query;
    const uniqueExercises = new Set(sessions?.map(s => s.exercise_id).filter(Boolean));
    
    return uniqueExercises.size >= targetVariety;
  }

  private async checkImprovementAchievement(targetImprovement: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds, completed_at')
      .eq('user_id', this.userId)
      .order('completed_at', { ascending: true });

    if (!sessions || sessions.length < 2) return false;

    const firstSession = sessions[0].duration_seconds;
    const bestSession = Math.max(...sessions.map(s => s.duration_seconds));

    return (bestSession - firstSession) >= targetImprovement;
  }

  private async checkCategorySpecificAchievement(
    targetValue: number, 
    category?: string, 
    streakDays?: number
  ): Promise<boolean> {
    if (streakDays) {
      // Check for consecutive days in category
      return this.checkCategoryStreak(category, streakDays);
    }

    // Check for session count in category
    return this.checkSessionCountAchievement(targetValue, category);
  }

  private async checkCategoryStreak(category: string | undefined, targetDays: number): Promise<boolean> {
    if (!category) return false;

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at, category')
      .eq('user_id', this.userId)
      .eq('category', category)
      .order('completed_at', { ascending: false });

    if (!sessions || sessions.length < targetDays) return false;

    // Check for consecutive days
    let currentStreak = 1;
    let previousDate = new Date(sessions[0].completed_at || '');

    for (let i = 1; i < sessions.length; i++) {
      const currentDate = new Date(sessions[i].completed_at || '');
      const dayDiff = Math.floor((previousDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff === 1) {
        currentStreak++;
        if (currentStreak >= targetDays) return true;
      } else if (dayDiff > 1) {
        currentStreak = 1;
      }

      previousDate = currentDate;
    }

    return currentStreak >= targetDays;
  }

  protected async awardAchievement(achievement: Achievement): Promise<UserAchievement | null> {
    try {
      // First, check if user already has this achievement
      const { data: existingAchievement } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', this.userId)
        .eq('achievement_type', achievement.id)
        .maybeSingle();

      // If already earned, return null to indicate no NEW achievement was awarded
      if (existingAchievement) {
        console.log('Achievement already earned (skipping):', achievement.name);
        return null;
      }

      // Insert new achievement
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: this.userId,
          achievement_type: achievement.id,
          achievement_name: achievement.name,
          description: achievement.description,
          metadata: {
            icon: achievement.icon,
            rarity: achievement.rarity,
            points: achievement.points,
            badge_file_name: achievement.badge_file_name
          }
        })
        .select()
        .single();

      if (error) {
        // Handle unique constraint violation gracefully
        if (error.code === '23505') { // Postgres unique violation code
          console.log('Achievement already exists (caught by DB constraint):', achievement.name);
          return null;
        }
        console.error('Error awarding achievement:', error);
        return null;
      }

      console.log('Achievement awarded:', achievement.name);
      return data;
    } catch (error) {
      console.error('Error awarding achievement:', error);
      return null;
    }
  }

  async getUserProgress(achievementId: string): Promise<number> {
    const { data } = await supabase
      .from('user_achievement_progress')
      .select('current_progress')
      .eq('user_id', this.userId)
      .eq('achievement_id', achievementId)
      .maybeSingle();

    return data?.current_progress || 0;
  }

  async updateProgress(achievementId: string, progress: number): Promise<void> {
    await supabase
      .from('user_achievement_progress')
      .upsert({
        user_id: this.userId,
        achievement_id: achievementId,
        current_progress: progress,
        target_progress: 100,
        last_updated: new Date().toISOString()
      });
  }

  static getRarityColor(rarity: Achievement['rarity']): string {
    const colors = {
      common: 'text-gray-600 bg-gray-100',
      uncommon: 'text-green-600 bg-green-100',
      rare: 'text-blue-600 bg-blue-100',
      epic: 'text-purple-600 bg-purple-100',
      legendary: 'text-yellow-600 bg-yellow-100'
    };
    return colors[rarity] || colors.common;
  }
}
