
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

// Local storage keys for simulated friend system
const FRIENDS_STORAGE_KEY = 'friends_data';
const PENDING_REQUESTS_KEY = 'pending_requests';

interface StoredFriend extends Friend {
  friend_profile: FriendProfile;
}

interface StoredPendingRequest {
  id: string;
  requester_id: string;
  target_id: string;
  created_at: string;
  requester: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export class FriendSystemManager {
  private getStoredFriends(): StoredFriend[] {
    try {
      const stored = localStorage.getItem(FRIENDS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private setStoredFriends(friends: StoredFriend[]): void {
    localStorage.setItem(FRIENDS_STORAGE_KEY, JSON.stringify(friends));
  }

  private getStoredRequests(): StoredPendingRequest[] {
    try {
      const stored = localStorage.getItem(PENDING_REQUESTS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private setStoredRequests(requests: StoredPendingRequest[]): void {
    localStorage.setItem(PENDING_REQUESTS_KEY, JSON.stringify(requests));
  }

  async searchUsers(query: string, currentUserId: string): Promise<FriendProfile[]> {
    if (query.length < 2) return [];

      // Use secure user search with OR pattern
      const searchTerms = query.split(' ').filter(term => term.length > 0).slice(0, 3); // Limit search terms
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

        // Get display info for each user
        const userProfiles = await Promise.all(
          uniqueUsers.map(async (user) => {
            const { data: displayInfo } = await supabase
              .rpc('get_user_display_info', { target_user_id: user.user_id })
              .single();
              
            const stats = await this.getUserStats(user.user_id);
            return {
              id: user.user_id,
              username: displayInfo?.username || user.username || '',
              full_name: '', // Not included in secure function for privacy
              avatar_url: displayInfo?.avatar_url || '',
              current_level: displayInfo?.current_level || 1,
              ...stats,
              is_online: false,
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
        console.error('Error in secure user search:', error);
        return [];
      }
  }

  async sendFriendRequest(userId: string, targetUserId: string): Promise<boolean> {
    try {
      // Check if friendship already exists
      const friends = this.getStoredFriends();
      const requests = this.getStoredRequests();
      
      const existingFriendship = friends.find(f => 
        (f.user_id === userId && f.friend_user_id === targetUserId) ||
        (f.user_id === targetUserId && f.friend_user_id === userId)
      );

      const existingRequest = requests.find(r =>
        (r.requester_id === userId && r.target_id === targetUserId) ||
        (r.requester_id === targetUserId && r.target_id === userId)
      );

      if (existingFriendship || existingRequest) {
        throw new Error('Friendship already exists or request pending');
      }

      // Use secure function for user lookup
      const { data: requester } = await supabase
        .rpc('get_user_display_info', { target_user_id: userId })
        .single();

      if (!requester) throw new Error('User not found');

      // Create friend request with proper UUID
      const newRequest: StoredPendingRequest = {
        id: crypto.randomUUID(),
        requester_id: userId,
        target_id: targetUserId,
        created_at: new Date().toISOString(),
        requester: {
          id: requester.user_id,
          username: requester.username || '',
          full_name: '', // Full name not included in secure function for privacy
          avatar_url: requester.avatar_url
        }
      };

      requests.push(newRequest);
      this.setStoredRequests(requests);
      return true;
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  async acceptFriendRequest(userId: string, requestId: string): Promise<boolean> {
    try {
      const requests = this.getStoredRequests();
      const requestIndex = requests.findIndex(r => r.id === requestId && r.target_id === userId);
      
      if (requestIndex === -1) {
        throw new Error('Request not found');
      }

      const request = requests[requestIndex];
      
      // Get both user profiles
      const [requesterProfile, targetProfile] = await Promise.all([
        this.getUserProfile(request.requester_id),
        this.getUserProfile(userId)
      ]);

      // Create friendship entries with proper UUID
      const friends = this.getStoredFriends();
      const friendship: StoredFriend = {
        id: crypto.randomUUID(),
        user_id: request.requester_id,
        friend_user_id: userId,
        status: 'accepted',
        created_at: request.created_at,
        accepted_at: new Date().toISOString(),
        friend_profile: targetProfile
      };

      friends.push(friendship);
      this.setStoredFriends(friends);

      // Remove the request
      requests.splice(requestIndex, 1);
      this.setStoredRequests(requests);

      return true;
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  async declineFriendRequest(userId: string, requestId: string): Promise<boolean> {
    try {
      const requests = this.getStoredRequests();
      const requestIndex = requests.findIndex(r => r.id === requestId && r.target_id === userId);
      
      if (requestIndex === -1) {
        throw new Error('Request not found');
      }

      requests.splice(requestIndex, 1);
      this.setStoredRequests(requests);
      return true;
    } catch (error) {
      console.error('Error declining friend request:', error);
      throw error;
    }
  }

  async getFriendsList(userId: string): Promise<FriendProfile[]> {
    try {
      const friends = this.getStoredFriends();
      const userFriends = friends.filter(f => 
        f.user_id === userId || f.friend_user_id === userId
      );

      const friendProfiles = await Promise.all(
        userFriends.map(async (friendship) => {
          const friendId = friendship.user_id === userId ? friendship.friend_user_id : friendship.user_id;
          return await this.getUserProfile(friendId);
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
      const requests = this.getStoredRequests();
      return requests
        .filter(r => r.target_id === userId)
        .map(request => ({
          id: request.id,
          created_at: request.created_at,
          users: request.requester
        }));
    } catch (error) {
      console.error('Error getting pending requests:', error);
      return [];
    }
  }

  async getFriendActivities(userId: string): Promise<FriendActivity[]> {
    try {
      // Return empty array for now - can be implemented later
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
      const friends = this.getStoredFriends();
      const friendshipIndex = friends.findIndex(f =>
        (f.user_id === userId && f.friend_user_id === friendId) ||
        (f.user_id === friendId && f.friend_user_id === userId)
      );

      if (friendshipIndex !== -1) {
        friends.splice(friendshipIndex, 1);
        this.setStoredFriends(friends);
      }

      return true;
    } catch (error) {
      console.error('Error removing friend:', error);
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
