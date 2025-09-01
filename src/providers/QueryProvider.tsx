import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';

// Create a client with optimized settings for achievement caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache achievement data for 5 minutes by default
      staleTime: 5 * 60 * 1000,
      // Keep in memory for 15 minutes
      gcTime: 15 * 60 * 1000,
      // Don't retry on 404s to avoid hitting non-existent achievements
      retry: (failureCount, error: any) => {
        if (error?.status === 404) return false;
        return failureCount < 3;
      },
      // Refetch on window focus for real-time progress updates
      refetchOnWindowFocus: true,
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};
