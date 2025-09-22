import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Secure hook for managing push subscription status without exposing cryptographic keys
 * Uses the secure view and functions created for the security fix
 */
export const useSecurePushSubscriptions = () => {
  const { user } = useAuth();
  const [subscriptionCount, setSubscriptionCount] = useState<number>(0);
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Get the count of active push subscriptions for the current user
   * Uses the secure function that doesn't expose cryptographic keys
   */
  const fetchSubscriptionCount = async () => {
    if (!user) {
      setSubscriptionCount(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_user_push_subscription_count');
      
      if (error) {
        throw error;
      }

      setSubscriptionCount(data || 0);
    } catch (err: any) {
      console.error('Error fetching subscription count:', err);
      setError(err.message || 'Failed to fetch subscription count');
      setSubscriptionCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get subscription details without exposing cryptographic keys
   * Uses the secure view that excludes sensitive data
   */
  const fetchSubscriptionDetails = async () => {
    if (!user) {
      setSubscriptions([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('user_push_subscription_status')
        .select('id, endpoint, user_agent, is_active, created_at, updated_at')
        .eq('is_active', true);
      
      if (error) {
        throw error;
      }

      setSubscriptions(data || []);
    } catch (err: any) {
      console.error('Error fetching subscription details:', err);
      setError(err.message || 'Failed to fetch subscription details');
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if the user has any active push subscriptions
   */
  const hasActiveSubscriptions = () => {
    return subscriptionCount > 0;
  };

  /**
   * Refresh both subscription count and details
   */
  const refresh = async () => {
    await Promise.all([
      fetchSubscriptionCount(),
      fetchSubscriptionDetails()
    ]);
  };

  // Auto-fetch when user changes
  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setSubscriptionCount(0);
      setSubscriptions([]);
      setError(null);
    }
  }, [user]);

  return {
    subscriptionCount,
    subscriptions,
    hasActiveSubscriptions: hasActiveSubscriptions(),
    isLoading,
    error,
    refresh,
    fetchSubscriptionCount,
    fetchSubscriptionDetails
  };
};