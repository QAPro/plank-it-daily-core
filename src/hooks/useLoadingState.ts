
import { useState, useCallback, useRef } from 'react';

interface LoadingState {
  [key: string]: boolean;
}

export const useLoadingState = (initialStates: string[] = []) => {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(() =>
    initialStates.reduce((acc, state) => ({ ...acc, [state]: false }), {})
  );

  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const setLoading = useCallback((key: string, isLoading: boolean, timeout?: number) => {
    // Clear any existing timeout for this key
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
      delete timeoutRefs.current[key];
    }

    setLoadingStates(prev => ({ ...prev, [key]: isLoading }));

    // Set automatic timeout to prevent stuck loading states
    if (isLoading && timeout) {
      timeoutRefs.current[key] = setTimeout(() => {
        setLoadingStates(prev => ({ ...prev, [key]: false }));
        console.warn(`Loading state "${key}" timed out after ${timeout}ms`);
        delete timeoutRefs.current[key];
      }, timeout);
    }
  }, []);

  const isLoading = useCallback((key: string) => loadingStates[key] || false, [loadingStates]);

  const isAnyLoading = useCallback(() => Object.values(loadingStates).some(Boolean), [loadingStates]);

  const withLoading = useCallback(async <T>(
    key: string,
    asyncFn: () => Promise<T>,
    timeout: number = 30000
  ): Promise<T> => {
    setLoading(key, true, timeout);
    try {
      const result = await asyncFn();
      return result;
    } finally {
      setLoading(key, false);
    }
  }, [setLoading]);

  // Cleanup timeouts on unmount
  const cleanup = useCallback(() => {
    Object.values(timeoutRefs.current).forEach(clearTimeout);
    timeoutRefs.current = {};
  }, []);

  return {
    setLoading,
    isLoading,
    isAnyLoading,
    withLoading,
    cleanup,
    loadingStates,
  };
};
