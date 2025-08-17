
import React from "react";
import { useUserFeatureFlag } from "@/hooks/useUserFeatureFlag";

type FlagGuardProps = {
  featureName: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

const FlagGuard: React.FC<FlagGuardProps> = ({ featureName, children, fallback = null }) => {
  const { loading, enabled } = useUserFeatureFlag(featureName);

  if (loading) return null;
  if (!enabled) return <>{fallback}</>;

  return <>{children}</>;
};

export default FlagGuard;
