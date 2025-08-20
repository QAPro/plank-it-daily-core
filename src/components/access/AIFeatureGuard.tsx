
import React from 'react';
import { isAIEnabled } from '@/constants/featureGating';

interface AIFeatureGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Component that conditionally renders AI features based on the environment configuration.
 * When AI is disabled, it renders nothing (or an optional fallback).
 */
const AIFeatureGuard: React.FC<AIFeatureGuardProps> = ({ children, fallback = null }) => {
  if (!isAIEnabled()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AIFeatureGuard;
