
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

export interface UserLevel {
  current_level: number;
  current_xp: number;
  xp_to_next_level: number;
  total_xp: number;
  level_title: string;
  unlocked_features: string[];
  next_unlock: LevelUnlock | null;
}

export interface LevelUnlock {
  level: number;
  feature_name: string;
  feature_description: string;
  icon: string;
  category: 'feature' | 'exercise' | 'customization' | 'social';
}

export interface XPTransaction {
  id: string;
  user_id: string;
  source: 'workout' | 'achievement' | 'streak' | 'bonus' | 'personal_best';
  amount: number;
  description: string;
  created_at: string;
}

export class LevelProgressionEngine {
  // XP required for each level (exponential growth)
  private static XP_REQUIREMENTS = [
    0,    // Level 1
    100,  // Level 2
    250,  // Level 3
    450,  // Level 4
    700,  // Level 5
    1000, // Level 6
    1350, // Level 7
    1750, // Level 8
    2200, // Level 9
    2700, // Level 10
    3250, // Level 11
    3850, // Level 12
    4500, // Level 13
    5200, // Level 14
    5950, // Level 15
    6750, // Level 16
    7600, // Level 17
    8500, // Level 18
    9450, // Level 19
    10450 // Level 20 (Master)
  ];

  static calculateLevel(totalXP: number): UserLevel {
    let currentLevel = 1;
    let xpForCurrentLevel = 0;
    
    for (let i = 1; i < this.XP_REQUIREMENTS.length; i++) {
      if (totalXP >= this.XP_REQUIREMENTS[i]) {
        currentLevel = i + 1;
        xpForCurrentLevel = this.XP_REQUIREMENTS[i];
      } else {
        break;
      }
    }
    
    const xpToNextLevel = currentLevel < 20 
      ? this.XP_REQUIREMENTS[currentLevel] - totalXP
      : 0;
    
    const currentXP = totalXP - xpForCurrentLevel;
    
    return {
      current_level: currentLevel,
      current_xp: currentXP,
      xp_to_next_level: xpToNextLevel,
      total_xp: totalXP,
      level_title: this.getLevelTitle(currentLevel),
      unlocked_features: [], // Will be populated by the hook
      next_unlock: null // Will be populated by the hook
    };
  }
  
  static getLevelTitle(level: number): string {
    const titles = {
      1: "Beginner",
      3: "Novice", 
      5: "Apprentice",
      7: "Practitioner",
      10: "Dedicated",
      12: "Advanced",
      15: "Expert",
      18: "Elite",
      20: "Master"
    };
    
    // Find the highest title the user has earned
    const earnedTitles = Object.entries(titles)
      .filter(([requiredLevel]) => level >= parseInt(requiredLevel))
      .sort(([a], [b]) => parseInt(b) - parseInt(a));
    
    return earnedTitles[0]?.[1] || "Beginner";
  }
  
  static calculateXPReward(source: string, data: any): number {
    switch (source) {
      case 'workout':
        let baseXP = 10;
        // Duration bonus: 1 XP per 10 seconds
        baseXP += Math.floor((data.duration_seconds || 0) / 10);
        // Difficulty bonus
        baseXP += ((data.difficulty_level || 1) - 1) * 5;
        return baseXP;
        
      case 'achievement':
        const rarityMultipliers = {
          common: 25,
          uncommon: 40,
          rare: 60,
          epic: 80,
          legendary: 100
        };
        return rarityMultipliers[data.rarity || 'common'] || 25;
        
      case 'streak':
        return Math.min((data.streak_length || 0) * 5, 50);
        
      case 'personal_best':
        return 20;
        
      case 'bonus':
        return data.amount || 10;
        
      default:
        return 0;
    }
  }

  static generateXPDescription(source: string, data: any): string {
    switch (source) {
      case 'workout':
        return `Completed ${data.exercise_name || 'workout'} (${Math.floor((data.duration_seconds || 0) / 60)}m ${(data.duration_seconds || 0) % 60}s)`;
      case 'achievement':
        return `Achievement unlocked: ${data.achievement_name}`;
      case 'streak':
        return `${data.streak_length}-day streak bonus`;
      case 'personal_best':
        return 'New personal best!';
      case 'bonus':
        return data.description || 'Bonus XP';
      default:
        return 'XP earned';
    }
  }
}

export const awardXP = async (userId: string, source: string, data: any): Promise<{ xpAmount: number, leveledUp: boolean, newLevel?: UserLevel }> => {
  try {
    const xpAmount = LevelProgressionEngine.calculateXPReward(source, data);
    const description = LevelProgressionEngine.generateXPDescription(source, data);
    
    // Record XP transaction
    await supabase.from('xp_transactions').insert({
      user_id: userId,
      source,
      amount: xpAmount,
      description
    });
    
    // Get current user data
    const { data: userData } = await supabase
      .from('users')
      .select('total_xp, current_level')
      .eq('id', userId)
      .single();
    
    const oldTotalXP = userData?.total_xp || 0;
    const newTotalXP = oldTotalXP + xpAmount;
    const oldLevel = LevelProgressionEngine.calculateLevel(oldTotalXP);
    const newLevel = LevelProgressionEngine.calculateLevel(newTotalXP);
    
    // Update user's total XP and level
    await supabase
      .from('users')
      .update({ 
        total_xp: newTotalXP,
        current_level: newLevel.current_level
      })
      .eq('id', userId);
    
    // Check for level up
    const leveledUp = newLevel.current_level > oldLevel.current_level;
    if (leveledUp) {
      await handleLevelUp(userId, oldLevel.current_level, newLevel.current_level);
    }
    
    return { xpAmount, leveledUp, newLevel: leveledUp ? newLevel : undefined };
  } catch (error) {
    console.error('Error awarding XP:', error);
    return { xpAmount: 0, leveledUp: false };
  }
};

const handleLevelUp = async (userId: string, oldLevel: number, newLevel: number) => {
  try {
    // Get available unlocks for the new level
    const { data: levelUnlocks } = await supabase
      .from('level_unlocks')
      .select('*')
      .eq('level', newLevel);
    
    // Unlock new features
    if (levelUnlocks && levelUnlocks.length > 0) {
      for (const unlock of levelUnlocks) {
        await supabase.from('feature_unlocks').insert({
          user_id: userId,
          feature_name: unlock.feature_name,
          unlock_level: unlock.level
        }).select().single();
      }
    }
    
    console.log(`User ${userId} leveled up from ${oldLevel} to ${newLevel}`);
  } catch (error) {
    console.error('Error handling level up:', error);
  }
};
