
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useUsernameAvailability() {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAvailability = async (username: string) => {
    if (!username || username.length < 3) {
      setIsAvailable(null);
      setError(null);
      return;
    }

    setIsChecking(true);
    setError(null);

    try {
      // Try to use the new safe RPC function first
      let { data, error: rpcError } = await supabase.rpc('does_username_exist', {
        target_username: username
      });

      if (rpcError) {
        // Fallback to direct table query if RPC doesn't exist
        console.warn('RPC does_username_exist not available, falling back to direct query:', rpcError);
        
        const { data: userData, error: queryError } = await supabase
          .from('users')
          .select('username')
          .eq('username', username)
          .single();

        if (queryError && queryError.code !== 'PGRST116') {
          throw queryError;
        }

        data = !!userData;
      }

      setIsAvailable(!data);
    } catch (err) {
      console.error('Error checking username availability:', err);
      setError('Failed to check username availability');
      setIsAvailable(null);
    } finally {
      setIsChecking(false);
    }
  };

  const reset = () => {
    setIsAvailable(null);
    setError(null);
    setIsChecking(false);
  };

  return {
    isChecking,
    isAvailable,
    error,
    checkAvailability,
    reset,
  };
}
