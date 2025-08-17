
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

type ProgressMeterProps = {
  current: number;
  target: number;
  label?: string;
  unit?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  showPercentage?: boolean;
  showValues?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
};

const ProgressMeter: React.FC<ProgressMeterProps> = ({
  current,
  target,
  label,
  unit = '',
  variant = 'default',
  showPercentage = true,
  showValues = true,
  size = 'md',
  animated = false
}) => {
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));
  const isComplete = current >= target;

  const getVariantColor = (variantType: string) => {
    switch (variantType) {
      case 'success': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'danger': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getHeightClass = (sizeVariant: string) => {
    switch (sizeVariant) {
      case 'sm': return 'h-2';
      case 'lg': return 'h-4';
      default: return 'h-3';
    }
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      {(label || showPercentage || showValues) && (
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {label && <span className="font-medium text-gray-700">{label}</span>}
            {isComplete && (
              <Badge variant="default" className="bg-green-500 text-white text-xs">
                Complete!
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            {showValues && (
              <span>
                {formatValue(current)}{unit} / {formatValue(target)}{unit}
              </span>
            )}
            {showPercentage && (
              <span className="font-medium">
                {percentage.toFixed(0)}%
              </span>
            )}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="relative">
        <Progress
          value={percentage}
          className={`${getHeightClass(size)} ${animated ? 'transition-all duration-500 ease-out' : ''}`}
        />
        
        {/* Overflow indicator for values exceeding target */}
        {current > target && (
          <div className="absolute top-0 right-0 w-1 h-full bg-yellow-400 rounded-r-full" />
        )}
      </div>

      {/* Additional info for over-achievement */}
      {current > target && (
        <div className="text-xs text-yellow-600 text-right">
          +{formatValue(current - target)}{unit} over target!
        </div>
      )}
    </div>
  );
};

export default ProgressMeter;
