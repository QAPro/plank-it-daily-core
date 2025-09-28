
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Star, Zap, Crown, ArrowRight } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import type { FeatureName, SubscriptionTier } from '@/constants/featureGating';

type UpgradePromptProps = {
  feature: FeatureName;
  requiredTier: SubscriptionTier;
  currentTier: SubscriptionTier;
  onUpgrade?: () => void;
  compact?: boolean;
};

const UpgradePrompt = ({ 
  feature, 
  requiredTier, 
  currentTier, 
  onUpgrade = undefined,
  compact = false 
}: UpgradePromptProps) => {
  const { plans, upgrade, loading } = useSubscription();

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
      default: return 'Free';
    }
  };

  const getTierIcon = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'premium': return Star;
      default: return Zap;
    }
  };

  const getTierColor = (tier: SubscriptionTier) => {
    switch (tier) {
      case 'premium': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  // Updated: choose the monthly plan for the required tier using billing_interval
  const findRecommendedPlan = () => {
    const tierMatch = (name: string) => {
      const lower = name.toLowerCase();
      if (requiredTier === 'premium') return lower.includes('premium');
      return false;
    };

    // Prefer monthly plan for the correct tier
    const monthly = plans.find(p => tierMatch(p.name) && (p.billing_interval as string) === 'month');
    if (monthly) return monthly;

    // Fallback to any plan of the required tier
    return plans.find(p => tierMatch(p.name));
  };

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
      return;
    }

    const recommendedPlan = findRecommendedPlan();
    if (recommendedPlan) {
      upgrade(recommendedPlan);
    }
  };

  const TierIcon = getTierIcon(requiredTier);
  const featureDisplay = getFeatureDisplayName(feature);
  const tierDisplay = getTierDisplayName(requiredTier);
  const recommendedPlan = findRecommendedPlan();

  if (compact) {
    return (
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-600">
            {featureDisplay} requires {tierDisplay}
          </span>
        </div>
        <Button 
          size="sm" 
          onClick={handleUpgrade}
          disabled={loading}
          className="flex items-center"
        >
          {loading ? 'Loading...' : 'Upgrade'}
          <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
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
          {recommendedPlan && (
            <div className="mt-2 text-center">
              Upgrade to <strong>{recommendedPlan.name}</strong> for{' '}
              <strong>${(recommendedPlan.price_cents / 100).toFixed(2)}/{(recommendedPlan.billing_interval as string)}</strong>
            </div>
          )}
        </div>

        <Button 
          onClick={handleUpgrade} 
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Processing...' : `Upgrade to ${tierDisplay}`}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default UpgradePrompt;