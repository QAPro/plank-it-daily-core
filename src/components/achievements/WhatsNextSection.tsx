import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { RecommendedAchievement } from '@/services/whatsNextRecommendations';
import { RecommendationCard } from './RecommendationCard';
import { EmptyStateDisplay, EMPTY_STATES } from './EmptyStatesConfig';

interface WhatsNextSectionProps {
  recommendations: RecommendedAchievement[];
  loading: boolean;
  onAchievementClick: (achievement: any) => void;
  error?: Error;
  isRefetching?: boolean;
  totalAchievements?: number;
  earnedCount?: number;
}

const WhatsNextSection: React.FC<WhatsNextSectionProps> = ({
  recommendations,
  loading,
  onAchievementClick,
  error,
  isRefetching,
  totalAchievements = 0,
  earnedCount = 0,
}) => {
  // Memoize filtered recommendations to prevent unnecessary recalculations
  const validRecommendations = useMemo(() => {
    return recommendations.filter(rec => 
      rec?.achievement?.name && 
      rec?.progress !== undefined &&
      rec?.achievement?.id
    );
  }, [recommendations]);

  // Determine empty state scenario
  const emptyStateConfig = useMemo(() => {
    if (error) {
      return EMPTY_STATES.ERROR_LOADING(() => window.location.reload());
    }
    
    if (earnedCount === 0) {
      return EMPTY_STATES.NEW_USER;
    }
    
    if (earnedCount >= totalAchievements && totalAchievements > 0) {
      return EMPTY_STATES.ALL_EARNED;
    }
    
    // Check premium wall scenario
    if (earnedCount > 0 && validRecommendations.length === 0) {
      return EMPTY_STATES.PREMIUM_WALL();
    }
    
    return null;
  }, [error, earnedCount, totalAchievements, validRecommendations]);

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">🎯 What's Next?</h3>
          <p className="text-muted-foreground">Achievements recommended just for you</p>
        </div>
        {isRefetching && !loading && (
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            Refreshing...
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border-border/50 bg-card/50">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-16 h-16 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-5 w-3/4 animate-pulse" />
                    <Skeleton className="h-4 w-full animate-pulse" />
                    <Skeleton className="h-2 w-full animate-pulse" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-24 animate-pulse" />
                      <Skeleton className="h-6 w-16 animate-pulse" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : validRecommendations.length === 0 ? (
        emptyStateConfig ? (
          <EmptyStateDisplay config={emptyStateConfig} />
        ) : (
          <Card className="border-dashed">
            <CardContent className="p-8 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <p className="text-lg font-semibold text-foreground mb-2">You're doing amazing!</p>
              <p className="text-muted-foreground">Keep working out to unlock more achievements</p>
            </CardContent>
          </Card>
        )
      ) : (
        <div className="space-y-3">
          {validRecommendations.map((rec, index) => {
            const progressPercent = rec.progress.isComplete 
              ? 100 
              : Math.round((rec.progress.current / rec.progress.required) * 100);

            return (
              <RecommendationCard
                key={rec.achievement.id}
                achievement={{
                  name: rec.achievement.name,
                  description: rec.achievement.description,
                  points: rec.achievement.points,
                  badge_image_url: rec.achievement.badgeFileName,
                  rarity: rec.achievement.rarity,
                }}
                progress={progressPercent}
                recommendationReason={rec.recommendationReason}
                onClick={() => onAchievementClick(rec.achievement)}
                index={index}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default WhatsNextSection;
