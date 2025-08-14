
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedActivity {
  id: string;
  user_id: string;
  activity_type: 'workout' | 'achievement' | 'level_up' | 'streak_milestone' | 'personal_best' | 'challenge_complete';
  activity_data: ActivityData;
  created_at: string;
  visibility: 'public' | 'friends' | 'private';
  shares_count: number;
  users: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  friend_reactions: ActivityReaction[];
  activity_comments: ActivityComment[];
}

export interface ActivityData {
  // Workout activity
  exercise_name?: string;
  duration?: number;
  difficulty_level?: number;
  calories_burned?: number;
  
  // Achievement activity
  achievement_name?: string;
  achievement_description?: string;
  achievement_rarity?: string;
  
  // Level up activity
  old_level?: number;
  new_level?: number;
  new_title?: string;
  
  // Streak milestone
  streak_length?: number;
  streak_type?: string;
  
  // Personal best
  previous_best?: number;
  new_best?: number;
  improvement?: number;
  
  // Challenge activity
  challenge_name?: string;
  challenge_type?: string;
  completion_time?: number;
}

export interface ActivityComment {
  id: string;
  user_id: string;
  activity_id: string;
  content: string;
  created_at: string;
  users: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ActivityReaction {
  id: string;
  user_id: string;
  activity_id: string;
  reaction_type: 'cheer' | 'fire' | 'strong' | 'clap' | 'heart';
  created_at: string;
}

export interface ActivityFilters {
  type: 'all' | 'workout' | 'achievement' | 'level_up' | 'streak_milestone' | 'personal_best';
  timeframe: 'today' | 'week' | 'month' | 'all';
  friends: 'all' | string[];
}

export class SocialActivityManager {
  async createWorkoutActivity(userId: string, sessionData: any): Promise<void> {
    const activityData: ActivityData = {
      exercise_name: sessionData.exercise_name || 'Workout',
      duration: sessionData.duration_seconds || 30,
      difficulty_level: sessionData.difficulty_level || 1,
      calories_burned: this.calculateCalories(sessionData)
    };
    
    await this.createActivity(userId, 'workout', activityData);
  }
  
  async createAchievementActivity(userId: string, achievement: any): Promise<void> {
    const activityData: ActivityData = {
      achievement_name: achievement.achievement_name || achievement.name,
      achievement_description: achievement.description || 'Great achievement!',
      achievement_rarity: achievement.rarity || 'common'
    };
    
    await this.createActivity(userId, 'achievement', activityData);
  }

  async createLevelUpActivity(userId: string, levelData: any): Promise<void> {
    const activityData: ActivityData = {
      old_level: levelData.old_level || 1,
      new_level: levelData.new_level || 2,
      new_title: levelData.new_title || `Level ${levelData.new_level}`
    };
    
    await this.createActivity(userId, 'level_up', activityData);
  }

  async createPersonalBestActivity(userId: string, exerciseId: string, newBest: number, previousBest: number): Promise<void> {
    const exerciseName = await this.getExerciseName(exerciseId);
    const activityData: ActivityData = {
      exercise_name: exerciseName,
      previous_best: previousBest,
      new_best: newBest,
      improvement: newBest - previousBest
    };
    
    await this.createActivity(userId, 'personal_best', activityData);
  }

  async createStreakMilestoneActivity(userId: string, streakData: any): Promise<void> {
    const activityData: ActivityData = {
      streak_length: streakData.streak_length,
      streak_type: streakData.streak_type || 'daily'
    };
    
    await this.createActivity(userId, 'streak_milestone', activityData);
  }
  
  private async createActivity(userId: string, type: string, data: ActivityData): Promise<void> {
    try {
      // Get user's privacy settings
      const { data: user } = await supabase
        .from('users')
        .select('privacy_settings')
        .eq('id', userId)
        .single();
      
      const visibility = this.determineVisibility(type, user?.privacy_settings || {});
      
      await supabase
        .from('friend_activities')
        .insert({
          user_id: userId,
          activity_type: type,
          activity_data: data,
          visibility: visibility
        });
    } catch (error) {
      console.error('Error creating activity:', error);
    }
  }
  
  private determineVisibility(activityType: string, privacySettings: any): string {
    const defaultSettings = {
      show_workouts: true,
      show_achievements: true,
      show_streak: true,
      show_level_ups: true,
      show_personal_bests: true
    };
    
    const settings = { ...defaultSettings, ...privacySettings };
    
    switch (activityType) {
      case 'workout':
        return settings.show_workouts ? 'friends' : 'private';
      case 'achievement':
        return settings.show_achievements ? 'friends' : 'private';
      case 'streak_milestone':
        return settings.show_streak ? 'friends' : 'private';
      case 'level_up':
        return settings.show_level_ups ? 'friends' : 'private';
      case 'personal_best':
        return settings.show_personal_bests ? 'friends' : 'private';
      default:
        return 'friends';
    }
  }

  private calculateCalories(sessionData: any): number {
    const baseCaloriesPerMinute = 3.5;
    const durationMinutes = (sessionData.duration_seconds || 30) / 60;
    const difficultyMultiplier = 1 + ((sessionData.difficulty_level || 1) - 1) * 0.2;
    
    return Math.round(baseCaloriesPerMinute * durationMinutes * difficultyMultiplier);
  }

  private async getExerciseName(exerciseId: string): Promise<string> {
    try {
      const { data: exercise } = await supabase
        .from('plank_exercises')
        .select('name')
        .eq('id', exerciseId)
        .single();
      
      return exercise?.name || 'Exercise';
    } catch (error) {
      console.error('Error getting exercise name:', error);
      return 'Exercise';
    }
  }

  async getFriendActivities(userId: string, filters: ActivityFilters = { type: 'all', timeframe: 'week', friends: 'all' }): Promise<EnhancedActivity[]> {
    try {
      let query = supabase
        .from('friend_activities')
        .select(`
          *,
          users!friend_activities_user_id_fkey (id, username, full_name, avatar_url),
          friend_reactions (*),
          activity_comments (
            *,
            users!activity_comments_user_id_fkey (id, username, full_name, avatar_url)
          )
        `)
        .neq('visibility', 'private')
        .order('created_at', { ascending: false });
      
      // Apply filters
      if (filters.type !== 'all') {
        query = query.eq('activity_type', filters.type);
      }
      
      if (filters.timeframe !== 'all') {
        const timeframeDays = {
          'today': 1,
          'week': 7,
          'month': 30
        };
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - timeframeDays[filters.timeframe]);
        query = query.gte('created_at', cutoffDate.toISOString());
      }
      
      const { data, error } = await query.limit(50);
      
      if (error) {
        console.error('Error loading activities:', error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error('Error getting friend activities:', error);
      return [];
    }
  }

  async addComment(userId: string, activityId: string, content: string): Promise<void> {
    try {
      await supabase
        .from('activity_comments')
        .insert({
          user_id: userId,
          activity_id: activityId,
          content
        });
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async addReaction(userId: string, activityId: string, reactionType: string): Promise<void> {
    try {
      await supabase
        .from('friend_reactions')
        .upsert({
          user_id: userId,
          activity_id: activityId,
          reaction_type: reactionType
        });
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  async removeReaction(userId: string, activityId: string): Promise<void> {
    try {
      await supabase
        .from('friend_reactions')
        .delete()
        .eq('user_id', userId)
        .eq('activity_id', activityId);
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  async incrementShareCount(activityId: string): Promise<void> {
    try {
      await supabase
        .from('friend_activities')
        .update({ shares_count: supabase.sql`shares_count + 1` })
        .eq('id', activityId);
    } catch (error) {
      console.error('Error incrementing share count:', error);
    }
  }
}

export const socialActivityManager = new SocialActivityManager();
