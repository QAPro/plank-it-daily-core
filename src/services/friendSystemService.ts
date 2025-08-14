
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

    const { data: users } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url, current_level, is_online')
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
          ...stats,
          privacy_settings: {
            show_workouts: true,
            show_achievements: true,
            show_streak: true
          }
        };
      })
    );

    return userProfiles;
  }

  async sendFriendRequest(userId: string, targetUserId: string): Promise<boolean> {
    // Check if friendship already exists using raw query since table types aren't updated yet
    const { data: existingFriendship } = await supabase
      .rpc('check_existing_friendship', { user1: userId, user2: targetUserId })
      .single();

    if (existingFriendship) {
      throw new Error('Friendship already exists or request pending');
    }

    // Create friend request using raw query
    const { error } = await supabase
      .rpc('send_friend_request', { sender_id: userId, receiver_id: targetUserId });

    if (error) throw error;
    return true;
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<boolean> {
    // Use raw query since types aren't updated
    const { error } = await supabase
      .rpc('accept_friend_request', { user_id: userId, request_id: requestId });

    if (error) throw error;
    return true;
  }

  async declineFriendRequest(userId: string, requestId: string): Promise<boolean> {
    // Use raw query since types aren't updated
    const { error } = await supabase
      .rpc('decline_friend_request', { user_id: userId, request_id: requestId });

    if (error) throw error;
    return true;
  }

  async getFriendsList(userId: string): Promise<FriendProfile[]> {
    // Use raw query to get friends
    const { data: friends } = await supabase
      .rpc('get_friends_list', { user_id: userId });

    if (!friends) return [];

    // Get additional stats for each friend
    const friendProfiles = await Promise.all(
      friends.map(async (friend: any) => {
        const stats = await this.getUserStats(friend.id);
        return {
          ...friend,
          ...stats,
          privacy_settings: {
            show_workouts: true,
            show_achievements: true,
            show_streak: true
          }
        };
      })
    );

    return friendProfiles;
  }

  async getPendingRequests(userId: string): Promise<any[]> {
    // Use raw query to get pending requests
    const { data: requests } = await supabase
      .rpc('get_pending_requests', { user_id: userId });

    return requests || [];
  }

  async getFriendActivities(userId: string): Promise<FriendActivity[]> {
    // Use raw query to get friend activities
    const { data: activities } = await supabase
      .rpc('get_friend_activities', { user_id: userId });

    return activities || [];
  }

  async addReaction(userId: string, activityId: string, reactionType: string): Promise<void> {
    const { error } = await supabase
      .rpc('add_reaction', { 
        user_id: userId, 
        activity_id: activityId, 
        reaction_type: reactionType 
      });

    if (error) throw error;
  }

  async removeReaction(userId: string, activityId: string): Promise<void> {
    const { error } = await supabase
      .rpc('remove_reaction', { user_id: userId, activity_id: activityId });

    if (error) throw error;
  }

  async createActivity(userId: string, activityType: string, activityData: any): Promise<void> {
    const { error } = await supabase
      .rpc('create_activity', { 
        user_id: userId, 
        activity_type: activityType, 
        activity_data: activityData 
      });

    if (error) throw error;
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    const { error } = await supabase
      .rpc('remove_friend', { user_id: userId, friend_id: friendId });

    if (error) throw error;
    return true;
  }

  private async getUserStats(userId: string) {
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
  }
}

export const friendSystemManager = new FriendSystemManager();
