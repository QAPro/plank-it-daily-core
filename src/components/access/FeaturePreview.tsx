

import { ReactNode } from 'react';
import { Lock, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

type FeaturePreviewProps = {
  children: ReactNode;
  height?: number;
  blur?: boolean;
  overlay?: boolean;
  onPreviewClick?: () => void;
};

const FeaturePreview = ({
  children,
  height = 200,
  blur = true,
  overlay = true,
  onPreviewClick = () => {}
}) => {
  return (
    <div 
      className="relative overflow-hidden rounded-lg border-2 border-dashed border-gray-200"
      style={{ height: `${height}px` }}
    >
      {/* Content with blur effect */}
      <div className={`${blur ? 'filter blur-sm' : ''} pointer-events-none select-none`}>
        {children}
      </div>

      {/* Overlay */}
      {overlay && (
        <div className="absolute inset-0 bg-gradient-to-t from-gray-50/90 via-gray-50/60 to-transparent flex items-center justify-center">
          <div className="text-center space-y-3 px-4">
            <div className="flex items-center justify-center space-x-2">
              <Eye className="w-5 h-5 text-gray-400" />
              <Lock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="text-sm font-medium text-gray-600">
              Premium Feature Preview
            </div>
            <div className="text-xs text-gray-500">
              Upgrade to unlock full access
            </div>
            {onPreviewClick && (
              <Button size="sm" variant="outline" onClick={onPreviewClick}>
                <Sparkles className="w-3 h-3 mr-1" />
                See More
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeaturePreview;
