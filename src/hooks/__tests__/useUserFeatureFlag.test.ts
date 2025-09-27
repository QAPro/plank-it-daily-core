import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserFeatureFlag } from '../useUserFeatureFlag';
import { mockSupabase } from '@/__tests__/utils/test-utils';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
  
  return Wrapper;
};

// Mock AuthContext
const mockUser = { id: 'test-user-id' };
jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

describe('useUserFeatureFlag', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return enabled feature flag with enhanced function', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({
      data: true,
      error: null,
    });

    const { result } = renderHook(() => useUserFeatureFlag('test_feature'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabled).toBe(true);
    expect(result.current.variant).toBe('enabled');
    expect(result.current.source).toBe('feature_flag');
    expect(mockSupabase.rpc).toHaveBeenCalledWith('is_feature_enabled_with_parents', {
      _feature_name: 'test_feature',
    });
  });

  it('should fallback to original function when enhanced fails', async () => {
    mockSupabase.rpc
      .mockRejectedValueOnce(new Error('Enhanced function failed'))
      .mockResolvedValueOnce({
        data: { enabled: true, variant: 'test_variant', source: 'user_override' },
        error: null,
      });

    const { result } = renderHook(() => useUserFeatureFlag('test_feature'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabled).toBe(true);
    expect(result.current.variant).toBe('test_variant');
    expect(result.current.source).toBe('user_override');
    expect(mockSupabase.rpc).toHaveBeenCalledWith('get_user_feature_flag', {
      _user_id: 'test-user-id',
      _feature_name: 'test_feature',
    });
  });

  it('should handle disabled feature flag', async () => {
    mockSupabase.rpc.mockResolvedValueOnce({
      data: false,
      error: null,
    });

    const { result } = renderHook(() => useUserFeatureFlag('disabled_feature'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.enabled).toBe(false);
    expect(result.current.variant).toBe('enabled');
    expect(result.current.source).toBe('feature_flag');
  });

  it('should not query when user is not authenticated', () => {
    jest.doMock('@/contexts/AuthContext', () => ({
      useAuth: () => ({ user: null }),
    }));

    const { result } = renderHook(() => useUserFeatureFlag('test_feature'), {
      wrapper: createWrapper(),
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.enabled).toBe(false);
    expect(mockSupabase.rpc).not.toHaveBeenCalled();
  });

  it('should handle RPC errors gracefully', async () => {
    mockSupabase.rpc
      .mockRejectedValueOnce(new Error('Enhanced function failed'))
      .mockResolvedValueOnce({
        data: null,
        error: { message: 'RPC Error' },
      });

    const { result } = renderHook(() => useUserFeatureFlag('test_feature'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.enabled).toBe(false);
  });
});