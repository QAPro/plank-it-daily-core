import { supabase } from '@/integrations/supabase/client';

export interface Cheer {
  id: string;
  from_user_id: string;
  to_user_id: string;
  activity_id: string;
  created_at: string;
}

export interface CheerWithUser extends Cheer {
  from_user: {
    id: string;
    username: string | null;
    full_name: string | null;
    avatar_url: string | null;
  };
  activity: {
    activity_type: string;
    activity_data: any;
  };
}

export interface UserSocialStats {
  user_id: string;
  cheers_given: number;
  cheers_received: number;
  friends_count: number;
  updated_at: string;
}

class CheerService {
  async addCheer(fromUserId: string, toUserId: string, activityId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('cheers')
        .insert({
          from_user_id: fromUserId,
          to_user_id: toUserId,
          activity_id: activityId
        });

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          return { success: false, error: 'Already cheered this activity' };
        }
        throw error;
      }

      return { success: true };
    } catch (error) {
      console.error('Error adding cheer:', error);
      return { success: false, error: 'Failed to add cheer' };
    }
  }

  async removeCheer(fromUserId: string, activityId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from('cheers')
        .delete()
        .eq('from_user_id', fromUserId)
        .eq('activity_id', activityId);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Error removing cheer:', error);
      return { success: false, error: 'Failed to remove cheer' };
    }
  }

  async getCheersForActivity(activityId: string): Promise<Cheer[]> {
    try {
      const { data, error } = await supabase
        .from('cheers')
        .select('*')
        .eq('activity_id', activityId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Error fetching cheers for activity:', error);
      return [];
    }
  }

  async getCheersReceived(userId: string, limit: number = 20): Promise<CheerWithUser[]> {
    try {
      const { data, error } = await supabase
        .from('cheers')
        .select(`
          *,
          from_user:users!cheers_from_user_id_fkey(id, username, full_name, avatar_url),
          activity:friend_activities!cheers_activity_id_fkey(activity_type, activity_data)
        `)
        .eq('to_user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      return data as any || [];
    } catch (error) {
      console.error('Error fetching cheers received:', error);
      return [];
    }
  }

  async getUserSocialStats(userId: string): Promise<UserSocialStats | null> {
    try {
      const { data, error } = await supabase
        .from('user_social_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // If no stats exist, return defaults
      if (!data) {
        return {
          user_id: userId,
          cheers_given: 0,
          cheers_received: 0,
          friends_count: 0,
          updated_at: new Date().toISOString()
        };
      }

      return data;
    } catch (error) {
      console.error('Error fetching user social stats:', error);
      return null;
    }
  }

  async hasUserCheered(userId: string, activityId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('cheers')
        .select('id')
        .eq('from_user_id', userId)
        .eq('activity_id', activityId)
        .maybeSingle();

      if (error) throw error;

      return !!data;
    } catch (error) {
      console.error('Error checking if user cheered:', error);
      return false;
    }
  }

  async createReferralLink(userId: string): Promise<string> {
    try {
      // Generate a unique referral code
      const referralCode = `${userId.substring(0, 8)}-${Date.now()}`;

      const { error } = await supabase
        .from('referrals')
        .insert({
          referrer_user_id: userId,
          referral_code: referralCode
        });

      if (error) throw error;

      return `${window.location.origin}?ref=${referralCode}`;
    } catch (error) {
      console.error('Error creating referral link:', error);
      // Fallback to simple user ID referral
      return `${window.location.origin}?ref=${userId}`;
    }
  }
}

export const cheerService = new CheerService();
