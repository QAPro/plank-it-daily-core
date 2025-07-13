
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

type UserSession = Tables<'user_sessions'>;
type UserStreak = Tables<'user_streaks'>;
type UserAchievement = Tables<'user_achievements'>;

export interface Achievement {
  id: string;
  type: 'streak' | 'duration' | 'consistency' | 'progress';
  name: string;
  description: string;
  icon: string;
  condition: {
    type: 'streak_days' | 'total_duration' | 'session_duration' | 'weekly_consistency' | 'monthly_sessions' | 'improvement';
    value: number;
    period?: 'week' | 'month';
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  points: number;
}

// Achievement definitions
export const ACHIEVEMENTS: Achievement[] = [
  // Streak Achievements
  {
    id: 'first_day',
    type: 'streak',
    name: 'First Step',
    description: 'Complete your first plank session',
    icon: '🌱',
    condition: { type: 'streak_days', value: 1 },
    rarity: 'common',
    points: 10
  },
  {
    id: 'three_day_streak',
    type: 'streak',
    name: 'Getting Started',
    description: 'Maintain a 3-day streak',
    icon: '🔥',
    condition: { type: 'streak_days', value: 3 },
    rarity: 'common',
    points: 25
  },
  {
    id: 'week_warrior',
    type: 'streak',
    name: 'Week Warrior',
    description: 'Complete a 7-day streak',
    icon: '⚔️',
    condition: { type: 'streak_days', value: 7 },
    rarity: 'rare',
    points: 50
  },
  {
    id: 'two_week_champion',
    type: 'streak',
    name: 'Two Week Champion',
    description: 'Achieve a 14-day streak',
    icon: '🏆',
    condition: { type: 'streak_days', value: 14 },
    rarity: 'rare',
    points: 100
  },
  {
    id: 'monthly_master',
    type: 'streak',
    name: 'Monthly Master',
    description: 'Complete a 30-day streak',
    icon: '👑',
    condition: { type: 'streak_days', value: 30 },
    rarity: 'epic',
    points: 250
  },
  {
    id: 'unstoppable',
    type: 'streak',
    name: 'Unstoppable',
    description: 'Achieve a 60-day streak',
    icon: '🌟',
    condition: { type: 'streak_days', value: 60 },
    rarity: 'epic',
    points: 500
  },
  {
    id: 'century_club',
    type: 'streak',
    name: 'Century Club',
    description: 'Reach 100 consecutive days',
    icon: '💎',
    condition: { type: 'streak_days', value: 100 },
    rarity: 'legendary',
    points: 1000
  },

  // Duration Achievements
  {
    id: 'minute_master',
    type: 'duration',
    name: 'Minute Master',
    description: 'Hold a plank for 60 seconds',
    icon: '⏱️',
    condition: { type: 'session_duration', value: 60 },
    rarity: 'common',
    points: 20
  },
  {
    id: 'two_minute_titan',
    type: 'duration',
    name: 'Two Minute Titan',
    description: 'Hold a plank for 2 minutes',
    icon: '💪',
    condition: { type: 'session_duration', value: 120 },
    rarity: 'rare',
    points: 75
  },
  {
    id: 'iron_core',
    type: 'duration',
    name: 'Iron Core',
    description: 'Hold a plank for 5 minutes',
    icon: '🛡️',
    condition: { type: 'session_duration', value: 300 },
    rarity: 'epic',
    points: 200
  },
  {
    id: 'plank_legend',
    type: 'duration',
    name: 'Plank Legend',
    description: 'Hold a plank for 10 minutes',
    icon: '🦾',
    condition: { type: 'session_duration', value: 600 },
    rarity: 'legendary',
    points: 500
  },
  {
    id: 'total_hour',
    type: 'duration',
    name: 'Hour of Power',
    description: 'Complete 1 hour of total plank time',
    icon: '⚡',
    condition: { type: 'total_duration', value: 3600 },
    rarity: 'rare',
    points: 100
  },
  {
    id: 'total_ten_hours',
    type: 'duration',
    name: 'Dedication',
    description: 'Complete 10 hours of total plank time',
    icon: '🎯',
    condition: { type: 'total_duration', value: 36000 },
    rarity: 'epic',
    points: 300
  },

  // Consistency Achievements
  {
    id: 'perfect_week',
    type: 'consistency',
    name: 'Perfect Week',
    description: 'Complete 7 sessions in one week',
    icon: '📅',
    condition: { type: 'weekly_consistency', value: 7, period: 'week' },
    rarity: 'rare',
    points: 75
  },
  {
    id: 'monthly_champion',
    type: 'consistency',
    name: 'Monthly Champion',
    description: 'Complete 20 sessions in one month',
    icon: '🗓️',
    condition: { type: 'monthly_sessions', value: 20, period: 'month' },
    rarity: 'epic',
    points: 200
  },

  // Progress Achievements
  {
    id: 'first_improvement',
    type: 'progress',
    name: 'Getting Stronger',
    description: 'Improve your personal best by 10 seconds',
    icon: '📈',
    condition: { type: 'improvement', value: 10 },
    rarity: 'common',
    points: 30
  },
  {
    id: 'major_improvement',
    type: 'progress',
    name: 'Major Progress',
    description: 'Improve your personal best by 60 seconds',
    icon: '🚀',
    condition: { type: 'improvement', value: 60 },
    rarity: 'rare',
    points: 100
  }
];

export class AchievementService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  async checkAchievements(): Promise<UserAchievement[]> {
    console.log('Checking achievements for user:', this.userId);
    
    const newAchievements: UserAchievement[] = [];
    
    // Get existing achievements to avoid duplicates
    const { data: existingAchievements } = await supabase
      .from('user_achievements')
      .select('achievement_name')
      .eq('user_id', this.userId);

    const existingNames = new Set(existingAchievements?.map(a => a.achievement_name) || []);

    // Check each achievement
    for (const achievement of ACHIEVEMENTS) {
      if (existingNames.has(achievement.name)) continue;

      const earned = await this.checkSingleAchievement(achievement);
      if (earned) {
        const newAchievement = await this.awardAchievement(achievement);
        if (newAchievement) {
          newAchievements.push(newAchievement);
        }
      }
    }

    return newAchievements;
  }

  private async checkSingleAchievement(achievement: Achievement): Promise<boolean> {
    switch (achievement.condition.type) {
      case 'streak_days':
        return this.checkStreakAchievement(achievement.condition.value);
      
      case 'session_duration':
        return this.checkSessionDurationAchievement(achievement.condition.value);
      
      case 'total_duration':
        return this.checkTotalDurationAchievement(achievement.condition.value);
      
      case 'weekly_consistency':
        return this.checkWeeklyConsistencyAchievement(achievement.condition.value);
      
      case 'monthly_sessions':
        return this.checkMonthlySessionsAchievement(achievement.condition.value);
      
      case 'improvement':
        return this.checkImprovementAchievement(achievement.condition.value);
      
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
      .gte('duration_seconds', targetSeconds);

    return (sessions?.length || 0) > 0;
  }

  private async checkTotalDurationAchievement(targetSeconds: number): Promise<boolean> {
    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('duration_seconds')
      .eq('user_id', this.userId);

    const totalDuration = sessions?.reduce((sum, session) => sum + session.duration_seconds, 0) || 0;
    return totalDuration >= targetSeconds;
  }

  private async checkWeeklyConsistencyAchievement(targetSessions: number): Promise<boolean> {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId)
      .gte('completed_at', startOfWeek.toISOString());

    return (sessions?.length || 0) >= targetSessions;
  }

  private async checkMonthlySessionsAchievement(targetSessions: number): Promise<boolean> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { data: sessions } = await supabase
      .from('user_sessions')
      .select('completed_at')
      .eq('user_id', this.userId)
      .gte('completed_at', startOfMonth.toISOString());

    return (sessions?.length || 0) >= targetSessions;
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

  private async awardAchievement(achievement: Achievement): Promise<UserAchievement | null> {
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .insert({
          user_id: this.userId,
          achievement_type: achievement.type,
          achievement_name: achievement.name,
          description: achievement.description,
          metadata: {
            icon: achievement.icon,
            rarity: achievement.rarity,
            points: achievement.points,
            condition: achievement.condition
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

  static getAchievementByName(name: string): Achievement | undefined {
    return ACHIEVEMENTS.find(a => a.name === name);
  }

  static getRarityColor(rarity: Achievement['rarity']): string {
    const colors = {
      common: 'text-gray-600 bg-gray-100',
      rare: 'text-blue-600 bg-blue-100',
      epic: 'text-purple-600 bg-purple-100',
      legendary: 'text-yellow-600 bg-yellow-100'
    };
    return colors[rarity];
  }
}
