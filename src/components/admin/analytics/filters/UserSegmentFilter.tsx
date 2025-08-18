
import { useState } from 'react';
import { Users, Crown, Trophy, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface UserSegments {
  subscriptionTiers: string[];
  levelRanges: { min: number; max: number }[];
  registrationPeriods: string[];
}

interface UserSegmentFilterProps {
  value: UserSegments;
  onChange: (segments: UserSegments) => void;
}

const SUBSCRIPTION_TIERS = [
  { value: 'free', label: 'Free Users', icon: Users },
  { value: 'premium', label: 'Premium Users', icon: Crown },
  { value: 'pro', label: 'Pro Users', icon: Trophy }
];

const REGISTRATION_PERIODS = [
  { value: 'last_7_days', label: 'Registered in last 7 days' },
  { value: 'last_30_days', label: 'Registered in last 30 days' },
  { value: 'last_90_days', label: 'Registered in last 90 days' },
  { value: 'last_6_months', label: 'Registered in last 6 months' },
  { value: 'last_year', label: 'Registered in last year' }
];

const UserSegmentFilter = ({ value, onChange }: UserSegmentFilterProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [customLevelRange, setCustomLevelRange] = useState({ min: 1, max: 10 });

  const handleSubscriptionTierChange = (tier: string, checked: boolean) => {
    const newTiers = checked
      ? [...value.subscriptionTiers, tier]
      : value.subscriptionTiers.filter(t => t !== tier);
    
    onChange({ ...value, subscriptionTiers: newTiers });
  };

  const handleRegistrationPeriodChange = (period: string, checked: boolean) => {
    const newPeriods = checked
      ? [...value.registrationPeriods, period]
      : value.registrationPeriods.filter(p => p !== period);
    
    onChange({ ...value, registrationPeriods: newPeriods });
  };

  const addLevelRange = () => {
    const newRanges = [...value.levelRanges, customLevelRange];
    onChange({ ...value, levelRanges: newRanges });
  };

  const removeLevelRange = (index: number) => {
    const newRanges = value.levelRanges.filter((_, i) => i !== index);
    onChange({ ...value, levelRanges: newRanges });
  };

  const hasActiveFilters = value.subscriptionTiers.length > 0 || 
                          value.levelRanges.length > 0 || 
                          value.registrationPeriods.length > 0;

  return (
    <div className="space-y-3">
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium">User Segments</span>
              {hasActiveFilters && (
                <span className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  {value.subscriptionTiers.length + value.levelRanges.length + value.registrationPeriods.length}
                </span>
              )}
            </div>
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4 mt-3">
          {/* Subscription Tiers */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">SUBSCRIPTION TIERS</Label>
            <div className="space-y-2">
              {SUBSCRIPTION_TIERS.map((tier) => {
                const Icon = tier.icon;
                return (
                  <div key={tier.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={`tier-${tier.value}`}
                      checked={value.subscriptionTiers.includes(tier.value)}
                      onCheckedChange={(checked) => handleSubscriptionTierChange(tier.value, !!checked)}
                    />
                    <Label htmlFor={`tier-${tier.value}`} className="flex items-center gap-2 text-sm">
                      <Icon className="w-3 h-3" />
                      {tier.label}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Level Ranges */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">USER LEVELS</Label>
            <div className="space-y-2">
              {value.levelRanges.map((range, index) => (
                <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                  <span className="text-sm">Level {range.min} - {range.max}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeLevelRange(index)}
                    className="h-auto p-1 text-red-500 hover:text-red-700"
                  >
                    ×
                  </Button>
                </div>
              ))}
              
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={customLevelRange.min}
                  onChange={(e) => setCustomLevelRange({ ...customLevelRange, min: parseInt(e.target.value) || 1 })}
                  className="w-20 h-8"
                  min={1}
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={customLevelRange.max}
                  onChange={(e) => setCustomLevelRange({ ...customLevelRange, max: parseInt(e.target.value) || 10 })}
                  className="w-20 h-8"
                  min={customLevelRange.min}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addLevelRange}
                  className="h-8 px-2"
                >
                  Add
                </Button>
              </div>
            </div>
          </div>

          <Separator />

          {/* Registration Periods */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-muted-foreground">REGISTRATION PERIOD</Label>
            <div className="space-y-2">
              {REGISTRATION_PERIODS.map((period) => (
                <div key={period.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`period-${period.value}`}
                    checked={value.registrationPeriods.includes(period.value)}
                    onCheckedChange={(checked) => handleRegistrationPeriodChange(period.value, !!checked)}
                  />
                  <Label htmlFor={`period-${period.value}`} className="flex items-center gap-2 text-sm">
                    <Calendar className="w-3 h-3" />
                    {period.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default UserSegmentFilter;
