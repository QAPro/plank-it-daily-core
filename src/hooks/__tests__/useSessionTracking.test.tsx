
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useSessionTracking } from '../useSessionTracking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockSupabase, setupSupabaseMocks, resetSupabaseMocks } from '@/__tests__/utils/mock-supabase';
import { createMockUser, createMockExercise } from '@/__tests__/utils/test-utils';

setupSupabaseMocks();

// Mock AuthContext
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: createMockUser(),
  }),
}));

// Mock toast
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Mock services
vi.mock('@/services/enhancedAchievementService', () => ({
  EnhancedAchievementService: vi.fn().mockImplementation(() => ({
    checkAchievements: vi.fn().mockResolvedValue([]),
    checkSpecialAchievements: vi.fn().mockResolvedValue([]),
  })),
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

describe('useSessionTracking', () => {
  beforeEach(() => {
    resetSupabaseMocks();
  });

  it('should save session successfully', async () => {
    const mockExercise = createMockExercise();
    const duration = 45;

    mockSupabase.from.mockImplementation((table) => {
      if (table === 'user_sessions') {
        return {
          insert: vi.fn().mockResolvedValue({ error: null }),
        };
      }
      if (table === 'user_streaks') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              maybeSingle: vi.fn().mockResolvedValue({
                data: { current_streak: 1, longest_streak: 1 },
                error: null,
              }),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn().mockResolvedValue({ error: null }),
          })),
        };
      }
      return mockSupabase.from();
    });

    const { result } = renderHook(() => useSessionTracking(), {
      wrapper: createWrapper(),
    });

    const sessionResult = await result.current.saveSession(mockExercise, duration);

    expect(sessionResult).toBeDefined();
    expect(sessionResult.newAchievements).toEqual([]);
  });

  it('should handle session save error', async () => {
    const mockExercise = createMockExercise();
    const duration = 45;

    mockSupabase.from.mockImplementation(() => ({
      insert: vi.fn().mockResolvedValue({ 
        error: { message: 'Database error' } 
      }),
    }));

    const { result } = renderHook(() => useSessionTracking(), {
      wrapper: createWrapper(),
    });

    const sessionResult = await result.current.saveSession(mockExercise, duration);

    expect(sessionResult.milestoneEvent).toBeNull();
    expect(sessionResult.newAchievements).toEqual([]);
  });
});
