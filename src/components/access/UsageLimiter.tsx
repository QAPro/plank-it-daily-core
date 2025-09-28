
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Crown, ArrowRight } from 'lucide-react';

type UsageLimiterProps = {
  feature: string;
  current: number;
  limit: number;
  unit: string;
  onUpgrade?: () => void;
  resetPeriod?: string;
  compact?: boolean;
};

const UsageLimiter = ({
  feature,
  current,
  limit,
  unit,
  onUpgrade,
  resetPeriod = 'monthly',
  compact = false
}) => {
  const percentage = Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = current >= limit;

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span className="text-sm font-medium text-amber-800">
            {current}/{limit} {unit} used
          </span>
        </div>
        {onUpgrade && (
          <Button size="sm" variant="outline" onClick={onUpgrade}>
            <Crown className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`${isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-amber-200 bg-amber-50' : 'border-blue-200 bg-blue-50'}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <AlertTriangle className={`w-4 h-4 ${isAtLimit ? 'text-red-600' : isNearLimit ? 'text-amber-600' : 'text-blue-600'}`} />
            {feature} Usage
          </span>
          <Badge variant={isAtLimit ? 'destructive' : isNearLimit ? 'outline' : 'secondary'}>
            Free Plan
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Used this {resetPeriod}</span>
            <span className="font-medium">{current} / {limit} {unit}</span>
          </div>
          <Progress 
            value={percentage} 
            className={`h-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-amber-100' : 'bg-blue-100'}`}
          />
        </div>

        {isAtLimit ? (
          <div className="text-center space-y-3">
            <p className="text-sm text-red-700 font-medium">
              You've reached your {resetPeriod} limit
            </p>
            <p className="text-xs text-red-600">
              Upgrade to continue using {feature.toLowerCase()}
            </p>
          </div>
        ) : isNearLimit ? (
          <div className="text-center space-y-2">
            <p className="text-sm text-amber-700">
              You're approaching your {resetPeriod} limit
            </p>
            <p className="text-xs text-amber-600">
              Consider upgrading for unlimited access
            </p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-xs text-gray-600">
              Resets {resetPeriod} • Upgrade for unlimited access
            </p>
          </div>
        )}

        {onUpgrade && (
          <Button 
            onClick={onUpgrade} 
            className="w-full" 
            variant={isAtLimit ? 'default' : 'outline'}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageLimiter;
