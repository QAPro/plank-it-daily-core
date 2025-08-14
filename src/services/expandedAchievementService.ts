
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserAchievement = Tables<'user_achievements'>;

export interface ExpandedAchievement {
  id: string;
  name: string;
  description: string;
  category: 'consistency' | 'performance' | 'exploration' | 'social' | 'milestone';
  icon: string;
  badge_color: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  points: number;
  requirement: AchievementRequirement;
  unlock_message: string;
  share_message: string;
}

export interface AchievementRequirement {
  type: 'streak' | 'duration' | 'count' | 'variety' | 'time_based' | 'social' | 'improvement';
  value: number;
  conditions?: {
    exercise_types?: string[];
    time_of_day?: 'morning' | 'evening' | 'weekend';
    consecutive?: boolean;
    within_timeframe?: number;
    improvement_threshold?: number;
  };
}

// Expanded Achievement Definitions
export const EXPANDED_ACHIEVEMENTS: ExpandedAchievement[] = [
  // CONSISTENCY ACHIEVEMENTS
  {
    id: 'daily_warrior',
    name: 'Daily Warrior',
    description: '7 consecutive days of workouts',
    category: 'consistency',
    icon: '⚔️',
    badge_color: 'from-orange-400 to-red-500',
    rarity: 'common',
    points: 50,
    requirement: { type: 'streak', value: 7 },
    unlock_message: 'Seven days strong! You\'re building an unstoppable habit!',
    share_message: 'Just completed a 7-day workout streak! 💪 #PlankCoach'
  },
  {
    id: 'habit_builder',
    name: 'Habit Builder',
    description: '14 consecutive days of workouts',
    category: 'consistency',
    icon: '🏗️',
    badge_color: 'from-blue-400 to-purple-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'streak', value: 14 },
    unlock_message: 'Two weeks of dedication! You\'re building something amazing!',
    share_message: 'Two weeks of consistent workouts completed! 🔥 #PlankCoach'
  },
  {
    id: 'unstoppable',
    name: 'Unstoppable',
    description: '30 consecutive days of workouts',
    category: 'consistency',
    icon: '🌟',
    badge_color: 'from-purple-400 to-pink-500',
    rarity: 'rare',
    points: 250,
    requirement: { type: 'streak', value: 30 },
    unlock_message: 'One month of pure dedication! You are truly unstoppable!',
    share_message: 'Achieved a 30-day workout streak! Unstoppable! 🌟 #PlankCoach'
  },
  {
    id: 'legend',
    name: 'Legend',
    description: '100 consecutive days of workouts',
    category: 'consistency',
    icon: '👑',
    badge_color: 'from-yellow-400 to-orange-500',
    rarity: 'legendary',
    points: 1000,
    requirement: { type: 'streak', value: 100 },
    unlock_message: 'ONE HUNDRED DAYS! You are a true fitness legend!',
    share_message: '100-day workout streak achieved! I am a fitness legend! 👑 #PlankCoach'
  },
  {
    id: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: '10 weekend workouts completed',
    category: 'consistency',
    icon: '🏃‍♂️',
    badge_color: 'from-green-400 to-blue-500',
    rarity: 'uncommon',
    points: 75,
    requirement: { 
      type: 'time_based', 
      value: 10, 
      conditions: { time_of_day: 'weekend' } 
    },
    unlock_message: 'Weekend dedication pays off! You never skip the important days!',
    share_message: 'Completed 10 weekend workouts! Weekend warrior mode activated! 🏃‍♂️ #PlankCoach'
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: '20 morning workouts (before 9 AM)',
    category: 'consistency',
    icon: '🌅',
    badge_color: 'from-yellow-300 to-orange-400',
    rarity: 'rare',
    points: 150,
    requirement: { 
      type: 'time_based', 
      value: 20, 
      conditions: { time_of_day: 'morning' } 
    },
    unlock_message: 'Rise and grind! You\'ve mastered the art of morning workouts!',
    share_message: '20 morning workouts completed! Early bird gets the gains! 🌅 #PlankCoach'
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: '20 evening workouts (after 7 PM)',
    category: 'consistency',
    icon: '🦉',
    badge_color: 'from-indigo-400 to-purple-600',
    rarity: 'rare',
    points: 150,
    requirement: { 
      type: 'time_based', 
      value: 20, 
      conditions: { time_of_day: 'evening' } 
    },
    unlock_message: 'Night time is the right time! You own the evening hours!',
    share_message: '20 evening workouts completed! Night owl strength! 🦉 #PlankCoach'
  },

  // PERFORMANCE ACHIEVEMENTS
  {
    id: 'quick_start',
    name: 'Quick Start',
    description: 'Complete a 15-second plank',
    category: 'performance',
    icon: '⚡',
    badge_color: 'from-green-300 to-green-500',
    rarity: 'common',
    points: 10,
    requirement: { type: 'duration', value: 15 },
    unlock_message: 'Every journey begins with a single step! Great start!',
    share_message: 'Started my plank journey with 15 seconds! ⚡ #PlankCoach'
  },
  {
    id: 'half_minute_hero',
    name: 'Half Minute Hero',
    description: 'Complete a 30-second plank',
    category: 'performance',
    icon: '🦸‍♂️',
    badge_color: 'from-blue-300 to-blue-500',
    rarity: 'common',
    points: 25,
    requirement: { type: 'duration', value: 30 },
    unlock_message: 'Thirty seconds of pure strength! You\'re a hero in the making!',
    share_message: 'Held a 30-second plank! Half minute hero! 🦸‍♂️ #PlankCoach'
  },
  {
    id: 'minute_master',
    name: 'Minute Master',
    description: 'Complete a 60-second plank',
    category: 'performance',
    icon: '⏱️',
    badge_color: 'from-purple-300 to-purple-500',
    rarity: 'uncommon',
    points: 50,
    requirement: { type: 'duration', value: 60 },
    unlock_message: 'One full minute! You\'ve mastered the fundamental challenge!',
    share_message: 'Achieved a 60-second plank! Minute master unlocked! ⏱️ #PlankCoach'
  },
  {
    id: 'endurance_expert',
    name: 'Endurance Expert',
    description: 'Complete a 2-minute plank',
    category: 'performance',
    icon: '💪',
    badge_color: 'from-red-400 to-pink-500',
    rarity: 'rare',
    points: 100,
    requirement: { type: 'duration', value: 120 },
    unlock_message: 'Two minutes of unwavering strength! You are an endurance expert!',
    share_message: 'Crushed a 2-minute plank! Endurance expert level! 💪 #PlankCoach'
  },
  {
    id: 'iron_core',
    name: 'Iron Core',
    description: 'Complete a 5-minute plank',
    category: 'performance',
    icon: '🛡️',
    badge_color: 'from-gray-400 to-gray-600',
    rarity: 'epic',
    points: 300,
    requirement: { type: 'duration', value: 300 },
    unlock_message: 'FIVE MINUTES! Your core is forged from iron!',
    share_message: 'Held a 5-minute plank! My core is made of iron! 🛡️ #PlankCoach'
  },
  {
    id: 'personal_best',
    name: 'Personal Best',
    description: 'Beat your previous best by 30+ seconds',
    category: 'performance',
    icon: '📈',
    badge_color: 'from-green-400 to-emerald-500',
    rarity: 'uncommon',
    points: 75,
    requirement: { 
      type: 'improvement', 
      value: 30,
      conditions: { improvement_threshold: 30 }
    },
    unlock_message: 'Amazing improvement! You\'re getting stronger every day!',
    share_message: 'Just beat my personal best by 30+ seconds! 📈 #PlankCoach'
  },
  {
    id: 'double_down',
    name: 'Double Down',
    description: 'Double your initial best time',
    category: 'performance',
    icon: '🎯',
    badge_color: 'from-orange-400 to-red-500',
    rarity: 'rare',
    points: 200,
    requirement: { 
      type: 'improvement', 
      value: 100,
      conditions: { improvement_threshold: 100 }
    },
    unlock_message: 'You\'ve DOUBLED your strength! Incredible progress!',
    share_message: 'Doubled my initial plank time! Progress is real! 🎯 #PlankCoach'
  },

  // EXPLORATION ACHIEVEMENTS
  {
    id: 'exercise_explorer',
    name: 'Exercise Explorer',
    description: 'Try all basic exercises',
    category: 'exploration',
    icon: '🗺️',
    badge_color: 'from-teal-400 to-cyan-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { 
      type: 'variety', 
      value: 5,
      conditions: { exercise_types: ['basic'] }
    },
    unlock_message: 'Adventure calls! You\'ve explored all the basic exercises!',
    share_message: 'Explored all basic exercises! Adventure mode activated! 🗺️ #PlankCoach'
  },
  {
    id: 'variety_seeker',
    name: 'Variety Seeker',
    description: 'Complete 5 different exercises in a week',
    category: 'exploration',
    icon: '🎭',
    badge_color: 'from-pink-400 to-rose-500',
    rarity: 'uncommon',
    points: 75,
    requirement: { 
      type: 'variety', 
      value: 5,
      conditions: { within_timeframe: 7 }
    },
    unlock_message: 'Variety is the spice of fitness! You love to mix things up!',
    share_message: 'Completed 5 different exercises this week! Variety seeker! 🎭 #PlankCoach'
  },
  {
    id: 'challenge_accepted',
    name: 'Challenge Accepted',
    description: 'Complete your first advanced exercise',
    category: 'exploration',
    icon: '🎪',
    badge_color: 'from-violet-400 to-purple-600',
    rarity: 'rare',
    points: 150,
    requirement: { 
      type: 'variety', 
      value: 1,
      conditions: { exercise_types: ['advanced'] }
    },
    unlock_message: 'Challenge accepted and conquered! You\'re ready for anything!',
    share_message: 'Completed my first advanced exercise! Challenge accepted! 🎪 #PlankCoach'
  },

  // MILESTONE ACHIEVEMENTS
  {
    id: 'getting_started',
    name: 'Getting Started',
    description: 'Complete 10 total workouts',
    category: 'milestone',
    icon: '🚀',
    badge_color: 'from-cyan-300 to-blue-400',
    rarity: 'common',
    points: 50,
    requirement: { type: 'count', value: 10 },
    unlock_message: 'Ten workouts complete! Your fitness journey is officially launched!',
    share_message: 'Completed my first 10 workouts! Getting started! 🚀 #PlankCoach'
  },
  {
    id: 'committed',
    name: 'Committed',
    description: 'Complete 25 total workouts',
    category: 'milestone',
    icon: '🎖️',
    badge_color: 'from-emerald-400 to-green-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'count', value: 25 },
    unlock_message: 'Twenty-five workouts! Your commitment is showing real results!',
    share_message: '25 workouts completed! Commitment level: unlocked! 🎖️ #PlankCoach'
  },
  {
    id: 'dedicated',
    name: 'Dedicated',
    description: 'Complete 50 total workouts',
    category: 'milestone',
    icon: '🏅',
    badge_color: 'from-amber-400 to-orange-500',
    rarity: 'rare',
    points: 200,
    requirement: { type: 'count', value: 50 },
    unlock_message: 'Fifty workouts! Your dedication is truly inspiring!',
    share_message: 'Reached 50 total workouts! Dedication pays off! 🏅 #PlankCoach'
  },
  {
    id: 'expert',
    name: 'Expert',
    description: 'Complete 100 total workouts',
    category: 'milestone',
    icon: '🏆',
    badge_color: 'from-yellow-400 to-amber-500',
    rarity: 'epic',
    points: 500,
    requirement: { type: 'count', value: 100 },
    unlock_message: 'ONE HUNDRED WORKOUTS! You are officially a plank expert!',
    share_message: '100 workouts completed! Expert status achieved! 🏆 #PlankCoach'
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Complete 365 total workouts',
    category: 'milestone',
    icon: '💎',
    badge_color: 'from-indigo-500 to-purple-600',
    rarity: 'legendary',
    points: 1500,
    requirement: { type: 'count', value: 365 },
    unlock_message: 'THREE SIXTY-FIVE! You are a true plank master! Legendary status!',
    share_message: '365 workouts completed! I am a plank master! 💎 #PlankCoach'
  },
  {
    id: 'time_warrior',
    name: 'Time Warrior',
    description: 'Accumulate 1 hour of total plank time',
    category: 'milestone',
    icon: '⏰',
    badge_color: 'from-red-400 to-rose-500',
    rarity: 'uncommon',
    points: 100,
    requirement: { type: 'time_based', value: 3600 },
    unlock_message: 'One full hour of planking! You are a time warrior!',
    share_message: 'Accumulated 1 hour of total plank time! Time warrior! ⏰ #PlankCoach'
  },
  {
    id: 'endurance_champion',
    name: 'Endurance Champion',
    description: 'Accumulate 10 hours of total plank time',
    category: 'milestone',
    icon: '🌟',
    badge_color: 'from-purple-500 to-pink-600',
    rarity: 'epic',
    points: 750,
    requirement: { type: 'time_based', value: 36000 },
    unlock_message: 'TEN HOURS! You are the ultimate endurance champion!',
    share_message: '10 hours of total plank time! Endurance champion! 🌟 #PlankCoach'
  }
];

export class ExpandedAchievementEngine {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async checkAllAchievements(sessionData?: any): Promise<UserAchievement[]> {
    console.log('Checking all achievements for user:', this.userId);
    
    const newAchievements: UserAchievement[] = [];
    
    // Get existing achievements to avoid duplicates
    const { data: existingAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_name')
      .eq('user_id', this.userId);

    const existingNames = new Set(existingAchievements?.map(a => a.achievement_name) || []);

    // Check each achievement category
    for (const achievement of EXPANDED_ACHIEVEMENTS) {
      if (existingNames.has(achievement.name)) continue;

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

  private async checkSingleAchievement(achievement: ExpandedAchievement, sessionData?: any): Promise<boolean> {
    switch (achievement.requirement.type) {
      case 'streak':
        return this.checkStreakAchievement(achievement.requirement.value);
      
      case 'duration':
        return this.checkDurationAchievement(achievement.requirement.value, sessionData);
      
      case 'count':
        return this.checkCountAchievement(achievement.requirement.value);
      
      case 'variety':
        return this.checkVarietyAchievement(achievement.requirement.value, achievement.requirement.conditions);
      
      case 'time_based':
        return this.checkTimeBasedAchievement(achievement.requirement.value, achievement.requirement.conditions);
      
      case 'improvement':
        return this.checkImprovementAchievement(achievement.requirement.value, achievement.requirement.conditions, sessionData);
      
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

  private async checkDurationAchievement(targetSeconds: number, sessionData?: any): Promise<boolean> {
    // Check if the current session meets the requirement
    if (sessionData?.duration_seconds >= targetSeconds) {
      return true;
    }

    // Check historical sessions
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', this.userId)
      .gte('duration_seconds', targetSeconds)
      .limit(1);

    return (sessions?.length || 0) > 0;
  }

  private async checkCountAchievement(targetCount: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('id')
      .eq('user_id', this.userId);

    return (sessions?.length || 0) >= targetCount;
  }

  private async checkVarietyAchievement(targetVariety: number, conditions?: any): Promise<boolean> {
    let query = supabase
      .from('user_sessions')
      .select('exercise_id, completed_at')
      .eq('user_id', this.userId);

    // Apply time frame condition if specified
    if (conditions?.within_timeframe) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - conditions.within_timeframe);
      query = query.gte('completed_at', startDate.toISOString());
    }

    const { data: sessions } = await query;
    const uniqueExercises = new Set(sessions?.map(s => s.exercise_id).filter(Boolean));
    
    return uniqueExercises.size >= targetVariety;
  }

  private async checkTimeBasedAchievement(targetValue: number, conditions?: any): Promise<boolean> {
    if (conditions?.time_of_day === 'morning') {
      return this.checkMorningWorkouts(targetValue);
    } else if (conditions?.time_of_day === 'evening') {
      return this.checkEveningWorkouts(targetValue);
    } else if (conditions?.time_of_day === 'weekend') {
      return this.checkWeekendWorkouts(targetValue);
    } else {
      // Total time accumulation
      return this.checkTotalTime(targetValue);
    }
  }

  private async checkMorningWorkouts(targetCount: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId);

    const morningCount = sessions?.filter(session => {
      const hour = new Date(session.completed_at || '').getHours();
      return hour >= 5 && hour < 9;
    }).length || 0;

    return morningCount >= targetCount;
  }

  private async checkEveningWorkouts(targetCount: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId);

    const eveningCount = sessions?.filter(session => {
      const hour = new Date(session.completed_at || '').getHours();
      return hour >= 19; // 7 PM or later
    }).length || 0;

    return eveningCount >= targetCount;
  }

  private async checkWeekendWorkouts(targetCount: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId);

    const weekendCount = sessions?.filter(session => {
      const day = new Date(session.completed_at || '').getDay();
      return day === 0 || day === 6; // Sunday or Saturday
    }).length || 0;

    return weekendCount >= targetCount;
  }

  private async checkTotalTime(targetSeconds: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', this.userId);

    const totalDuration = sessions?.reduce((sum, session) => sum + session.duration_seconds, 0) || 0;
    return totalDuration >= targetSeconds;
  }

  private async checkImprovementAchievement(targetImprovement: number, conditions?: any, sessionData?: any): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds, completed_at')
      .eq('user_id', this.userId)
      .order('completed_at', { ascending: true });

    if (!sessions || sessions.length < 2) return false;

    const firstSession = sessions[0].duration_seconds;
    const currentSession = sessionData?.duration_seconds || sessions[sessions.length - 1].duration_seconds;
    const improvement = currentSession - firstSession;

    if (conditions?.improvement_threshold === 100) {
      // Double down achievement - check if current is at least double the first
      return currentSession >= firstSession * 2;
    }

    return improvement >= targetImprovement;
  }

  private async awardAchievement(achievement: ExpandedAchievement): Promise<UserAchievement | null> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: this.userId,
          achievement_type: achievement.category,
          achievement_name: achievement.name,
          description: achievement.description,
          category: achievement.category,
          rarity: achievement.rarity,
          points: achievement.points,
          metadata: {
            icon: achievement.icon,
            badge_color: achievement.badge_color,
            unlock_message: achievement.unlock_message,
            share_message: achievement.share_message
          }
        })
        .select()
        .single();

      if (error) {
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

  static getAchievementByName(name: string): ExpandedAchievement | undefined {
    return EXPANDED_ACHIEVEMENTS.find(a => a.name === name);
  }

  static getAchievementsByCategory(category: string): ExpandedAchievement[] {
    if (category === 'all') return EXPANDED_ACHIEVEMENTS;
    return EXPANDED_ACHIEVEMENTS.filter(a => a.category === category);
  }

  static getRarityColor(rarity: ExpandedAchievement['rarity']): string {
    const colors = {
      common: 'text-gray-600 bg-gray-100 border-gray-200',
      uncommon: 'text-green-600 bg-green-100 border-green-200',
      rare: 'text-blue-600 bg-blue-100 border-blue-200',
      epic: 'text-purple-600 bg-purple-100 border-purple-200',
      legendary: 'text-yellow-600 bg-yellow-100 border-yellow-200'
    };
    return colors[rarity];
  }

  static getRarityGlow(rarity: ExpandedAchievement['rarity']): string {
    const glows = {
      common: '',
      uncommon: 'shadow-green-200/50',
      rare: 'shadow-blue-200/50', 
      epic: 'shadow-purple-200/50',
      legendary: 'shadow-yellow-200/50 shadow-lg'
    };
    return glows[rarity];
  }
}
