import { supabase } from '@/integrations/supabase/client';
import { LevelProgressionEngine } from './levelProgressionService';

export interface XPBonus {
  type: 'streak' | 'perfect_form' | 'random_multiplier' | 'challenge' | 'personal_best' | 'time_bonus';
  amount: number;
  description: string;
}

export interface EnhancedXPCalculation {
  baseXP: number;
  bonuses: XPBonus[];
  totalXP: number;
  multiplier: number;
  description: string;
}

export class EnhancedXPService {
  // Daily random multiplier storage
  private static dailyMultiplier: number | null = null;
  private static lastMultiplierDate: string | null = null;

  static async calculateEnhancedXP(source: string, data: any, userId: string): Promise<EnhancedXPCalculation> {
    const baseXP = LevelProgressionEngine.calculateXPReward(source, data);
    const bonuses: XPBonus[] = [];
    let multiplier = 1.0;

    // Get user streak for streak bonus
    const streak = await this.getUserStreak(userId);
    
    // Apply various bonuses based on source
    if (source === 'workout') {
      // Streak XP Bonus (compounds)
      if (streak && streak.current_streak > 1) {
        const streakBonus = Math.min(streak.current_streak * 2, 20); // Cap at 20 XP
        bonuses.push({
          type: 'streak',
          amount: streakBonus,
          description: `${streak.current_streak}-day streak bonus`
        });
      }

      // Perfect Form XP (based on completion consistency)
      const completionRate = data.completion_rate || 1.0;
      if (completionRate >= 0.95) {
        bonuses.push({
          type: 'perfect_form',
          amount: 3,
          description: 'Perfect form bonus'
        });
      }

      // Time of day bonus
      const hour = new Date().getHours();
      if (hour >= 5 && hour <= 7) { // Early bird
        bonuses.push({
          type: 'time_bonus',
          amount: 2,
          description: 'Early bird bonus'
        });
      } else if (hour >= 21 && hour <= 23) { // Night owl
        bonuses.push({
          type: 'time_bonus',
          amount: 2,
          description: 'Night owl dedication'
        });
      }

      // Random daily multiplier (10-25% chance)
      const randomMultiplier = await this.getDailyRandomMultiplier();
      if (randomMultiplier > 1.0) {
        multiplier = randomMultiplier;
      }
    }

    if (source === 'challenge') {
      bonuses.push({
        type: 'challenge',
        amount: 15,
        description: 'Challenge completion bonus'
      });
    }

    if (source === 'personal_best') {
      const improvementPercent = data.improvement_percent || 0;
      let bonus = 20;
      
      // Extra bonus for significant improvements
      if (improvementPercent > 50) {
        bonus += 15;
      } else if (improvementPercent > 25) {
        bonus += 10;
      } else if (improvementPercent > 10) {
        bonus += 5;
      }

      bonuses.push({
        type: 'personal_best',
        amount: bonus,
        description: `Personal best (+${improvementPercent.toFixed(1)}%)`
      });
    }

    // Calculate totals
    const bonusXP = bonuses.reduce((sum, bonus) => sum + bonus.amount, 0);
    const totalXP = Math.round((baseXP + bonusXP) * multiplier);

    return {
      baseXP,
      bonuses,
      totalXP,
      multiplier,
      description: this.generateEnhancedDescription(source, data, bonuses, multiplier)
    };
  }

  private static async getUserStreak(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_streaks')
        .select('current_streak, longest_streak')
        .eq('user_id', userId)
        .single();
      
      return error ? null : data;
    } catch (error) {
      return null;
    }
  }

  private static async getDailyRandomMultiplier(): Promise<number> {
    const today = new Date().toISOString().split('T')[0];
    
    // Check if we already calculated today's multiplier
    if (this.lastMultiplierDate === today && this.dailyMultiplier !== null) {
      return this.dailyMultiplier;
    }

    // Generate new daily multiplier
    const random = Math.random();
    let multiplier = 1.0;

    if (random < 0.10) { // 10% chance of 2x
      multiplier = 2.0;
    } else if (random < 0.25) { // 15% chance of 1.5x
      multiplier = 1.5;
    }

    this.dailyMultiplier = multiplier;
    this.lastMultiplierDate = today;

    return multiplier;
  }

  private static generateEnhancedDescription(source: string, data: any, bonuses: XPBonus[], multiplier: number): string {
    let description = LevelProgressionEngine.generateXPDescription(source, data);
    
    if (bonuses.length > 0) {
      const bonusDescriptions = bonuses.map(b => b.description).join(', ');
      description += ` + ${bonusDescriptions}`;
    }

    if (multiplier > 1.0) {
      description += ` (${multiplier}x multiplier!)`;
    }

    return description;
  }

  static getMultiplierMessage(): string | null {
    if (this.dailyMultiplier && this.dailyMultiplier > 1.0) {
      if (this.dailyMultiplier === 2.0) {
        return "🎉 DOUBLE XP DAY! All workouts give 2x experience!";
      } else if (this.dailyMultiplier === 1.5) {
        return "⭐ BONUS XP DAY! All workouts give 50% more experience!";
      }
    }
    return null;
  }
}