

import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import type { FeatureName } from '@/constants/featureGating';

type FeatureGuardProps = {
  feature: FeatureName;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

const FeatureGuard: React.FC<FeatureGuardProps> = ({ feature, children, fallback = null }) => {
  const { loading, hasAccess } = useFeatureAccess();

  if (loading) {
    return null; // or a skeleton if preferred
  }

  if (!hasAccess(feature)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default FeatureGuard;
