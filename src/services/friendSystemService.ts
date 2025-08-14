
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
      .select('id, username, full_name, avatar_url, current_level, privacy_settings, is_online, last_seen')
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
          privacy_settings: user.privacy_settings || {
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
    // Check if friendship already exists
    const { data: existingFriendship } = await supabase
      .from('friends')
      .select('*')
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
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<boolean> {
    // Update the original request
    const { error: updateError } = await supabase
      .from('friends')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', requestId)
      .eq('friend_user_id', userId);

    if (updateError) throw updateError;

    // Get the original request details
    const { data: originalRequest } = await supabase
      .from('friends')
      .select('user_id')
      .eq('id', requestId)
      .single();

    if (!originalRequest) throw new Error('Request not found');

    // Create reciprocal friendship
    const { error: insertError } = await supabase
      .from('friends')
      .insert({
        user_id: userId,
        friend_user_id: originalRequest.user_id,
        status: 'accepted',
        accepted_at: new Date().toISOString()
      });

    if (insertError) throw insertError;
    return true;
  }

  async declineFriendRequest(userId: string, requestId: string): Promise<boolean> {
    const { error } = await supabase
      .from('friends')
      .delete()
      .eq('id', requestId)
      .eq('friend_user_id', userId);

    if (error) throw error;
    return true;
  }

  async getFriendsList(userId: string): Promise<FriendProfile[]> {
    const { data: friends } = await supabase
      .from('friends')
      .select(`
        friend_user_id,
        users!friends_friend_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url,
          current_level,
          privacy_settings,
          is_online,
          last_seen
        )
      `)
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (!friends) return [];

    // Get additional stats for each friend
    const friendProfiles = await Promise.all(
      friends.map(async (friend: any) => {
        const stats = await this.getUserStats(friend.friend_user_id);
        return {
          ...friend.users,
          ...stats,
          privacy_settings: friend.users.privacy_settings || {
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
    const { data: requests } = await supabase
      .from('friends')
      .select(`
        id,
        created_at,
        users!friends_user_id_fkey (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq('friend_user_id', userId)
      .eq('status', 'pending');

    return requests || [];
  }

  async getFriendActivities(userId: string): Promise<FriendActivity[]> {
    // Get user's friends
    const { data: friendsData } = await supabase
      .from('friends')
      .select('friend_user_id')
      .eq('user_id', userId)
      .eq('status', 'accepted');

    if (!friendsData || friendsData.length === 0) return [];

    const friendIds = friendsData.map(f => f.friend_user_id);

    // Get recent activities from friends
    const { data: activities } = await supabase
      .from('friend_activities')
      .select(`
        *,
        users (username, full_name, avatar_url),
        friend_reactions (*)
      `)
      .in('user_id', friendIds)
      .order('created_at', { ascending: false })
      .limit(20);

    return activities || [];
  }

  async addReaction(userId: string, activityId: string, reactionType: string): Promise<void> {
    const { error } = await supabase
      .from('friend_reactions')
      .upsert({
        user_id: userId,
        activity_id: activityId,
        reaction_type: reactionType
      });

    if (error) throw error;
  }

  async removeReaction(userId: string, activityId: string): Promise<void> {
    const { error } = await supabase
      .from('friend_reactions')
      .delete()
      .eq('user_id', userId)
      .eq('activity_id', activityId);

    if (error) throw error;
  }

  async createActivity(userId: string, activityType: string, activityData: any): Promise<void> {
    const { error } = await supabase
      .from('friend_activities')
      .insert({
        user_id: userId,
        activity_type: activityType,
        activity_data: activityData
      });

    if (error) throw error;
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    // Remove both friendship records
    const { error1 } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', userId)
      .eq('friend_user_id', friendId);

    const { error2 } = await supabase
      .from('friends')
      .delete()
      .eq('user_id', friendId)
      .eq('friend_user_id', userId);

    if (error1 || error2) throw error1 || error2;
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
