/**
 * Hook for managing recommendation refresh logic
 */

import { useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useAchievementEvents } from '@/contexts/AchievementEventContext';

interface UseRecommendationRefreshOptions {
  enabled?: boolean;
  debounceMs?: number;
}

export const useRecommendationRefresh = (options: UseRecommendationRefreshOptions = {}) => {
  const { enabled = true, debounceMs = 500 } = options;
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { lastEvent } = useAchievementEvents();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastRefreshRef = useRef<number>(0);

  const refreshRecommendations = useCallback(() => {
    if (!user?.id || !enabled) return;

    // Debounce rapid refreshes
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const now = Date.now();
      // Prevent refreshing more than once per second
      if (now - lastRefreshRef.current < 1000) return;

      lastRefreshRef.current = now;
      
      queryClient.invalidateQueries({
        queryKey: ['whats-next-recommendations', user.id]
      });
    }, debounceMs);
  }, [user?.id, enabled, queryClient, debounceMs]);

  // Listen to achievement events
  useEffect(() => {
    if (!lastEvent || !enabled) return;

    const { type } = lastEvent;
    
    // Refresh on relevant events
    if (type === 'earned' || type === 'session_completed') {
      refreshRecommendations();
    }
  }, [lastEvent, enabled, refreshRecommendations]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return { refreshRecommendations };
};
