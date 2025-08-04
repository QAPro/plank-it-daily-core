import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useStreakTracking } from '../useStreakTracking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  },
}));

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id' },
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
};

describe('useStreakTracking', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return streak data', async () => {
    const mockStreak = {
      current_streak: 5,
      longest_streak: 10,
      last_workout_date: '2024-01-01',
    };

    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: mockStreak, error: null }),
        }),
      }),
    }));

    const { result } = renderHook(() => useStreakTracking(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.streak).toEqual(mockStreak);
    });
  });

  it('should return correct streak status', async () => {
    const mockStreak = {
      current_streak: 3,
      longest_streak: 5,
      last_workout_date: new Date().toISOString().split('T')[0], // Today
    };

    (supabase.from as any).mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: mockStreak, error: null }),
        }),
      }),
    }));

    const { result } = renderHook(() => useStreakTracking(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      const status = result.current.getStreakStatus();
      expect(status.status).toBe('completed');
    });
  });
});
