
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface UserAchievement {
  id: string;
  achievement_type: string;
  achievement_name: string;
  description?: string;
  earned_at: string;
  metadata?: any;
}

export const useUserAchievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', user.id)
        .order('earned_at', { ascending: false });

      if (error) {
        console.error('Error fetching achievements:', error);
        setAchievements([]); // Set empty array instead of returning early
        return;
      }

      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      setAchievements([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, [user]);

  return {
    achievements,
    loading,
    refetch: fetchAchievements,
  };
};
