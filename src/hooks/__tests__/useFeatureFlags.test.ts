import React from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFeatureFlags } from '../useFeatureFlags';
import { createMockFeatureFlag } from '@/__tests__/utils/test-utils';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  
  const Wrapper = ({ children }: { children: React.ReactNode }) => (
    React.createElement(QueryClientProvider, { client: queryClient }, children)
  );
  
  return Wrapper;
};

describe('useFeatureFlags', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should load feature flags successfully', async () => {
    const mockFlags = [
      createMockFeatureFlag({ feature_name: 'social_features', is_enabled: true }),
      createMockFeatureFlag({ feature_name: 'events', is_enabled: false }),
    ];

    const mockFeatureService = {
      getFeatureFlags: jest.fn().mockResolvedValue(mockFlags),
    };

    jest.doMock('@/services/featureManagementService', () => ({
      featureManagementService: mockFeatureService,
    }));

    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.flags).toHaveLength(2);
    expect(result.current.socialFeaturesEnabled).toBe(true);
    expect(result.current.eventsEnabled).toBe(false);
  });

  it('should check feature enabled correctly', async () => {
    const mockFlags = [
      createMockFeatureFlag({ feature_name: 'test_feature', is_enabled: true }),
    ];

    jest.doMock('@/services/featureManagementService', () => ({
      featureManagementService: {
        getFeatureFlags: jest.fn().mockResolvedValue(mockFlags),
      },
    }));

    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.isFeatureEnabled('test_feature')).toBe(true);
    expect(result.current.isFeatureEnabled('non_existent_feature')).toBe(false);
  });

  it('should handle hierarchical features correctly', async () => {
    const parentFlag = createMockFeatureFlag({ 
      id: 'parent-id',
      feature_name: 'parent_feature', 
      is_enabled: true 
    });
    
    const childFlag = createMockFeatureFlag({ 
      id: 'child-id',
      feature_name: 'child_feature', 
      is_enabled: true,
      parent_feature_id: 'parent-id'
    });

    const mockFlags = [parentFlag, childFlag];

    jest.doMock('@/services/featureManagementService', () => ({
      featureManagementService: {
        getFeatureFlags: jest.fn().mockResolvedValue(mockFlags),
      },
    }));

    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const parentFeatures = result.current.getParentFeatures();
    const childFeatures = result.current.getChildFeatures('parent-id');

    expect(parentFeatures).toHaveLength(1);
    expect(parentFeatures[0].feature_name).toBe('parent_feature');
    expect(childFeatures).toHaveLength(1);
    expect(childFeatures[0].feature_name).toBe('child_feature');
    expect(result.current.hasChildren('parent-id')).toBe(true);
  });

  it('should toggle parent and children together', async () => {
    const parentFlag = createMockFeatureFlag({ 
      id: 'parent-id',
      feature_name: 'parent_feature', 
      is_enabled: true 
    });
    
    const childFlag = createMockFeatureFlag({ 
      id: 'child-id',
      feature_name: 'child_feature', 
      is_enabled: true,
      parent_feature_id: 'parent-id'
    });

    const mockToggle = jest.fn().mockResolvedValue(undefined);

    jest.doMock('@/services/featureManagementService', () => ({
      featureManagementService: {
        getFeatureFlags: jest.fn().mockResolvedValue([parentFlag, childFlag]),
        setFeatureEnabled: mockToggle,
      },
    }));

    const { result } = renderHook(() => useFeatureFlags(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.toggleParentAndChildren('parent_feature', false);

    expect(mockToggle).toHaveBeenCalledWith('parent_feature', false);
    expect(mockToggle).toHaveBeenCalledWith('child_feature', false);
  });
});