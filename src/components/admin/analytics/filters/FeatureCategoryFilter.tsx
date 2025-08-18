
import { useState } from 'react';
import { Settings, Heart, Trophy, Crown, Zap, BarChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface FeatureCategoryFilterProps {
  value: string[];
  onChange: (categories: string[]) => void;
}

const FEATURE_CATEGORIES = [
  { 
    value: 'core_features', 
    label: 'Core Features', 
    icon: Settings,
    description: 'Basic plank exercises, timer, sessions'
  },
  { 
    value: 'social_features', 
    label: 'Social Features', 
    icon: Heart,
    description: 'Friends, activity sharing, challenges'
  },
  { 
    value: 'gamification', 
    label: 'Gamification', 
    icon: Trophy,
    description: 'Achievements, levels, streaks, XP'
  },
  { 
    value: 'premium_features', 
    label: 'Premium Features', 
    icon: Crown,
    description: 'Advanced analytics, custom workouts'
  },
  { 
    value: 'ai_features', 
    label: 'AI Features', 
    icon: Zap,
    description: 'Smart recommendations, coaching'
  },
  { 
    value: 'analytics_features', 
    label: 'Analytics Features', 
    icon: BarChart,
    description: 'Performance tracking, insights'
  }
];

const FeatureCategoryFilter = ({ value, onChange }: FeatureCategoryFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCategoryChange = (category: string, checked: boolean) => {
    const newCategories = checked
      ? [...value, category]
      : value.filter(c => c !== category);
    
    onChange(newCategories);
  };

  const selectAll = () => {
    onChange(FEATURE_CATEGORIES.map(cat => cat.value));
  };

  const clearAll = () => {
    onChange([]);
  };

  const hasActiveFilters = value.length > 0;

  return (
    <div className="space-y-3">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">Feature Categories</span>
              {hasActiveFilters && (
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {value.length}
                </span>
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 mt-3">
          <div className="flex justify-between">
            <Button variant="ghost" size="sm" onClick={selectAll} className="h-auto p-1 text-xs">
              Select All
            </Button>
            <Button variant="ghost" size="sm" onClick={clearAll} className="h-auto p-1 text-xs">
              Clear All
            </Button>
          </div>

          <div className="space-y-3">
            {FEATURE_CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <div key={category.value} className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`category-${category.value}`}
                      checked={value.includes(category.value)}
                      onCheckedChange={(checked) => handleCategoryChange(category.value, !!checked)}
                    />
                    <Label htmlFor={`category-${category.value}`} className="flex items-center gap-2 text-sm font-medium">
                      <Icon className="w-4 h-4" />
                      {category.label}
                    </Label>
                  </div>
                  <p className="text-xs text-muted-foreground ml-6 pl-2">
                    {category.description}
                  </p>
                </div>
              );
            })}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default FeatureCategoryFilter;
