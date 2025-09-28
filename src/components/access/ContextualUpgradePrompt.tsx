
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, Users, TrendingUp, Zap } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';
import type { FeatureName } from '@/constants/featureGating';

type ContextualUpgradePromptProps = {
  feature: FeatureName;
  trigger: 'attempt' | 'hover' | 'view';
  onDismiss?: () => void;
  compact?: boolean;
};

const ContextualUpgradePrompt: React.FC<ContextualUpgradePromptProps> = ({
  feature,
  trigger,
  onDismiss,
  compact = false
}) => {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { plans, upgrade, loading } = useSubscription();

  useEffect(() => {
    if (dismissed) return;
    
    const timer = setTimeout(() => {
      setVisible(true);
    }, trigger === 'hover' ? 1000 : 500);

    return () => clearTimeout(timer);
  }, [trigger, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setVisible(false);
    onDismiss?.();
  };

  const getFeatureIcon = (featureName: FeatureName) => {
    switch (featureName) {
      case 'advanced_stats': return TrendingUp;
      case 'smart_recommendations': return Sparkles;
      case 'social_challenges': return Users;
      case 'custom_workouts': return Zap;
      default: return Sparkles;
    }
  };

  const getFeatureBenefit = (featureName: FeatureName) => {
    switch (featureName) {
      case 'advanced_stats': return 'Get detailed progress tracking and insights';
      case 'smart_recommendations': return 'Receive personalized workout suggestions';
      case 'social_challenges': return 'Compete with friends and join challenges';
      case 'custom_workouts': return 'Create unlimited custom workout routines';
      default: return 'Unlock premium features and advanced functionality';
    }
  };

  if (!visible || dismissed) return null;

  const FeatureIcon = getFeatureIcon(feature);
  const benefit = getFeatureBenefit(feature);
  const recommendedPlan = plans.find(p => p.name.toLowerCase().includes('premium'));

  if (compact) {
    return (
      <div className="fixed bottom-20 right-4 max-w-sm z-50 animate-in slide-in-from-bottom-2">
        <Card className="border-orange-200 shadow-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <FeatureIcon className="w-4 h-4 text-orange-500" />
                <Badge variant="outline" className="text-xs">Premium</Badge>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={handleDismiss}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <p className="text-sm text-gray-700 mb-3">{benefit}</p>
            <Button 
              size="sm" 
              className="w-full" 
              onClick={() => recommendedPlan && upgrade(recommendedPlan)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Upgrade Now'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full border-orange-200 shadow-xl animate-in zoom-in-95">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-full">
                <FeatureIcon className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Unlock Premium Feature</h3>
                <Badge variant="outline" className="mt-1">Premium Required</Badge>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-gray-600 mb-4">{benefit}</p>

          {recommendedPlan && (
            <div className="bg-orange-50 rounded-lg p-3 mb-4">
              <div className="text-sm font-medium text-orange-900">
                {recommendedPlan.name}
              </div>
              <div className="text-lg font-bold text-orange-900">
                ${(recommendedPlan.price_cents / 100).toFixed(2)}/month
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleDismiss} className="flex-1">
              Maybe Later
            </Button>
            <Button 
              onClick={() => recommendedPlan && upgrade(recommendedPlan)}
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Loading...' : 'Upgrade Now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ContextualUpgradePrompt;
