
import { supabase } from '@/integrations/supabase/client';

export interface Friend {
  id: string;
  user_id: string;
  friend_user_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  accepted_at?: string;
}

export interface FriendProfile {
  id: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  current_level: number;
  current_streak: number;
  total_workouts: number;
  is_online: boolean;
  last_workout?: string;
  privacy_settings: {
    show_workouts: boolean;
    show_achievements: boolean;
    show_streak: boolean;
  };
}

export interface FriendActivity {
  id: string;
  user_id: string;
  activity_type: 'workout' | 'achievement' | 'level_up' | 'streak_milestone';
  activity_data: any;
  created_at: string;
  users: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  friend_reactions: FriendReaction[];
}

export interface FriendReaction {
  id: string;
  user_id: string;
  activity_id: string;
  reaction_type: 'cheer' | 'fire' | 'strong' | 'clap';
  created_at: string;
}

export class FriendSystemManager {
  async searchUsers(query: string, currentUserId: string): Promise<FriendProfile[]> {
    if (query.length < 2) return [];

    try {
      const { data: users } = await supabase
        .from('users')
        .select('id, username, full_name, avatar_url, current_level')
        .or(`username.ilike.%${query}%,full_name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', currentUserId)
        .limit(10);

      if (!users) return [];

      // Get additional stats for each user
      const userProfiles = await Promise.all(
        users.map(async (user) => {
          const stats = await this.getUserStats(user.id);
          return {
            ...user,
            username: user.username || '',
            full_name: user.full_name || '',
            ...stats,
            is_online: false, // Default for now
            privacy_settings: {
              show_workouts: true,
              show_achievements: true,
              show_streak: true
            }
          };
        })
      );

      return userProfiles;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }

  async sendFriendRequest(userId: string, targetUserId: string): Promise<boolean> {
    try {
      // Check if friendship already exists
      const { data: existingFriendship } = await supabase
        .from('friends')
        .select('id')
        .or(`and(user_id.eq.${userId},friend_user_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_user_id.eq.${userId})`)
        .maybeSingle();

      if (existingFriendship) {
        throw new Error('Friendship already exists or request pending');
      }

      // Create friend request
      const { error } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_user_id: targetUserId,
          status: 'pending'
        });

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ 
          status: 'accepted', 
          accepted_at: new Date().toISOString() 
        })
        .eq('id', requestId)
        .eq('friend_user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  async declineFriendRequest(userId: string, requestId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId)
        .eq('friend_user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw error;
    }
  }

  async getFriendsList(userId: string): Promise<FriendProfile[]> {
    try {
      // Get accepted friendships
      const { data: friendships } = await supabase
        .from('friends')
        .select(`
          *,
          friend_user:users!friends_friend_user_id_fkey(id, username, full_name, avatar_url, current_level),
          user:users!friends_user_id_fkey(id, username, full_name, avatar_url, current_level)
        `)
        .or(`user_id.eq.${userId},friend_user_id.eq.${userId}`)
        .eq('status', 'accepted');

      if (!friendships) return [];

      // Get friend profiles with stats
      const friendProfiles = await Promise.all(
        friendships.map(async (friendship: any) => {
          const friend = friendship.user_id === userId ? friendship.friend_user : friendship.user;
          const stats = await this.getUserStats(friend.id);
          
          return {
            ...friend,
            username: friend.username || '',
            full_name: friend.full_name || '',
            ...stats,
            is_online: false, // Default for now
            privacy_settings: {
              show_workouts: true,
              show_achievements: true,
              show_streak: true
            }
          };
        })
      );

      return friendProfiles;
    } catch (error) {
      console.error('Error getting friends list:', error);
      return [];
    }
  }

  async getPendingRequests(userId: string): Promise<any[]> {
    try {
      const { data: requests } = await supabase
        .from('friends')
        .select(`
          *,
          requester:users!friends_user_id_fkey(id, username, full_name, avatar_url, current_level)
        `)
        .eq('friend_user_id', userId)
        .eq('status', 'pending');

      return requests?.map(request => ({
        ...request,
        requester: {
          ...request.requester,
          username: request.requester?.username || '',
          full_name: request.requester?.full_name || ''
        }
      })) || [];
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return [];
    }
  }

  async getFriendActivities(userId: string): Promise<FriendActivity[]> {
    try {
      // For now, return empty array until activities table is properly set up
      console.log('Getting friend activities for user:', userId);
      return [];
    } catch (error) {
      console.error('Error getting friend activities:', error);
      return [];
    }
  }

  async addReaction(userId: string, activityId: string, reactionType: string): Promise<void> {
    try {
      console.log('Adding reaction:', { userId, activityId, reactionType });
      // Placeholder for now
    } catch (error) {
      console.error('Error adding reaction:', error);
      throw error;
    }
  }

  async removeReaction(userId: string, activityId: string): Promise<void> {
    try {
      console.log('Removing reaction:', { userId, activityId });
      // Placeholder for now
    } catch (error) {
      console.error('Error removing reaction:', error);
      throw error;
    }
  }

  async createActivity(userId: string, activityType: string, activityData: any): Promise<void> {
    try {
      console.log('Creating activity:', { userId, activityType, activityData });
      // Placeholder for now
    } catch (error) {
      console.error('Error creating activity:', error);
      throw error;
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${userId},friend_user_id.eq.${friendId}),and(user_id.eq.${friendId},friend_user_id.eq.${userId})`);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
      throw error;
    }
  }

  private async getUserStats(userId: string) {
    try {
      // Get current streak
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('current_streak')
        .eq('user_id', userId)
        .maybeSingle();

      // Get total workouts
      const { count: totalWorkouts } = await supabase
        .from('user_sessions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId);

      // Get last workout
      const { data: lastWorkout } = await supabase
        .from('user_sessions')
        .select('completed_at')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      return {
        current_streak: streakData?.current_streak || 0,
        total_workouts: totalWorkouts || 0,
        last_workout: lastWorkout?.completed_at
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      return {
        current_streak: 0,
        total_workouts: 0,
        last_workout: undefined
      };
    }
  }
}

export const friendSystemManager = new FriendSystemManager();
