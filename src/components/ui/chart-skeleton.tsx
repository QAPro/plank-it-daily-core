
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface ChartSkeletonProps {
  title?: boolean;
  height?: string;
  bars?: number;
  lines?: number;
  showLegend?: boolean;
}

export const ChartSkeleton = ({ 
  title = true, 
  height = "h-80", 
  bars = 0, 
  lines = 0,
  showLegend = false 
}: ChartSkeletonProps) => {
  return (
    <Card>
      <CardHeader>
        {title && <Skeleton className="h-6 w-48" />}
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <div className={`${height} space-y-2`}>
          {/* Chart area skeleton */}
          <div className="flex items-end justify-between h-full space-x-1">
            {bars > 0 && [...Array(bars)].map((_, i) => (
              <Skeleton 
                key={`bar-${i}`} 
                className="w-8 animate-pulse" 
                style={{ height: `${Math.random() * 60 + 20}%` }}
              />
            ))}
            {lines > 0 && (
              <div className="w-full h-full relative">
                {[...Array(lines)].map((_, i) => (
                  <Skeleton 
                    key={`line-${i}`} 
                    className="absolute w-full h-0.5 animate-pulse"
                    style={{ top: `${(i + 1) * (100 / (lines + 1))}%` }}
                  />
                ))}
              </div>
            )}
            {bars === 0 && lines === 0 && (
              <Skeleton className="w-full h-full rounded-lg" />
            )}
          </div>
        </div>
        {showLegend && (
          <div className="flex justify-center space-x-4 mt-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const KPICardSkeleton = () => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-8 rounded-full" />
      </div>
      <div className="mt-4">
        <Skeleton className="h-3 w-32" />
      </div>
    </CardContent>
  </Card>
);
