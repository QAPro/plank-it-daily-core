import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { canViewProfile, getVisibleProfileFields } from '@/utils/privacyHelpers';

export interface ViewableProfile {
  id: string;
  username: string | null;
  first_name: string | null;
  avatar_url: string | null;
  current_level: number;
  created_at: string;
  canView: boolean;
  visibleFields: {
    achievements: boolean;
    statistics: boolean;
    streak: boolean;
  };
}

export const useViewableProfile = (targetUserId: string | null) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ViewableProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      return;
    }

    const fetchViewableProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        // If viewing own profile, show everything
        if (user?.id === targetUserId) {
          const { data: profileData, error: profileError } = await supabase
            .from('users')
            .select('id, username, first_name, avatar_url, current_level, created_at')
            .eq('id', targetUserId)
            .single();

          if (profileError) throw profileError;

          setProfile({
            ...profileData,
            canView: true,
            visibleFields: {
              achievements: true,
              statistics: true,
              streak: true,
            },
          });
          return;
        }

        // Check if viewer can see target's profile
        const hasAccess = user?.id 
          ? await canViewProfile(user.id, targetUserId)
          : false;

        if (!hasAccess) {
          setProfile({
            id: targetUserId,
            username: null,
            first_name: null,
            avatar_url: null,
            current_level: 1,
            created_at: new Date().toISOString(),
            canView: false,
            visibleFields: {
              achievements: false,
              statistics: false,
              streak: false,
            },
          });
          return;
        }

        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from('users')
          .select('id, username, first_name, avatar_url, current_level, created_at')
          .eq('id', targetUserId)
          .single();

        if (profileError) throw profileError;

        // Fetch privacy settings
        const { data: privacyData } = await supabase
          .from('privacy_settings')
          .select('show_achievements, show_statistics, show_streak')
          .eq('user_id', targetUserId)
          .single();

        const visibleFields = getVisibleProfileFields(privacyData);

        setProfile({
          ...profileData,
          canView: true,
          visibleFields,
        });
      } catch (err) {
        console.error('Error fetching viewable profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchViewableProfile();
  }, [targetUserId, user?.id]);

  return { profile, loading, error };
};
