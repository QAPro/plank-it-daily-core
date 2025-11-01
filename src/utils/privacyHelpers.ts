import { supabase } from '@/integrations/supabase/client';

/**
 * Check if viewer can see target user's profile
 */
export const canViewProfile = async (
  viewerId: string,
  targetUserId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('can_view_user_profile', {
      _viewer_id: viewerId,
      _target_user_id: targetUserId,
    });

    if (error) {
      console.error('Error checking profile visibility:', error);
      return false;
    }

    return data ?? false;
  } catch (error) {
    console.error('Error in canViewProfile:', error);
    return false;
  }
};

/**
 * Check if sender can send friend request to receiver
 */
export const canSendFriendRequest = async (
  senderId: string,
  receiverId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('can_send_friend_request', {
      _sender_id: senderId,
      _receiver_id: receiverId,
    });

    if (error) {
      console.error('Error checking friend request permission:', error);
      return false;
    }

    return data ?? false;
  } catch (error) {
    console.error('Error in canSendFriendRequest:', error);
    return false;
  }
};

/**
 * Check if viewer can see target user's activity
 */
export const canViewActivity = async (
  viewerId: string,
  targetUserId: string
): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('can_view_user_activity', {
      _viewer_id: viewerId,
      _target_user_id: targetUserId,
    });

    if (error) {
      console.error('Error checking activity visibility:', error);
      return false;
    }

    return data ?? false;
  } catch (error) {
    console.error('Error in canViewActivity:', error);
    return false;
  }
};

/**
 * Get which profile fields should be visible based on privacy settings
 */
export const getVisibleProfileFields = (privacySettings: any) => {
  return {
    achievements: privacySettings?.show_achievements ?? true,
    statistics: privacySettings?.show_statistics ?? true,
    streak: privacySettings?.show_streak ?? true,
  };
};
