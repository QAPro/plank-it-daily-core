
import { useState } from 'react';
import { Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useAnalyticsFilters } from '@/hooks/useAnalyticsFilters';
import AdvancedDateRangeFilter from './AdvancedDateRangeFilter';
import UserSegmentFilter from './UserSegmentFilter';
import FeatureCategoryFilter from './FeatureCategoryFilter';
import FilterSummary from './FilterSummary';

const AnalyticsFilterPanel = () => {
  const { 
    filters, 
    updateFilters, 
    resetFilters, 
    applyPreset, 
    hasActiveFilters, 
    presets 
  } = useAnalyticsFilters();
  
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClearFilter = (filterType: string, value?: string | number) => {
    switch (filterType) {
      case 'subscriptionTier':
        updateFilters({
          userSegments: {
            ...filters.userSegments,
            subscriptionTiers: filters.userSegments.subscriptionTiers.filter(t => t !== value)
          }
        });
        break;
      case 'levelRange':
        updateFilters({
          userSegments: {
            ...filters.userSegments,
            levelRanges: filters.userSegments.levelRanges.filter((_, i) => i !== value)
          }
        });
        break;
      case 'registrationPeriod':
        updateFilters({
          userSegments: {
            ...filters.userSegments,
            registrationPeriods: filters.userSegments.registrationPeriods.filter(p => p !== value)
          }
        });
        break;
      case 'featureCategory':
        updateFilters({
          featureCategories: filters.featureCategories.filter(c => c !== value)
        });
        break;
      case 'dateRange':
        updateFilters({
          dateRange: { start: null, end: null, preset: '30_days' }
        });
        break;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <h3 className="font-semibold">Analytics Filters</h3>
            {hasActiveFilters && (
              <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </CollapsibleTrigger>
          </Collapsible>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <FilterSummary
          filters={filters}
          hasActiveFilters={hasActiveFilters}
          onClearFilter={handleClearFilter}
          onReset={resetFilters}
        />

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleContent className="space-y-6 mt-4">
            {/* Filter Presets */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Quick Presets</label>
              <Select onValueChange={applyPreset}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a preset..." />
                </SelectTrigger>
                <SelectContent>
                  {presets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{preset.name}</span>
                        <span className="text-xs text-muted-foreground">{preset.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            {/* Date Range Filter */}
            <AdvancedDateRangeFilter
              value={filters.dateRange}
              onChange={(dateRange) => updateFilters({ dateRange })}
            />

            <Separator />

            {/* User Segment Filter */}
            <UserSegmentFilter
              value={filters.userSegments}
              onChange={(userSegments) => updateFilters({ userSegments })}
            />

            <Separator />

            {/* Feature Category Filter */}
            <FeatureCategoryFilter
              value={filters.featureCategories}
              onChange={(featureCategories) => updateFilters({ featureCategories })}
            />
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default AnalyticsFilterPanel;
