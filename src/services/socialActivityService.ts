import { supabase } from '@/integrations/supabase/client';

export interface EnhancedActivity {
  id: string;
  user_id: string;
  activity_type: 'workout' | 'achievement' | 'level_up' | 'streak_milestone' | 'personal_best' | 'challenge_complete' | 'weekly_goal';
  activity_data: ActivityData;
  created_at: string;
  visibility: 'public' | 'friends' | 'private';
  shares_count: number;
  cheer_count: number;
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
  
  // Weekly goal activity
  workouts_completed?: number;
  goal_target?: number;
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
  async createWorkoutActivity(userId: string, sessionData: any, visibility?: 'public' | 'friends' | 'private'): Promise<void> {
    const activityData: ActivityData = {
      exercise_name: sessionData.exercise_name || sessionData.exercise || 'Workout',
      duration: sessionData.duration_seconds || sessionData.duration || 30,
      difficulty_level: sessionData.difficulty_level || 1,
      calories_burned: this.calculateCalories(sessionData),
      custom_message: sessionData.customMessage,
      post_type: sessionData.postType || 'auto_generated'
    };
    
    await this.createActivity(userId, 'workout', activityData, visibility);
  }
  
  async createAchievementActivity(userId: string, achievement: any, visibility?: 'public' | 'friends' | 'private'): Promise<void> {
    const activityData: ActivityData = {
      achievement_name: achievement.achievement_name || achievement.name,
      achievement_description: achievement.description || 'Great achievement!',
      achievement_rarity: achievement.rarity || 'common'
    };
    
    await this.createActivity(userId, 'achievement', activityData, visibility);
  }

  async createLevelUpActivity(userId: string, levelData: any, visibility?: 'public' | 'friends' | 'private'): Promise<void> {
    const activityData: ActivityData = {
      old_level: levelData.old_level || 1,
      new_level: levelData.new_level || 2,
      new_title: levelData.new_title || `Level ${levelData.new_level}`
    };
    
    await this.createActivity(userId, 'level_up', activityData, visibility);
  }

  async createPersonalBestActivity(userId: string, exerciseId: string, newBest: number, previousBest: number, visibility?: 'public' | 'friends' | 'private'): Promise<void> {
    const exerciseName = await this.getExerciseName(exerciseId);
    const activityData: ActivityData = {
      exercise_name: exerciseName,
      previous_best: previousBest,
      new_best: newBest,
      improvement: newBest - previousBest
    };
    
    await this.createActivity(userId, 'personal_best', activityData, visibility);
  }

  async createStreakMilestoneActivity(userId: string, streakData: any, visibility?: 'public' | 'friends' | 'private'): Promise<void> {
    const activityData: ActivityData = {
      streak_length: streakData.streak_length,
      streak_type: streakData.streak_type || 'daily'
    };
    
    await this.createActivity(userId, 'streak_milestone', activityData, visibility);
  }

  async createWeeklyGoalActivity(userId: string, goalData: any, visibility?: 'public' | 'friends' | 'private'): Promise<void> {
    const activityData: ActivityData = {
      workouts_completed: goalData.workouts_completed,
      goal_target: goalData.goal_target || 5
    };
    
    await this.createActivity(userId, 'weekly_goal', activityData, visibility);
  }
  
  private async createActivity(userId: string, type: string, data: ActivityData, visibility?: 'public' | 'friends' | 'private'): Promise<void> {
    try {
      // If visibility is explicitly provided, use it
      let finalVisibility = visibility || 'friends';
      
      // Otherwise, get from privacy settings
      if (!visibility) {
        try {
          const { data: privacySettings } = await supabase
            .from('privacy_settings')
            .select('activity_visibility')
            .eq('user_id', userId)
            .single();
          
          if (privacySettings?.activity_visibility) {
            // Map privacy settings to activity visibility
            const visibilityMap = {
              'public': 'public',
              'friends_only': 'friends',
              'private': 'private'
            } as const;
            finalVisibility = visibilityMap[privacySettings.activity_visibility as keyof typeof visibilityMap] || 'friends';
          }
        } catch (error) {
          console.log('Could not fetch privacy settings, using default visibility');
        }
      }
      
      // Use direct database insert
      const { error } = await supabase
        .from('friend_activities')
        .insert({
          user_id: userId,
          activity_type: type,
          activity_data: data as any,
          visibility: finalVisibility
        });

      if (error) {
        console.error('Error creating activity:', error);
        throw error;
      }

      console.log('[SocialActivityManager] Activity created successfully:', {
        user_id: userId,
        activity_type: type,
        visibility: finalVisibility
      });
    } catch (error) {
      console.error('Error creating activity:', error);
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

  async getFriendActivities(userId: string): Promise<EnhancedActivity[]> {
    try {
      // Get user's friends
      const { data: friendships, error: friendsError } = await supabase
        .from('friends')
        .select('user_id, friend_id')
        .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      // Get friend IDs
      const friendIds = friendships?.map(f => 
        f.user_id === userId ? f.friend_id : f.user_id
      ) || [];

      if (friendIds.length === 0) {
        return [];
      }

      // Fetch activities from friends with privacy filtering
      // Only show activities that are:
      // 1. Public (visible to everyone)
      // 2. Friends-only AND the viewer is a friend of the activity owner
      const { data: activities, error: activitiesError } = await supabase
        .from('friend_activities')
        .select(`
          *,
          users:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .in('user_id', friendIds)
        .in('activity_type', ['workout', 'achievement', 'weekly_goal', 'level_up'])
        .in('visibility', ['public', 'friends']) // Exclude private activities
        .order('created_at', { ascending: false })
        .limit(50);

      if (activitiesError) throw activitiesError;

      return (activities || []).map(activity => ({
        ...activity,
        users: Array.isArray(activity.users) ? activity.users[0] : activity.users,
        friend_reactions: [],
        activity_comments: [],
        cheer_count: activity.cheer_count || 0
      })) as EnhancedActivity[];
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
