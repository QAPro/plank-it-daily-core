import { motion } from "framer-motion";
import { Flame, ArrowUp, Calendar, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { getBadgeUrl } from "@/utils/badgeAssets";
import type { RecommendedAchievement } from "@/services/whatsNextRecommendations";

interface WhatsNextSectionProps {
  recommendations: RecommendedAchievement[];
  loading: boolean;
  onAchievementClick: (achievement: any) => void;
}

const WhatsNextSection = ({ recommendations, loading, onAchievementClick }: WhatsNextSectionProps) => {
  const getReasonIcon = (recommendationReason: string) => {
    if (recommendationReason === 'almost_complete') return Flame;
    if (recommendationReason === 'next_tier') return ArrowUp;
    if (recommendationReason === 'seasonal_timely') return Calendar;
    return Sparkles;
  };

  const getReasonColor = (recommendationReason: string) => {
    if (recommendationReason === 'almost_complete') return "bg-orange-500/10 text-orange-500 border-orange-500/20";
    if (recommendationReason === 'next_tier') return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    if (recommendationReason === 'seasonal_timely') return "bg-green-500/10 text-green-500 border-green-500/20";
    return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  };

  const getReasonLabel = (recommendationReason: string) => {
    if (recommendationReason === 'almost_complete') return 'Almost there!';
    if (recommendationReason === 'next_tier') return 'Next challenge';
    if (recommendationReason === 'seasonal_timely') return 'Seasonal';
    return 'Explore new';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">🎯 What's Next?</h3>
          <p className="text-muted-foreground">Achievements recommended just for you</p>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="space-y-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">🎯 What's Next?</h3>
          <p className="text-muted-foreground">Achievements recommended just for you</p>
        </div>
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <p className="text-lg font-semibold text-foreground mb-2">You're doing amazing!</p>
            <p className="text-muted-foreground">Keep working out to unlock more achievements</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-bold text-foreground mb-2">🎯 What's Next?</h3>
        <p className="text-muted-foreground">Achievements recommended just for you</p>
      </div>
      
      <div className="space-y-3">
        {recommendations.map((rec, index) => {
          const ReasonIcon = getReasonIcon(rec.recommendationReason);
          const progressPercent = rec.progress.isComplete 
            ? 100 
            : Math.round((rec.progress.current / rec.progress.required) * 100);

          return (
            <motion.div
              key={rec.achievement.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-border/50 bg-card/50"
                onClick={() => onAchievementClick(rec.achievement)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Badge Icon */}
                    <div className="flex-shrink-0">
                      <img 
                        src={getBadgeUrl(rec.achievement.badgeFileName)}
                        alt={rec.achievement.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h4 className="font-semibold text-foreground text-lg">
                          {rec.achievement.name}
                        </h4>
                        <span className="text-sm font-bold text-muted-foreground whitespace-nowrap">
                          {rec.achievement.points} pts
                        </span>
                      </div>

                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {rec.achievement.description}
                      </p>

                      {/* Progress Bar with animation */}
                      {!rec.progress.isComplete && (
                        <div className="space-y-2">
                          <motion.div
                            key={`${rec.achievement.id}-${progressPercent}`}
                            initial={{ scale: 1 }}
                            animate={{ 
                              scale: progressPercent > 50 ? [1, 1.02, 1] : 1 
                            }}
                            transition={{ duration: 0.3 }}
                          >
                            <Progress value={progressPercent} className="h-2" />
                          </motion.div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">
                              {rec.progress.current} / {rec.progress.required} ({progressPercent}%)
                            </span>
                            <Badge 
                              variant="outline" 
                              className={`${getReasonColor(rec.recommendationReason)} text-xs flex items-center gap-1`}
                            >
                              <ReasonIcon className="w-3 h-3" />
                              {getReasonLabel(rec.recommendationReason)}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default WhatsNextSection;
