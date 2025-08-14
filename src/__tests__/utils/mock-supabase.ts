
import { vi } from 'vitest';

// Mock Supabase client with proper typing
export const mockSupabase = {
  from: vi.fn((table: string) => ({
    select: vi.fn((columns: string = '*') => ({
      eq: vi.fn((column: string, value: any) => ({
        maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
        order: vi.fn((column: string, options?: any) => ({
          limit: vi.fn((count: number) => Promise.resolve({ data: [], error: null })),
        })),
      })),
      gte: vi.fn((column: string, value: any) => ({
        eq: vi.fn((column: string, value: any) => Promise.resolve({ data: [], error: null })),
      })),
      order: vi.fn((column: string, options?: any) => ({
        limit: vi.fn((count: number) => Promise.resolve({ data: [], error: null })),
        ascending: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
      limit: vi.fn((count: number) => Promise.resolve({ data: [], error: null })),
    })),
    insert: vi.fn((data: any) => ({
      select: vi.fn((columns?: string) => ({
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
    update: vi.fn((data: any) => ({
      eq: vi.fn((column: string, value: any) => Promise.resolve({ error: null })),
    })),
    upsert: vi.fn((data: any) => Promise.resolve({ error: null })),
    delete: vi.fn(() => ({
      eq: vi.fn((column: string, value: any) => Promise.resolve({ error: null })),
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
