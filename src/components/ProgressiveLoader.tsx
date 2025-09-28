import React, { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressiveLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  delay?: number;
}

export const ProgressiveLoader: React.FC<ProgressiveLoaderProps> = ({ 
  children, 
  fallback = <LoadingSpinner />,
  delay = 100 
}) => {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Show content immediately, no artificial delay
    setShowContent(true);
  }, []);

  if (!showContent) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[200px]">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

export default ProgressiveLoader;