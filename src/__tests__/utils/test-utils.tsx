import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

// Mock Supabase client
export const mockSupabase = {
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: () => ({
    select: () => mockSupabase.from(),
    insert: () => mockSupabase.from(),
    update: () => mockSupabase.from(),
    delete: () => mockSupabase.from(),
    eq: () => mockSupabase.from(),
    order: () => mockSupabase.from(),
    limit: () => mockSupabase.from(),
  }),
  rpc: () => Promise.resolve({ data: null, error: null }),
};

// Test factories
export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  username: 'testuser',
  subscription_tier: 'free',
  current_level: 1,
  total_xp: 100,
  created_at: new Date().toISOString(),
  ...overrides,
});

export const createMockFeatureFlag = (overrides = {}) => ({
  id: 'test-flag-id',
  feature_name: 'test_feature',
  is_enabled: true,
  description: 'Test feature flag',
  targeting_rules: {},
  rollout_strategy: 'all_users',
  parent_feature_id: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  ...overrides,
});

export const createMockExercise = (overrides = {}) => ({
  id: 'test-exercise-id',
  name: 'Test Exercise',
  category: 'planking',
  difficulty_level: 1,
  description: 'A test exercise',
  duration_seconds: 30,
  created_at: new Date().toISOString(),
  equipment_needed: [],
  estimated_calories_per_minute: 5,
  image_url: 'test-image.jpg',
  instructions: ['Test instruction'],
  is_beginner_friendly: true,
  primary_muscles: ['core'],
  tags: ['test'],
  ...overrides,
});

// Custom render function
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          {children}
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };