
import { render } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: vi.fn(),
      getSession: vi.fn(),
    },
  },
}));

const TestComponent = () => {
  const { user, session, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (user) return <div>User: {user.email}</div>;
  return <div>No user</div>;
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should provide loading state initially', () => {
    const mockSubscription = { unsubscribe: vi.fn() };
    const mockOnAuthStateChange = vi.fn(() => ({ data: { subscription: mockSubscription } }));
    const mockGetSession = vi.fn(() => Promise.resolve({ data: { session: null } }));

    (supabase.auth.onAuthStateChange as any) = mockOnAuthStateChange;
    (supabase.auth.getSession as any) = mockGetSession;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should handle user session', async () => {
    const mockUser = { id: '123', email: 'test@example.com' };
    const mockSession = { user: mockUser, access_token: 'token' };
    
    const mockSubscription = { unsubscribe: vi.fn() };
    const mockOnAuthStateChange = vi.fn((callback) => {
      // Simulate auth state change
      setTimeout(() => callback('SIGNED_IN', mockSession), 0);
      return { data: { subscription: mockSubscription } };
    });
    const mockGetSession = vi.fn(() => Promise.resolve({ data: { session: mockSession } }));

    (supabase.auth.onAuthStateChange as any) = mockOnAuthStateChange;
    (supabase.auth.getSession as any) = mockGetSession;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('User: test@example.com')).toBeInTheDocument();
    });
  });

  it('should handle no user state', async () => {
    const mockSubscription = { unsubscribe: vi.fn() };
    const mockOnAuthStateChange = vi.fn((callback) => {
      setTimeout(() => callback('SIGNED_OUT', null), 0);
      return { data: { subscription: mockSubscription } };
    });
    const mockGetSession = vi.fn(() => Promise.resolve({ data: { session: null } }));

    (supabase.auth.onAuthStateChange as any) = mockOnAuthStateChange;
    (supabase.auth.getSession as any) = mockGetSession;

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('No user')).toBeInTheDocument();
    });
  });
});
