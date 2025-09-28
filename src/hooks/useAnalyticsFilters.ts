
import { useState, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface AnalyticsFilters {
  dateRange: {
    start: Date | null;
    end: Date | null;
    preset: string;
  };
  userSegments: {
    subscriptionTiers: string[];
    levelRanges: { min: number; max: number }[];
    registrationPeriods: string[];
  };
  featureCategories: string[];
  customFilters: Record<string, any>;
}

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  filters: Partial<AnalyticsFilters>;
}

const DEFAULT_FILTERS: AnalyticsFilters = {
  dateRange: {
    start: null,
    end: null,
    preset: '30_days'
  },
  userSegments: {
    subscriptionTiers: [],
    levelRanges: [],
    registrationPeriods: []
  },
  featureCategories: [],
  customFilters: {}
};

const FILTER_PRESETS: FilterPreset[] = [
  {
    id: 'new_users',
    name: 'New Users Analysis',
    description: 'Focus on users registered in the last 30 days',
    filters: {
      dateRange: { start: null, end: null, preset: '30_days' },
      userSegments: {
        subscriptionTiers: [],
        levelRanges: [],
        registrationPeriods: ['last_30_days']
      }
    }
  },
  {
    id: 'premium_users',
    name: 'Premium Users',
    description: 'Analysis of premium and pro subscribers',
    filters: {
      userSegments: {
        subscriptionTiers: ['premium', 'pro'],
        levelRanges: [],
        registrationPeriods: []
      }
    }
  },
  {
    id: 'advanced_users',
    name: 'Advanced Users',
    description: 'Users at level 10 and above',
    filters: {
      userSegments: {
        subscriptionTiers: [],
        levelRanges: [{ min: 10, max: 100 }],
        registrationPeriods: []
      }
    }
  }
];

export const useAnalyticsFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState<AnalyticsFilters>(() => {
    // Initialize from URL params if available
    const urlFilters = searchParams.get('filters');
    if (urlFilters) {
      try {
        return { ...DEFAULT_FILTERS, ...JSON.parse(decodeURIComponent(urlFilters)) };
      } catch {
        return DEFAULT_FILTERS;
      }
    }
    return DEFAULT_FILTERS;
  });

  const updateFilters = useCallback((newFilters: Partial<AnalyticsFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    
    // Update URL params
    const params = new URLSearchParams(searchParams);
    params.set('filters', encodeURIComponent(JSON.stringify(updatedFilters)));
    setSearchParams(params);
  }, [filters, searchParams, setSearchParams]);

  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    const params = new URLSearchParams(searchParams);
    params.delete('filters');
    setSearchParams(params);
  }, [searchParams, setSearchParams]);

  const applyPreset = useCallback((presetId: string) => {
    const preset = FILTER_PRESETS.find(p => p.id === presetId);
    if (preset) {
      updateFilters(preset.filters);
    }
  }, [updateFilters]);

  // Convert filters to API parameters
  const apiParams = useMemo(() => {
    const params: Record<string, any> = {};
    
    // Date range
    if (filters.dateRange.start && filters.dateRange.end) {
      params.start_date = filters.dateRange.start.toISOString();
      params.end_date = filters.dateRange.end.toISOString();
    } else if (filters.dateRange.preset) {
      const days = getDaysFromPreset(filters.dateRange.preset);
      params.days_back = days;
    }
    
    // User segments
    if (filters.userSegments.subscriptionTiers.length > 0) {
      params.subscription_tiers = filters.userSegments.subscriptionTiers;
    }
    
    if (filters.userSegments.levelRanges.length > 0) {
      params.level_ranges = filters.userSegments.levelRanges;
    }
    
    if (filters.featureCategories.length > 0) {
      params.feature_categories = filters.featureCategories;
    }
    
    return params;
  }, [filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.userSegments.subscriptionTiers.length > 0 ||
      filters.userSegments.levelRanges.length > 0 ||
      filters.userSegments.registrationPeriods.length > 0 ||
      filters.featureCategories.length > 0 ||
      Object.keys(filters.customFilters).length > 0
    );
  }, [filters]);

  return {
    filters,
    updateFilters,
    resetFilters,
    applyPreset,
    apiParams,
    hasActiveFilters,
    presets: FILTER_PRESETS
  };
};

const getDaysFromPreset = (preset: string): number => {
  switch (preset) {
    case '7_days': return 7;
    case '30_days': return 30;
    case '90_days': return 90;
    case '180_days': return 180;
    case '365_days': return 365;
    default: return 30;
  }
};
