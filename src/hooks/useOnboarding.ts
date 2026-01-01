
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const ONBOARDING_CACHE_KEY = 'onboarding_complete';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const useOnboarding = () => {
  const [isOnboardingComplete, setIsOnboardingComplete] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setIsOnboardingComplete(null);
      setLoading(false);
      localStorage.removeItem(ONBOARDING_CACHE_KEY);
      return;
    }

    // Check cache first for immediate feedback
    const cached = localStorage.getItem(ONBOARDING_CACHE_KEY);
    if (cached === 'true') {
      setIsOnboardingComplete(true);
    }

    checkOnboardingStatus();
  }, [user]);

  const checkOnboardingStatus = async (retryCount = 0): Promise<void> => {
    if (!user) return;

    try {
      console.log(`[Onboarding] Checking status (attempt ${retryCount + 1})`);
      
      const { data, error } = await supabase
        .from('user_onboarding')
        .select('completed_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('[Onboarding] Database error:', error.code, error.message);
        
        // Retry on network errors
        if (retryCount < MAX_RETRIES) {
          console.log(`[Onboarding] Retrying in ${RETRY_DELAY}ms...`);
          await sleep(RETRY_DELAY * (retryCount + 1));
          return checkOnboardingStatus(retryCount + 1);
        } else {
          // Max retries reached - use cached value or keep current state
          console.error('[Onboarding] Max retries reached, using cached/current state');
          const cached = localStorage.getItem(ONBOARDING_CACHE_KEY);
          if (cached === 'true') {
            setIsOnboardingComplete(true);
          } else if (isOnboardingComplete === null) {
            // Only set to false if we have no other information
            setIsOnboardingComplete(false);
          }
          setLoading(false);
        }
      } else {
        const isComplete = !!data?.completed_at;
        console.log('[Onboarding] Status loaded:', isComplete);
        setIsOnboardingComplete(isComplete);
        
        // Cache the result
        if (isComplete) {
          localStorage.setItem(ONBOARDING_CACHE_KEY, 'true');
        } else {
          localStorage.removeItem(ONBOARDING_CACHE_KEY);
        }
        setLoading(false);
      }
    } catch (error) {
      console.error('[Onboarding] Unexpected error:', error);
      
      if (retryCount < MAX_RETRIES) {
        await sleep(RETRY_DELAY * (retryCount + 1));
        return checkOnboardingStatus(retryCount + 1);
      }
      
      // Use cached value on unexpected error
      const cached = localStorage.getItem(ONBOARDING_CACHE_KEY);
      if (cached === 'true') {
        setIsOnboardingComplete(true);
      } else if (isOnboardingComplete === null) {
        setIsOnboardingComplete(false);
      }
      setLoading(false);
    }
  };

  const markOnboardingComplete = async () => {
    if (!user) return;
    
    console.log('[Onboarding] Marking complete and saving to database');
    
    try {
      // Insert minimal onboarding record with defaults
      const { data, error } = await supabase
        .from('user_onboarding')
        .upsert({
          user_id: user.id,
          fitness_level: 2, // Default: Some experience
          goals: [], // Empty - can be set later
          experience_level: 'beginner',
          preferred_duration: 30,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        })
        .select();

      if (error) {
        console.error('[Onboarding] Error saving to database:', error.message, error.details, error.hint);
        throw error;
      }

      console.log('[Onboarding] Successfully saved to database:', data);
      setIsOnboardingComplete(true);
      localStorage.setItem(ONBOARDING_CACHE_KEY, 'true');
    } catch (error: any) {
      console.error('[Onboarding] Failed to mark onboarding complete:', error?.message || error);
      // DO NOT set local state if database fails - this causes the bug
      // User will see welcome screen again, which is correct if save failed
      throw error; // Re-throw so caller knows it failed
    }
  };

  return {
    isOnboardingComplete,
    loading,
    markOnboardingComplete,
    refetch: checkOnboardingStatus
  };
};
