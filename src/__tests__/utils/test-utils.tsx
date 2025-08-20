
import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
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

// Test data factories - Updated to match actual database schema
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockUserProfile = (overrides = {}) => ({
  id: 'test-user-id',
  full_name: 'Test User',
  username: 'testuser',
  avatar_url: 'https://example.com/avatar.jpg',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
  ...overrides,
});

export const createMockExercise = (overrides = {}) => ({
  id: 'test-exercise-id',
  name: 'Standard Plank',
  description: 'Basic plank exercise',
  difficulty_level: 1,
  category: 'core',
  primary_muscles: ['core', 'shoulders'],
  equipment_needed: [],
  estimated_calories_per_minute: 5,
  image_url: '',
  instructions: ['Get into plank position', 'Hold for target time'],
  is_beginner_friendly: true,
  tags: ['core', 'beginner'],
  created_at: '2024-01-01T00:00:00Z',
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

// Mock validation scenarios
export const createMockValidationScenarios = () => ({
  validUsername: {
    username: 'validuser123',
    validation: { isValid: true },
    availability: { isAvailable: true, isChecking: false, error: null }
  },
  
  invalidUsername: {
    username: 'ab',
    validation: { 
      isValid: false, 
      error: 'Username must be at least 3 characters long' 
    },
    availability: { isAvailable: null, isChecking: false, error: null }
  },
  
  takenUsername: {
    username: 'takenuser',
    validation: { isValid: true },
    availability: { 
      isAvailable: false, 
      isChecking: false, 
      error: null,
      suggestions: ['takenuser123', 'takenuser_2024', 'my_takenuser']
    }
  },
  
  checkingUsername: {
    username: 'checkinguser',
    validation: { isValid: true },
    availability: { 
      isAvailable: null, 
      isChecking: true, 
      error: null 
    }
  },
  
  errorUsername: {
    username: 'erroruser',
    validation: { isValid: true },
    availability: { 
      isAvailable: null, 
      isChecking: false, 
      error: 'Network error occurred' 
    }
  }
});

// Mock email validation scenarios
export const createMockEmailScenarios = () => ({
  validEmail: 'newuser@example.com',
  invalidEmails: [
    { email: '', error: 'Email address is required' },
    { email: 'invalid-email', error: 'Please enter a valid email address' },
    { email: 'current@example.com', error: 'Please enter a different email address' }
  ],
  supabaseErrors: [
    { 
      message: 'email address is already in use',
      expected: 'This email is already associated with another account.'
    },
    {
      message: 'rate limit exceeded',
      expected: 'Please wait a few minutes before trying again.'
    }
  ]
});

// Helper to mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {};
  
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    store
  };
};

// Helper to mock Supabase responses
export const mockSupabaseResponse = (data?: any, error?: any) => ({
  data,
  error,
  status: error ? 400 : 200,
  statusText: error ? 'Bad Request' : 'OK'
});

// Helper to create mock auth states
export const createMockAuthStates = () => ({
  authenticated: {
    user: createMockUser(),
    session: { access_token: 'test-token', user: createMockUser() },
    loading: false
  },
  
  unauthenticated: {
    user: null,
    session: null,
    loading: false
  },
  
  loading: {
    user: null,
    session: null,
    loading: true
  }
});
