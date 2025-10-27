import React from 'react';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Target, Calendar, Lock } from 'lucide-react';
import { getBadgeUrl } from '@/utils/badgeAssets';

interface RecommendationCardProps {
  achievement: {
    name: string;
    description: string;
    points: number;
    badge_image_url?: string;
    rarity: string;
    is_premium?: boolean;
  };
  progress: number;
  recommendationReason: string;
  index: number;
  isPremiumUser?: boolean;
}

const getReasonIcon = (reason: string) => {
  switch (reason) {
    case 'almost_complete': return <Sparkles className="h-4 w-4" />;
    case 'next_tier': return <TrendingUp className="h-4 w-4" />;
    case 'category_diversity': return <Target className="h-4 w-4" />;
    case 'seasonal': return <Calendar className="h-4 w-4" />;
    default: return <Target className="h-4 w-4" />;
  }
};

const getReasonLabel = (reason: string) => {
  switch (reason) {
    case 'almost_complete': return 'Almost There!';
    case 'next_tier': return 'Next Milestone';
    case 'category_diversity': return 'Try Something New';
    case 'seasonal': return 'Limited Time';
    default: return 'Recommended';
  }
};

const getReasonColor = (reason: string) => {
  switch (reason) {
    case 'almost_complete': return 'text-green-600 bg-green-100';
    case 'next_tier': return 'text-blue-600 bg-blue-100';
    case 'category_diversity': return 'text-purple-600 bg-purple-100';
    case 'seasonal': return 'text-orange-600 bg-orange-100';
    default: return 'text-primary bg-primary/10';
  }
};

export const RecommendationCard = React.memo<RecommendationCardProps>(
  ({ achievement, progress, recommendationReason, index, isPremiumUser = false }) => {
    const isNearCompletion = progress > 90;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="relative"
      >
        <div className="p-6 rounded-lg border bg-card transition-all">
          <div className="flex items-start gap-4">
            <div className="relative flex-shrink-0">
              {achievement.badge_image_url ? (
                <img
                  src={getBadgeUrl(achievement.badge_image_url)}
                  alt={achievement.name}
                  className="w-16 h-16 object-contain"
                  loading="lazy"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Target className="h-8 w-8 text-primary" />
                </div>
              )}
              
              {/* Premium Lock Icon */}
              {achievement.is_premium && !isPremiumUser && (
                <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Lock className="h-6 w-6 text-yellow-500" />
                </div>
              )}
              
              {/* Near completion sparkle */}
              {isNearCompletion && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1"
                >
                  <Sparkles className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </motion.div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h4 className="font-semibold text-base">
                  {achievement.name}
                </h4>
                <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                  {achievement.points} pts
                </span>
              </div>

              <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                {achievement.description}
              </p>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="mt-3 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={`text-xs ${getReasonColor(recommendationReason)}`}
                >
                  {getReasonIcon(recommendationReason)}
                  <span className="ml-1">{getReasonLabel(recommendationReason)}</span>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }
);

RecommendationCard.displayName = 'RecommendationCard';
