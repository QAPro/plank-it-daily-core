
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export const useOnboarding = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsOnboardingComplete(null);
      setLoading(false);
      return;
    }

    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('completed_at')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error checking onboarding status:', error);
        setIsOnboardingComplete(false);
      } else {
        setIsOnboardingComplete(!!data?.completed_at);
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setIsOnboardingComplete(false);
    } finally {
      setLoading(false);
    }
  };

  const markOnboardingComplete = () => {
    setIsOnboardingComplete(true);
  };

  return {
    isOnboardingComplete,
    loading,
    markOnboardingComplete,
    refetch: checkOnboardingStatus
  };
};
