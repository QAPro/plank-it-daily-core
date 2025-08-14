
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { StreakProvider } from '@/components/StreakProvider';

// Create a custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <AuthProvider>
          <StreakProvider>
            {children}
          </StreakProvider>
        </AuthProvider>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };

// Test data factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockExercise = (overrides = {}) => ({
  id: 'test-exercise-id',
  name: 'Standard Plank',
  description: 'Basic plank exercise',
  difficulty_level: 'beginner',
  target_duration: 30,
  instructions: ['Get into plank position', 'Hold for target time'],
  ...overrides,
});

export const createMockSession = (overrides = {}) => ({
  id: 'test-session-id',
  user_id: 'test-user-id',
  exercise_id: 'test-exercise-id',
  duration_seconds: 30,
  completed_at: '2024-01-01T12:00:00Z',
  notes: null,
  ...overrides,
});

export const createMockStreak = (overrides = {}) => ({
  id: 'test-streak-id',
  user_id: 'test-user-id',
  current_streak: 5,
  longest_streak: 10,
  last_workout_date: '2024-01-01',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockAchievement = (overrides = {}) => ({
  id: 'test-achievement-id',
  user_id: 'test-user-id',
  achievement_type: 'streak',
  achievement_name: 'First Steps',
  description: 'Complete your first workout',
  earned_at: '2024-01-01T12:00:00Z',
  metadata: {},
  ...overrides,
});
