
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { LevelProgressionEngine, type UserLevel, type LevelUnlock } from '@/services/levelProgressionService';

export const useLevelProgression = () => {
  const { user } = useAuth();
  const [userLevel, setUserLevel] = useState<UserLevel | null>(null);
  const [loading, setLoading] = useState(true);
  const [allLevelUnlocks, setAllLevelUnlocks] = useState<LevelUnlock[]>([]);

  const fetchUserLevel = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get user's current XP and level
      const { data: userData } = await supabase
        .from('users')
        .select('total_xp, current_level')
        .eq('id', user.id)
        .single();

      const totalXP = userData?.total_xp || 0;
      const calculatedLevel = LevelProgressionEngine.calculateLevel(totalXP);

      // Get user's unlocked features
      const { data: unlockedFeatures } = await supabase
        .from('feature_unlocks')
        .select('feature_name')
        .eq('user_id', user.id);

      const unlockedFeatureNames = unlockedFeatures?.map(f => f.feature_name) || [];

      // Get all level unlocks for next unlock calculation
      const { data: levelUnlocks } = await supabase
        .from('level_unlocks')
        .select('*')
        .order('level', { ascending: true });

      setAllLevelUnlocks(levelUnlocks || []);

      // Find next unlock
      const nextUnlock = levelUnlocks?.find(unlock => 
        unlock.level > calculatedLevel.current_level
      ) || null;

      const completeUserLevel: UserLevel = {
        ...calculatedLevel,
        unlocked_features: unlockedFeatureNames,
        next_unlock: nextUnlock
      };

      setUserLevel(completeUserLevel);
    } catch (error) {
      console.error('Error fetching user level:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUnlocksForLevel = (level: number): LevelUnlock[] => {
    return allLevelUnlocks.filter(unlock => unlock.level === level);
  };

  const isFeatureUnlocked = (featureName: string): boolean => {
    return userLevel?.unlocked_features.includes(featureName) || false;
  };

  const getFeatureUnlockLevel = (featureName: string): number | null => {
    const unlock = allLevelUnlocks.find(u => u.feature_name === featureName);
    return unlock?.level || null;
  };

  useEffect(() => {
    fetchUserLevel();
  }, [user]);

  return {
    userLevel,
    loading,
    refetch: fetchUserLevel,
    getUnlocksForLevel,
    isFeatureUnlocked,
    getFeatureUnlockLevel,
    allLevelUnlocks
  };
};
