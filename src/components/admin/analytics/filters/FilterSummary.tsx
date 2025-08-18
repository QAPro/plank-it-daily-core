
import { X, RotateCcw, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { AnalyticsFilters } from '@/hooks/useAnalyticsFilters';

interface FilterSummaryProps {
  filters: AnalyticsFilters;
  hasActiveFilters: boolean;
  onClearFilter: (filterType: string, value?: string | number) => void;
  onReset: () => void;
  onSavePreset?: () => void;
}

const FilterSummary = ({ 
  filters, 
  hasActiveFilters, 
  onClearFilter, 
  onReset, 
  onSavePreset 
}: FilterSummaryProps) => {
  if (!hasActiveFilters) {
    return (
      <div className="text-sm text-muted-foreground py-2">
        No filters applied. All data is shown.
      </div>
    );
  }

  const renderFilterBadges = () => {
    const badges = [];

    // Subscription tiers
    filters.userSegments.subscriptionTiers.forEach(tier => {
      badges.push(
        <Badge key={`tier-${tier}`} variant="secondary" className="gap-1">
          {tier.charAt(0).toUpperCase() + tier.slice(1)} Users
          <X 
            className="w-3 h-3 cursor-pointer hover:text-red-500" 
            onClick={() => onClearFilter('subscriptionTier', tier)}
          />
        </Badge>
      );
    });

    // Level ranges
    filters.userSegments.levelRanges.forEach((range, index) => {
      badges.push(
        <Badge key={`level-${index}`} variant="secondary" className="gap-1">
          Level {range.min}-{range.max}
          <X 
            className="w-3 h-3 cursor-pointer hover:text-red-500" 
            onClick={() => onClearFilter('levelRange', index)}
          />
        </Badge>
      );
    });

    // Registration periods
    filters.userSegments.registrationPeriods.forEach(period => {
      badges.push(
        <Badge key={`period-${period}`} variant="secondary" className="gap-1">
          {period.replace('_', ' ').replace('last ', 'Registered in last ')}
          <X 
            className="w-3 h-3 cursor-pointer hover:text-red-500" 
            onClick={() => onClearFilter('registrationPeriod', period)}
          />
        </Badge>
      );
    });

    // Feature categories
    filters.featureCategories.forEach(category => {
      badges.push(
        <Badge key={`category-${category}`} variant="secondary" className="gap-1">
          {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          <X 
            className="w-3 h-3 cursor-pointer hover:text-red-500" 
            onClick={() => onClearFilter('featureCategory', category)}
          />
        </Badge>
      );
    });

    // Date range
    if (filters.dateRange.preset !== '30_days' || filters.dateRange.start || filters.dateRange.end) {
      let dateLabel = '';
      if (filters.dateRange.start && filters.dateRange.end) {
        dateLabel = `${filters.dateRange.start.toLocaleDateString()} - ${filters.dateRange.end.toLocaleDateString()}`;
      } else {
        dateLabel = filters.dateRange.preset.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
      
      badges.push(
        <Badge key="dateRange" variant="secondary" className="gap-1">
          {dateLabel}
          <X 
            className="w-3 h-3 cursor-pointer hover:text-red-500" 
            onClick={() => onClearFilter('dateRange')}
          />
        </Badge>
      );
    }

    return badges;
  };

  return (
    <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Active Filters</span>
          <span className="text-xs text-muted-foreground">
            ({renderFilterBadges().length} applied)
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          {onSavePreset && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSavePreset}
              className="h-auto py-1 px-2"
            >
              <Bookmark className="w-3 h-3 mr-1" />
              Save
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-auto py-1 px-2 text-red-600 hover:text-red-700"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset All
          </Button>
        </div>
      </div>

      <Separator />

      <div className="flex flex-wrap gap-2">
        {renderFilterBadges()}
      </div>
    </div>
  );
};

export default FilterSummary;
