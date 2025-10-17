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
  custom_message?: string;
  post_type?: string;
  
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
      exercise_name: sessionData.exercise_name || sessionData.exercise || 'Workout',
      duration: sessionData.duration_seconds || sessionData.duration || 30,
      difficulty_level: sessionData.difficulty_level || 1,
      calories_burned: this.calculateCalories(sessionData),
      custom_message: sessionData.customMessage,
      post_type: sessionData.postType || 'auto_generated'
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
      // Get user's privacy settings with fallback - handle column not existing
      let visibility = 'friends'; // default visibility
      
      try {
        // Try to get privacy settings, but handle gracefully if column doesn't exist
        const userQuery = supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
        
        const { data: user } = await userQuery;
        
        // Check if user data exists and has privacy_settings property
        if (user && 'privacy_settings' in user && user.privacy_settings) {
          visibility = this.determineVisibility(type, user.privacy_settings);
        }
      } catch (error) {
        console.log('Privacy settings not available yet, using default visibility');
      }
      
      // Use direct database insert now that tables exist
      const { error } = await supabase
        .from('friend_activities')
        .insert({
          user_id: userId,
          activity_type: type,
          activity_data: data as any, // Cast to satisfy JSON type requirements
          visibility: visibility
        });

      if (error) {
        console.error('Error creating activity:', error);
        throw error;
      }

      console.log('[SocialActivityManager] Activity created successfully:', {
        user_id: userId,
        activity_type: type,
        visibility
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
        .from('exercises')
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
      // For now, return mock data until the tables are properly synced
      const mockActivities: EnhancedActivity[] = [
        {
          id: '1',
          user_id: 'user1',
          activity_type: 'workout',
          activity_data: {
            exercise_name: 'Standard Plank',
            duration: 60,
            difficulty_level: 2,
            calories_burned: 8
          },
          created_at: new Date().toISOString(),
          visibility: 'friends',
          shares_count: 0,
          users: {
            id: 'user1',
            username: 'fitness_buddy',
            full_name: 'Fitness Buddy',
            avatar_url: undefined
          },
          friend_reactions: [],
          activity_comments: []
        },
        {
          id: '2',
          user_id: 'user2',
          activity_type: 'achievement',
          activity_data: {
            achievement_name: 'First Week Complete',
            achievement_description: 'Completed your first week of workouts!',
            achievement_rarity: 'common'
          },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          visibility: 'friends',
          shares_count: 2,
          users: {
            id: 'user2',
            username: 'champion',
            full_name: 'Workout Champion',
            avatar_url: undefined
          },
          friend_reactions: [
            {
              id: 'reaction1',
              user_id: userId,
              activity_id: '2',
              reaction_type: 'cheer',
              created_at: new Date().toISOString()
            }
          ],
          activity_comments: [
            {
              id: 'comment1',
              user_id: userId,
              activity_id: '2',
              content: 'Great work! Keep it up! 💪',
              created_at: new Date().toISOString(),
              users: {
                id: userId,
                username: 'you',
                full_name: 'You',
                avatar_url: undefined
              }
            }
          ]
        }
      ];

      return mockActivities;
    } catch (error) {
      console.error('Error getting friend activities:', error);
      return [];
    }
  }

  async addComment(userId: string, activityId: string, content: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('activity_comments')
        .insert({
          user_id: userId,
          activity_id: activityId,
          content
        });
        
      if (error) {
        console.error('Error adding comment:', error);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  }

  async addReaction(userId: string, activityId: string, reactionType: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('friend_reactions')
        .upsert({
          user_id: userId,
          activity_id: activityId,
          reaction_type: reactionType
        });
        
      if (error) {
        console.error('Error adding reaction:', error);
      }
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  async removeReaction(userId: string, activityId: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('friend_reactions')
        .delete()
        .eq('user_id', userId)
        .eq('activity_id', activityId);
        
      if (error) {
        console.error('Error removing reaction:', error);
      }
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  async incrementShareCount(activityId: string): Promise<void> {
    try {
      const { error } = await (supabase as any)
        .from('friend_activities')
        .update({ shares_count: (supabase as any).sql`shares_count + 1` })
        .eq('id', activityId);
        
      if (error) {
        console.error('Error incrementing share count:', error);
      }
    } catch (error) {
      console.error('Error incrementing share count:', error);
    }
  }
}

export const socialActivityManager = new SocialActivityManager();
