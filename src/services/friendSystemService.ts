
import { supabase } from '@/integrations/supabase/client';

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string; // Changed from friend_user_id to match database
  status: 'pending' | 'accepted' | 'blocked';
  created_at: string;
  updated_at?: string;
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
  canSendRequest?: boolean;
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

    // Use secure user search with OR pattern
    const searchTerms = query.split(' ').filter(term => term.length > 0).slice(0, 3);
    let users: any[] = [];
    
    // Try searching by username first
    try {
      for (const term of searchTerms) {
        const { data: usernameResults } = await supabase
          .rpc('find_user_by_username_or_email', { identifier: term });
        if (usernameResults) {
          users.push(...usernameResults);
        }
      }
      
      // Remove duplicates and current user
      const uniqueUsers = users.filter((user, index, self) => 
        index === self.findIndex(u => u.user_id === user.user_id) &&
        user.user_id !== currentUserId
      ).slice(0, 10);

      // Get display info for each user with privacy filtering
      const userProfiles = await Promise.all(
        uniqueUsers.map(async (user) => {
          // Check if user can be viewed
          const { data: canView } = await supabase
            .rpc('can_view_user_profile', {
              _viewer_id: currentUserId,
              _target_user_id: user.user_id
            });

          if (!canView) {
            return null;
          }

          const { data: displayInfo } = await supabase
            .rpc('get_user_display_info', { target_user_id: user.user_id })
            .single();
            
          const stats = await this.getUserStats(user.user_id);

          // Check if user can send friend request
          const { data: canSendRequest } = await supabase
            .rpc('can_send_friend_request', {
              _sender_id: currentUserId,
              _receiver_id: user.user_id
            });

          return {
            id: user.user_id,
            username: displayInfo?.username || user.username || '',
            full_name: '',
            avatar_url: displayInfo?.avatar_url,
            current_level: displayInfo?.current_level || 1,
            ...stats,
            is_online: false,
            canSendRequest: canSendRequest || false,
            privacy_settings: {
              show_workouts: true,
              show_achievements: true,
              show_streak: true
            }
          } as FriendProfile;
        })
      );

      return userProfiles.filter((profile): profile is FriendProfile => profile !== null);
    } catch (error) {
      console.error('Error in secure user search:', error);
      return [];
    }
  }

  async sendFriendRequest(userId: string, targetUserId: string): Promise<boolean> {
    try {
      console.log('[FriendSystem] Sending friend request:', { userId, targetUserId });

      // Check privacy settings first
      const { data: canSend } = await supabase
        .rpc('can_send_friend_request', {
          _sender_id: userId,
          _receiver_id: targetUserId
        });

      if (!canSend) {
        throw new Error('This user is not accepting friend requests');
      }

      // Check if friendship already exists in database
      const { data: existingFriendship } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${userId},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${userId})`)
        .maybeSingle();

      if (existingFriendship) {
        throw new Error('Friendship already exists or request pending');
      }

      // Insert friend request into database
      const { data, error } = await supabase
        .from('friends')
        .insert({
          user_id: userId,
          friend_id: targetUserId,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('[FriendSystem] Error inserting friend request:', error);
        throw error;
      }

      console.log('[FriendSystem] Friend request created:', data);
      return true;
    } catch (error) {
      console.error('[FriendSystem] Error sending friend request:', error);
      throw error;
    }
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<boolean> {
    try {
      console.log('[FriendSystem] Accepting friend request:', { userId, requestId });

      // Update the friend request status to 'accepted'
      const { data, error } = await supabase
        .from('friends')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId)
        .eq('friend_id', userId) // Only the recipient can accept
        .eq('status', 'pending')
        .select()
        .single();

      if (error) {
        console.error('[FriendSystem] Error accepting friend request:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Request not found or already processed');
      }

      console.log('[FriendSystem] Friend request accepted:', data);
      return true;
    } catch (error) {
      console.error('[FriendSystem] Error accepting friend request:', error);
      throw error;
    }
  }

  async declineFriendRequest(userId: string, requestId: string): Promise<boolean> {
    try {
      console.log('[FriendSystem] Declining friend request:', { userId, requestId });

      // Delete the friend request
      const { error } = await supabase
        .from('friends')
        .delete()
        .eq('id', requestId)
        .eq('friend_id', userId) // Only the recipient can decline
        .eq('status', 'pending');

      if (error) {
        console.error('[FriendSystem] Error declining friend request:', error);
        throw error;
      }

      console.log('[FriendSystem] Friend request declined');
      return true;
    } catch (error) {
      console.error('[FriendSystem] Error declining friend request:', error);
      throw error;
    }
  }

  async getFriendsList(userId: string): Promise<FriendProfile[]> {
    try {
      console.log('[FriendSystem] Getting friends list for user:', userId);

      // Query database for accepted friendships
      const { data: friendships, error } = await supabase
        .from('friends')
        .select('*')
        .or(`and(user_id.eq.${userId},status.eq.accepted),and(friend_id.eq.${userId},status.eq.accepted)`);

      if (error) {
        console.error('[FriendSystem] Error querying friends:', error);
        throw error;
      }

      if (!friendships || friendships.length === 0) {
        console.log('[FriendSystem] No friends found');
        return [];
      }

      console.log('[FriendSystem] Found friendships:', friendships);

      // Get profiles for all friends
      const friendProfiles = await Promise.all(
        friendships.map(async (friendship) => {
          const friendId = friendship.user_id === userId ? friendship.friend_id : friendship.user_id;
          return await this.getUserProfile(friendId);
        })
      );

      console.log('[FriendSystem] Returning friend profiles:', friendProfiles);
      return friendProfiles;
    } catch (error) {
      console.error('[FriendSystem] Error getting friends list:', error);
      return [];
    }
  }

  async getPendingRequests(userId: string): Promise<any[]> {
    try {
      console.log('[FriendSystem] Getting pending requests for user:', userId);

      // Query database for pending requests where user is the recipient
      const { data: requests, error } = await supabase
        .from('friends')
        .select(`
          id,
          user_id,
          created_at,
          users:user_id (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('friend_id', userId)
        .eq('status', 'pending');

      if (error) {
        console.error('[FriendSystem] Error querying pending requests:', error);
        throw error;
      }

      if (!requests || requests.length === 0) {
        console.log('[FriendSystem] No pending requests found');
        return [];
      }

      console.log('[FriendSystem] Found pending requests:', requests);

      // Format the response
      return requests.map(request => ({
        id: request.id,
        created_at: request.created_at,
        users: request.users
      }));
    } catch (error) {
      console.error('[FriendSystem] Error getting pending requests:', error);
      return [];
    }
  }

  async getFriendActivities(userId: string): Promise<FriendActivity[]> {
    try {
      console.log('[FriendSystem] Getting friend activities for user:', userId);

      // Get list of friend IDs
      const friends = await this.getFriendsList(userId);
      const friendIds = friends.map(f => f.id);

      if (friendIds.length === 0) {
        console.log('[FriendSystem] No friends, returning empty activities');
        return [];
      }

      // Query friend_activities table
      const { data: activities, error } = await supabase
        .from('friend_activities')
        .select(`
          *,
          users (
            username,
            full_name,
            avatar_url
          ),
          friend_reactions (*)
        `)
        .in('user_id', friendIds)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('[FriendSystem] Error querying activities:', error);
        throw error;
      }

      console.log('[FriendSystem] Found activities:', activities);
      return activities || [];
    } catch (error) {
      console.error('[FriendSystem] Error getting friend activities:', error);
      return [];
    }
  }

  async addReaction(userId: string, activityId: string, reactionType: string): Promise<void> {
    try {
      console.log('[FriendSystem] Adding reaction:', { userId, activityId, reactionType });

      const { error } = await supabase
        .from('friend_reactions')
        .insert({
          user_id: userId,
          activity_id: activityId,
          reaction_type: reactionType
        });

      if (error) {
        console.error('[FriendSystem] Error adding reaction:', error);
        throw error;
      }

      console.log('[FriendSystem] Reaction added successfully');
    } catch (error) {
      console.error('[FriendSystem] Error adding reaction:', error);
      throw error;
    }
  }

  async removeReaction(userId: string, activityId: string): Promise<void> {
    try {
      console.log('[FriendSystem] Removing reaction:', { userId, activityId });

      const { error } = await supabase
        .from('friend_reactions')
        .delete()
        .eq('user_id', userId)
        .eq('activity_id', activityId);

      if (error) {
        console.error('[FriendSystem] Error removing reaction:', error);
        throw error;
      }

      console.log('[FriendSystem] Reaction removed successfully');
    } catch (error) {
      console.error('[FriendSystem] Error removing reaction:', error);
      throw error;
    }
  }

  async createActivity(userId: string, activityType: string, activityData: any): Promise<void> {
    try {
      console.log('[FriendSystem] Creating activity:', { userId, activityType, activityData });

      const { error } = await supabase
        .from('friend_activities')
        .insert({
          user_id: userId,
          activity_type: activityType,
          activity_data: activityData
        });

      if (error) {
        console.error('[FriendSystem] Error creating activity:', error);
        throw error;
      }

      console.log('[FriendSystem] Activity created successfully');
    } catch (error) {
      console.error('[FriendSystem] Error creating activity:', error);
      throw error;
    }
  }

  async removeFriend(userId: string, friendId: string): Promise<boolean> {
    try {
      console.log('[FriendSystem] Removing friend:', { userId, friendId });

      // Delete the friendship from database
      const { error } = await supabase
        .from('friends')
        .delete()
        .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`);

      if (error) {
        console.error('[FriendSystem] Error removing friend:', error);
        throw error;
      }

      console.log('[FriendSystem] Friend removed successfully');
      return true;
    } catch (error) {
      console.error('[FriendSystem] Error removing friend:', error);
      throw error;
    }
  }

  private async getUserProfile(userId: string): Promise<FriendProfile> {
    const { data: user } = await supabase
      .from('users')
      .select('id, username, full_name, avatar_url, current_level')
      .eq('id', userId)
      .single();

    if (!user) {
      throw new Error('User not found');
    }

    const stats = await this.getUserStats(userId);

    return {
      id: user.id,
      username: user.username || '',
      full_name: user.full_name || '',
      avatar_url: user.avatar_url,
      current_level: user.current_level || 1,
      ...stats,
      is_online: false,
      privacy_settings: {
        show_workouts: true,
        show_achievements: true,
        show_streak: true
      }
    };
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
      console.error('[FriendSystem] Error getting user stats:', error);
      return {
        current_streak: 0,
        total_workouts: 0,
        last_workout: undefined
      };
    }
  }
}

export const friendSystemManager = new FriendSystemManager();
