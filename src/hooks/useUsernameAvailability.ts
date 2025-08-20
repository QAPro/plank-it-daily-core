
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useDebounce } from './useDebounce';

export interface UsernameAvailabilityState {
  isChecking: boolean;
  isAvailable: boolean | null;
  error: string | null;
  lastCheckedUsername: string | null;
}

export const useUsernameAvailability = (username: string, currentUsername?: string) => {
  const [state, setState] = useState<UsernameAvailabilityState>({
    isChecking: false,
    isAvailable: null,
    error: null,
    lastCheckedUsername: null
  });

  const debouncedUsername = useDebounce(username, 500);

  const checkAvailability = useCallback(async (usernameToCheck: string) => {
    // Don't check if username is empty, invalid format, or same as current
    if (!usernameToCheck || 
        usernameToCheck.length < 3 || 
        (currentUsername && usernameToCheck.toLowerCase() === currentUsername.toLowerCase())) {
      setState(prev => ({
        ...prev,
        isChecking: false,
        isAvailable: null,
        error: null,
        lastCheckedUsername: usernameToCheck
      }));
      return;
    }

    setState(prev => ({
      ...prev,
      isChecking: true,
      error: null
    }));

    try {
      console.log('Checking username availability:', usernameToCheck);
      
      // Use the existing database function for case-insensitive lookup
      const { data, error } = await supabase
        .rpc('find_user_by_username_or_email', { 
          identifier: usernameToCheck.toLowerCase() 
        });

      if (error) {
        console.error('Error checking username availability:', error);
        setState(prev => ({
          ...prev,
          isChecking: false,
          error: 'Failed to check username availability. Please try again.',
          isAvailable: null,
          lastCheckedUsername: usernameToCheck
        }));
        return;
      }

      // If data is returned, username is taken
      const isAvailable = !data || data.length === 0;

      setState(prev => ({
        ...prev,
        isChecking: false,
        isAvailable,
        error: null,
        lastCheckedUsername: usernameToCheck
      }));

    } catch (error) {
      console.error('Network error checking username:', error);
      setState(prev => ({
        ...prev,
        isChecking: false,
        error: 'Network error. Please check your connection and try again.',
        isAvailable: null,
        lastCheckedUsername: usernameToCheck
      }));
    }
  }, [currentUsername]);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername.length >= 3) {
      checkAvailability(debouncedUsername);
    } else {
      setState(prev => ({
        ...prev,
        isChecking: false,
        isAvailable: null,
        error: null,
        lastCheckedUsername: debouncedUsername
      }));
    }
  }, [debouncedUsername, checkAvailability]);

  const retry = useCallback(() => {
    if (state.lastCheckedUsername) {
      checkAvailability(state.lastCheckedUsername);
    }
  }, [state.lastCheckedUsername, checkAvailability]);

  return {
    ...state,
    retry
  };
};
