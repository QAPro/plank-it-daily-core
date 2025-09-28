import { ReactNode } from 'react';
import { useUserFeatureFlag } from '@/hooks/useUserFeatureFlag';
import { useFeatureAnalytics } from '@/hooks/useFeatureAnalytics';

interface FeatureWrapperProps {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
  trackInteractions?: boolean;
}

/**
 * FeatureWrapper - Conditionally render components based on feature flags
 * 
 * This component integrates with the granular feature flag system to control
 * the visibility of UI components. It also provides analytics tracking when enabled.
 * 
 * @param featureName - The name of the feature flag to check
 * @param children - Content to render when feature is enabled
 * @param fallback - Content to render when feature is disabled (optional)
 * @param className - CSS classes to apply to the wrapper
 * @param trackInteractions - Whether to track user interactions with this feature
 * 
 * @example
 * ```tsx
 * <FeatureWrapper featureName="social_features" trackInteractions>
 *   <SocialShareButton />
 * </FeatureWrapper>
 * ```
 */
export const FeatureWrapper: React.FC<FeatureWrapperProps> = ({
  featureName,
  children,
  fallback = null,
  className,
  trackInteractions = false
}) => {
  const { enabled, loading } = useUserFeatureFlag(featureName);
  const { trackInteraction } = useFeatureAnalytics(featureName);

  // Show loading state while checking feature flag
  if (loading) {
    return null; // Or a loading skeleton if preferred
  }

  // Feature is disabled, show fallback if provided
  if (!enabled) {
    return fallback ? <>{fallback}</> : null;
  }

  // Feature is enabled, render children with optional interaction tracking
  const handleInteraction = (event: React.MouseEvent) => {
    if (trackInteractions) {
      trackInteraction('click', {
        target: (event.target as HTMLElement)?.tagName?.toLowerCase(),
        timestamp: Date.now(),
      });
    }
  };

  return (
    <div 
      className={className}
      onClick={trackInteractions ? handleInteraction : undefined}
      data-feature={featureName}
    >
      {children}
    </div>
  );
};

/**
 * Hook version for conditional logic in components
 * 
 * @example
 * ```tsx
 * const MyComponent = () => {
 *   const shouldShowSocial = useFeatureEnabled('social_features');
 *   
 *   return (
 *     <div>
 *       {shouldShowSocial && <SocialButtons />}
 *     </div>
 *   );
 * };
 * ```
 */
export const useFeatureEnabled = (featureName: string): boolean => {
  const { enabled, loading } = useUserFeatureFlag(featureName);
  return !loading && enabled;
};

export default FeatureWrapper;