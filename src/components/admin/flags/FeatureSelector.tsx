
import React, { useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FEATURE_CATALOG, FEATURE_CATEGORIES, getFeaturesByCategory, type FeatureCategory, type FeatureCatalogItem } from '@/constants/featureCatalog';

interface FeatureSelectorProps {
  value: string;
  onChange: (value: string) => void;
  onFeatureSelect?: (feature: FeatureCatalogItem) => void;
}

const FeatureSelector: React.FC<FeatureSelectorProps> = ({ value, onChange, onFeatureSelect }) => {
  const [open, setOpen] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);

  const selectedFeature = FEATURE_CATALOG.find(f => f.name === value);

  const handleFeatureSelect = (feature: FeatureCatalogItem) => {
    onChange(feature.name);
    onFeatureSelect?.(feature);
    setOpen(false);
    setShowCustomInput(false);
  };

  const handleCustomFeature = () => {
    setShowCustomInput(true);
    setOpen(false);
  };

  const handleCustomInputSubmit = (customName: string) => {
    if (customName.trim()) {
      onChange(customName.trim());
      setShowCustomInput(false);
    }
  };

  if (showCustomInput) {
    return (
      <div className="space-y-2">
        <Label>Custom Feature Name</Label>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., experimental_new_feature"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCustomInputSubmit(e.currentTarget.value);
              }
            }}
            autoFocus
          />
          <Button
            variant="outline"
            onClick={() => setShowCustomInput(false)}
          >
            Cancel
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Use snake_case for feature names (e.g., my_custom_feature)
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label>Feature Name</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              {selectedFeature ? (
                <>
                  <span className="text-xs">
                    {FEATURE_CATEGORIES[selectedFeature.category].icon}
                  </span>
                  <span className="truncate">{selectedFeature.displayName}</span>
                </>
              ) : value ? (
                <>
                  <span className="text-xs">🔧</span>
                  <span className="truncate">{value}</span>
                  <Badge variant="outline" className="ml-auto">Custom</Badge>
                </>
              ) : (
                "Select a feature..."
              )}
            </div>
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search features..." />
            <CommandList>
              <CommandEmpty>No features found.</CommandEmpty>
              
              {Object.entries(FEATURE_CATEGORIES).map(([categoryKey, categoryInfo]) => {
                const features = getFeaturesByCategory(categoryKey as FeatureCategory);
                if (features.length === 0) return null;

                return (
                  <CommandGroup key={categoryKey} heading={`${categoryInfo.icon} ${categoryInfo.label}`}>
                    {features.map((feature) => (
                      <CommandItem
                        key={feature.name}
                        value={feature.name}
                        onSelect={() => handleFeatureSelect(feature)}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2">
                          <Check
                            className={cn(
                              "h-4 w-4",
                              value === feature.name ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div>
                            <div className="font-medium">{feature.displayName}</div>
                            <div className="text-xs text-muted-foreground line-clamp-1">
                              {feature.description}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge variant="outline" className="text-xs">
                            {feature.defaultAudience}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {feature.defaultRolloutPercentage}%
                          </span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                );
              })}
              
              <CommandGroup>
                <CommandItem onSelect={handleCustomFeature} className="text-muted-foreground">
                  <Plus className="mr-2 h-4 w-4" />
                  Create custom feature...
                </CommandItem>
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedFeature && (
        <div className="p-3 bg-muted/50 rounded-md">
          <p className="text-sm text-muted-foreground mb-2">{selectedFeature.description}</p>
          <div className="flex gap-2 text-xs">
            <Badge variant="outline">{FEATURE_CATEGORIES[selectedFeature.category].label}</Badge>
            <Badge variant="outline">Default: {selectedFeature.defaultAudience}</Badge>
            <Badge variant="outline">{selectedFeature.defaultRolloutPercentage}% rollout</Badge>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureSelector;
