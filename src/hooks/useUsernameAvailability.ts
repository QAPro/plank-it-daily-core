
import { useState, useEffect } from 'react';
import { useDebounce } from './useDebounce';
import { supabase } from '@/integrations/supabase/client';

export function useUsernameAvailability(username: string, currentUsername?: string) {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastCheckedUsername, setLastCheckedUsername] = useState<string | null>(null);

  const debouncedUsername = useDebounce(username, 500);

  const checkAvailability = async (usernameToCheck: string) => {
    if (!usernameToCheck || usernameToCheck.length < 3) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    // If it's the same as current username, don't check
    if (currentUsername && usernameToCheck.toLowerCase() === currentUsername.toLowerCase()) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      // Try to use the new safe RPC function first
      let { data, error: rpcError } = await (supabase as any).rpc('does_username_exist', {
        target_username: usernameToCheck
      });

      if (rpcError) {
        // Fallback to direct table query if RPC doesn't exist
        console.warn('RPC does_username_exist not available, falling back to direct query:', rpcError);
        
        // Use secure function for username availability check
        const { data: userData, error: queryError } = await supabase
          .rpc('find_user_by_username_or_email', { identifier: usernameToCheck })
          .maybeSingle();

        if (queryError && queryError.code !== 'PGRST116') {
          throw queryError;
        }

        data = !!userData;
      }

      setIsAvailable(!data);
      setLastCheckedUsername(usernameToCheck);
    } catch (err) {
      console.error('Error checking username availability:', err);
      setError('Failed to check username availability');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const retry = () => {
    if (lastCheckedUsername) {
      checkAvailability(lastCheckedUsername);
    }
  };

  useEffect(() => {
    if (debouncedUsername) {
      checkAvailability(debouncedUsername);
    } else {
      setIsAvailable(null);
      setError(null);
      setLastCheckedUsername(null);
    }
  }, [debouncedUsername, currentUsername]);

  return {
    isChecking,
    isAvailable,
    error,
    lastCheckedUsername,
    retry,
  };
}
