

import { ReactNode } from 'react';
import { isAIEnabled } from '@/constants/featureGating';

interface AIFeatureGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component that conditionally renders AI features based on the environment configuration.
 * When AI is disabled, it renders nothing (or an optional fallback).
 */
const AIFeatureGuard = ({ children, fallback = null }: AIFeatureGuardProps) => {
  if (!isAIEnabled()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AIFeatureGuard;
