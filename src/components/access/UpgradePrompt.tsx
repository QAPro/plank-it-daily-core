
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Star, Zap, Crown } from 'lucide-react';
import type { FeatureName, SubscriptionTier } from '@/constants/featureGating';

type UpgradePromptProps = {
  feature: FeatureName;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  onUpgrade?: () => void;
  compact?: boolean;
};

const UpgradePrompt: React.FC<UpgradePromptProps> = ({ 
  feature, 
  requiredTier, 
  currentTier, 
  onUpgrade,
  compact = false 
}) => {
  const getFeatureDisplayName = (featureName: FeatureName) => {
    switch (featureName) {
      case 'advanced_stats': return 'Advanced Statistics';
      case 'smart_recommendations': return 'Smart Recommendations';
      case 'social_challenges': return 'Social Challenges';
      case 'custom_workouts': return 'Custom Workouts';
      case 'priority_support': return 'Priority Support';
      default: return featureName;
    }
  };

  const getTierDisplayName = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'premium': return 'Premium';
      case 'pro': return 'Pro';
      default: return tier;
    }
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'premium': return Star;
      case 'pro': return Crown;
      default: return Zap;
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'premium': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'pro': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const TierIcon = getTierIcon(requiredTier);
  const featureDisplay = getFeatureDisplayName(feature);
  const tierDisplay = getTierDisplayName(requiredTier);

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            {featureDisplay} requires {tierDisplay}
          </span>
        </div>
        {onUpgrade && (
          <Button size="sm" onClick={onUpgrade}>
            Upgrade
          </Button>
        )}
      </div>
    );
  }

  return (
    <Card className={`border-2 border-dashed ${getTierColor(requiredTier)} bg-opacity-50`}>
      <CardHeader className="text-center pb-3">
        <div className="mx-auto w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-2">
          <Lock className="w-6 h-6 text-gray-400" />
        </div>
        <CardTitle className="text-lg">Unlock {featureDisplay}</CardTitle>
        <CardDescription>
          This feature is available with {tierDisplay} subscription
        </CardDescription>
      </CardHeader>

      <CardContent className="text-center space-y-4">
        <Badge 
          variant="outline" 
          className={`${getTierColor(requiredTier)} border-2`}
        >
          <TierIcon className="w-4 h-4 mr-1" />
          {tierDisplay} Feature
        </Badge>

        <div className="text-sm text-gray-600">
          You're currently on the <strong>{getTierDisplayName(currentTier)}</strong> plan.
          Upgrade to access this feature and many more!
        </div>

        {onUpgrade && (
          <Button onClick={onUpgrade} className="w-full">
            Upgrade to {tierDisplay}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;
