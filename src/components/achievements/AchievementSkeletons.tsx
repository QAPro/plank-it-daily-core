import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AchievementStatsSkeletons = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <CardContent className="p-4 text-center">
          <Skeleton className="h-8 w-16 mx-auto mb-1" />
          <Skeleton className="h-4 w-20 mx-auto" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const AchievementCategorySkeleton = () => (
  <div className="flex flex-wrap gap-3">
    {[...Array(5)].map((_, i) => (
      <Card key={i} className="flex-1 min-w-[140px]">
        <CardContent className="p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-4 w-16" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export const AchievementCardSkeletons = ({ count = 12 }: { count?: number }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {[...Array(count)].map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: i * 0.05, duration: 0.3 }}
      >
        <Card>
          <CardContent className="p-4">
            <div className="flex items-start space-x-3 mb-4">
              <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <Skeleton className="h-5 w-32 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            </div>
            <Skeleton className="h-2 w-full mb-3 rounded-full" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded" />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    ))}
  </div>
);

export const LoadingIndicator = ({ text = "Loading achievements..." }: { text?: string }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="flex flex-col items-center justify-center py-8 space-y-4"
  >
    <div className="relative">
      <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin" />
      <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-r-blue-500 rounded-full animate-pulse" />
    </div>
    <div className="text-center space-y-1">
      <p className="text-lg font-semibold text-gray-700">{text}</p>
      <p className="text-sm text-gray-500">Calculating your progress...</p>
    </div>
  </motion.div>
);

export const ProgressiveLoadingIndicator = ({ 
  earnedCount, 
  totalCount,
  currentPhase = "Loading earned achievements..."
}: {
  earnedCount: number;
  totalCount: number;
  currentPhase?: string;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-gradient-to-r from-orange-50 to-blue-50 border border-orange-200 rounded-lg p-4 mb-4"
  >
    <div className="flex items-center justify-between mb-2">
      <span className="text-sm font-medium text-gray-700">{currentPhase}</span>
      <span className="text-xs text-gray-500">{earnedCount}/{totalCount}</span>
    </div>
    <div className="w-full bg-gray-200 rounded-full h-2">
      <motion.div
        className="bg-gradient-to-r from-orange-400 to-blue-500 h-2 rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${Math.min((earnedCount / totalCount) * 100, 100)}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      />
    </div>
  </motion.div>
);