
// No React imports needed
import SocialFeatureGuard from '@/components/access/SocialFeatureGuard';
import { Button } from '@/components/ui/button';
import { Share2 } from 'lucide-react';

interface SocialShareGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const SocialShareGuard: React.FC<SocialShareGuardProps> = ({ 
  children, 
  fallback 
}) => {
  const defaultFallback = (
    <Button
      variant="outline"
      onClick={() => {
        if (navigator.share) {
          navigator.share({
            title: 'Check out my workout!',
            url: window.location.origin,
          });
        } else {
          navigator.clipboard.writeText(window.location.origin);
        }
      }}
    >
      <Share2 className="w-4 h-4 mr-2" />
      Share
    </Button>
  );

  return (
    <SocialFeatureGuard fallback={fallback || defaultFallback}>
      {children}
    </SocialFeatureGuard>
  );
};

export default SocialShareGuard;
