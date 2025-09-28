

import { ReactNode } from 'react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { Skeleton } from '@/components/ui/skeleton';
import UpgradePrompt from './UpgradePrompt';
import FeaturePreview from './FeaturePreview';
import type { FeatureName, SubscriptionTier } from '@/constants/featureGating';

type FeatureGuardMode = 'block' | 'preview' | 'tease';

type EnhancedFeatureGuardProps = {
  feature: FeatureName;
  children: ReactNode;
  mode?: FeatureGuardMode;
  fallback?: ReactNode;
  previewHeight?: number;
  showUpgradePrompt?: boolean;
  compact?: boolean;
  loadingSkeleton?: ReactNode;
};

const EnhancedFeatureGuard = ({ 
  feature, 
  children, 
  mode = 'block',
  fallback,
  previewHeight = 200,
  showUpgradePrompt = true,
  compact = false,
  loadingSkeleton
}) => {
  const { loading, hasAccess, requiredTierFor, tier } = useFeatureAccess();

  // Show loading state
  if (loading) {
    if (loadingSkeleton) {
      return <>{loadingSkeleton}</>;
    }
    return (
      <div className="space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className={`h-${Math.floor(previewHeight / 16)} w-full`} />
      </div>
    );
  }

  const userHasAccess = hasAccess(feature);
  const requiredTier = requiredTierFor(feature);

  // User has access - show full content
  if (userHasAccess) {
    return <>{children}</>;
  }

  // User doesn't have access - handle different modes
  switch (mode) {
    case 'preview':
      return (
        <div className="space-y-4">
          <FeaturePreview height={previewHeight}>
            {children}
          </FeaturePreview>
          {showUpgradePrompt && (
            <UpgradePrompt 
              feature={feature}
              requiredTier={requiredTier}
              currentTier={tier}
              compact={compact}
            />
          )}
        </div>
      );

    case 'tease':
      return (
        <div className="space-y-4">
          <FeaturePreview height={previewHeight} blur={false} overlay>
            {children}
          </FeaturePreview>
          {showUpgradePrompt && (
            <UpgradePrompt 
              feature={feature}
              requiredTier={requiredTier}
              currentTier={tier}
              compact={compact}
            />
          )}
        </div>
      );

    case 'block':
    default:
      if (fallback) {
        return <>{fallback}</>;
      }
      
      if (showUpgradePrompt) {
        return (
          <UpgradePrompt 
            feature={feature}
            requiredTier={requiredTier}
            currentTier={tier}
            compact={compact}
          />
        );
      }

      return null;
  }
};

export default EnhancedFeatureGuard;
