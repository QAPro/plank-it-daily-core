
import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabase = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        maybeSingle: vi.fn(),
        single: vi.fn(),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
      gte: vi.fn(() => ({
        eq: vi.fn(),
      })),
      order: vi.fn(() => ({
        limit: vi.fn(),
        ascending: vi.fn(),
      })),
      limit: vi.fn(),
    })),
    insert: vi.fn(() => ({
      select: vi.fn(() => ({
        single: vi.fn(),
      })),
    })),
    update: vi.fn(() => ({
      eq: vi.fn(),
    })),
    upsert: vi.fn(),
    delete: vi.fn(() => ({
      eq: vi.fn(),
    })),
  })),
  auth: {
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } },
    })),
    getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    signUp: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
  },
};

// Setup default mocks
export const setupSupabaseMocks = () => {
  vi.mock('@/integrations/supabase/client', () => ({
    supabase: mockSupabase,
  }));
};

// Reset all mocks
export const resetSupabaseMocks = () => {
  vi.clearAllMocks();
};
