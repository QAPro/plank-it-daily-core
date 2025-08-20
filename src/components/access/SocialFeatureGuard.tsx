
import React from 'react';
import { isSocialEnabled } from '@/constants/featureGating';

interface SocialFeatureGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const SocialFeatureGuard: React.FC<SocialFeatureGuardProps> = ({ 
  children, 
  fallback = null 
}) => {
  if (!isSocialEnabled()) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default SocialFeatureGuard;
