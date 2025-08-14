
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useEnhancedSessionTracking } from '../useEnhancedSessionTracking';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { mockSupabase, setupSupabaseMocks, resetSupabaseMocks } from '@/__tests__/utils/mock-supabase';
import { createMockUser, createMockExercise } from '@/__tests__/utils/test-utils';

setupSupabaseMocks();

// Mock dependencies
vi.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: createMockUser() }),
}));

vi.mock('@/hooks/useExercises', () => ({
  useExercises: () => ({
    data: [createMockExercise()],
    isLoading: false,
  }),
}));

vi.mock('@/components/StreakProvider', () => ({
  useStreak: () => ({
    showMilestone: vi.fn(),
  }),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('@/services/expandedAchievementService', () => ({
  ExpandedAchievementEngine: vi.fn().mockImplementation(() => ({
    checkAllAchievements: vi.fn().mockResolvedValue([]),
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

describe('useEnhancedSessionTracking', () => {
  beforeEach(() => {
    resetSupabaseMocks();
    vi.clearAllTimers();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should start and manage timer correctly', () => {
    const { result } = renderHook(() => useEnhancedSessionTracking(), {
      wrapper: createWrapper(),
    });

    const mockExercise = createMockExercise();

    act(() => {
      result.current.startSession(mockExercise);
    });

    expect(result.current.selectedExercise).toEqual(mockExercise);
    expect(result.current.isTimerRunning).toBe(true);
    expect(result.current.sessionDuration).toBe(0);

    // Advance timer
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.sessionDuration).toBe(5);
  });

  it('should pause and resume timer', () => {
    const { result } = renderHook(() => useEnhancedSessionTracking(), {
      wrapper: createWrapper(),
    });

    const mockExercise = createMockExercise();

    act(() => {
      result.current.startSession(mockExercise);
    });

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.sessionDuration).toBe(3);

    act(() => {
      result.current.pauseSession();
    });

    expect(result.current.isTimerRunning).toBe(false);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Time should not advance when paused
    expect(result.current.sessionDuration).toBe(3);

    act(() => {
      result.current.resumeSession();
    });

    expect(result.current.isTimerRunning).toBe(true);

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(result.current.sessionDuration).toBe(5);
  });

  it('should complete session successfully', async () => {
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'user_sessions') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { id: 'session-id', duration_seconds: 30 },
                error: null,
              }),
            })),
          })),
        };
      }
      if (table === 'user_streaks') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({
                data: { current_streak: 1 },
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

    const { result } = renderHook(() => useEnhancedSessionTracking(), {
      wrapper: createWrapper(),
    });

    const mockExercise = createMockExercise();

    act(() => {
      result.current.selectExercise(mockExercise);
    });

    await act(async () => {
      await result.current.completeSession(30, 'Great workout!');
    });

    await waitFor(() => {
      expect(result.current.completedSession).toBeDefined();
      expect(result.current.completedSession?.duration).toBe(30);
    });
  });
});
