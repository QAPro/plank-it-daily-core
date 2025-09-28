

import { ReactNode } from 'react';
import { useUserFeatureFlag } from "@/hooks/useUserFeatureFlag";

type FlagGuardProps = {
  featureName: string;
  children: ReactNode;
  fallback?: ReactNode;
};

const FlagGuard = ({ featureName, children, fallback = null }: FlagGuardProps) => {
  const { loading, enabled } = useUserFeatureFlag(featureName);

  if (loading) return null;
  if (!enabled) return <>{fallback}</>;

  return <>{children}</>;
};

export default FlagGuard;
