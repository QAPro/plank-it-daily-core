

import { ReactNode } from 'react';
import { useUserFeatureFlag } from "@/hooks/useUserFeatureFlag";

type FlagGuardProps = {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
};

const FlagGuard = ({ featureName, children, fallback = null }: FlagGuardProps) => {
  const { loading, enabled, error } = useUserFeatureFlag(featureName);

  // Add detailed logging for debugging
  console.log('[FlagGuard]', featureName, { loading, enabled, error });

  if (loading) {
    console.log('[FlagGuard] Loading feature flag:', featureName);
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-orange-600 text-lg">Loading...</div>
      </div>
    );
  }
  
  if (error) {
    console.error('[FlagGuard] Error loading feature flag:', featureName, error);
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-red-600 text-lg">Error loading feature. Please refresh.</div>
      </div>
    );
  }
  
  if (!enabled) {
    console.log('[FlagGuard] Feature disabled:', featureName);
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-orange-600 text-lg">Feature not available</div>
      </div>
    );
  }

  console.log('[FlagGuard] Feature enabled, rendering children:', featureName);
  return <>{children}</>;
};

export default FlagGuard;
