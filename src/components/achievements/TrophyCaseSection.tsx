import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getBadgeUrl } from "@/utils/badgeAssets";
import { getAchievementById } from "@/services/achievementHelpers";
import { formatDistanceToNow } from "date-fns";

interface TrophyCaseSectionProps {
  recentAchievements: any[];
  loading: boolean;
  onAchievementClick: (achievement: any) => void;
  onViewAllClick: () => void;
}

const TrophyCaseSection = ({ 
  recentAchievements, 
  loading, 
  onAchievementClick, 
  onViewAllClick 
}: TrophyCaseSectionProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">🏆 Recent Trophies</h3>
            <p className="text-muted-foreground">Your latest achievements</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!recentAchievements || recentAchievements.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">🏆 Recent Trophies</h3>
            <p className="text-muted-foreground">Your latest achievements</p>
          </div>
        </div>
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-lg font-semibold text-foreground mb-2">No achievements yet</p>
            <p className="text-muted-foreground">Start your journey and earn your first trophy!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">🏆 Recent Trophies</h3>
          <p className="text-muted-foreground">Your latest achievements</p>
        </div>
        <Button 
          variant="ghost" 
          onClick={onViewAllClick}
          className="flex items-center gap-1 text-primary hover:text-primary/80"
        >
          View All
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {recentAchievements.slice(0, 6).map((userAchievement, index) => {
          // Find the full achievement definition
          const achievement = getAchievementById(userAchievement.achievement_type);
          if (!achievement) return null;

          return (
            <motion.div
              key={userAchievement.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card 
                className="hover:shadow-lg transition-all cursor-pointer border-border/50"
                onClick={() => onAchievementClick(achievement)}
              >
                <CardContent className="p-4 text-center space-y-3">
                  {/* Badge Image */}
                  <div className="flex justify-center">
                    <img 
                      src={getBadgeUrl(achievement.badgeFileName)}
                      alt={achievement.name}
                      className="w-20 h-20 object-contain"
                    />
                  </div>

                  {/* Achievement Info */}
                  <div>
                    <h4 className="font-semibold text-foreground text-sm mb-1 line-clamp-2">
                      {achievement.name}
                    </h4>
                    <p className="text-xs text-muted-foreground mb-2">
                      {formatDistanceToNow(new Date(userAchievement.earned_at), { addSuffix: true })}
                    </p>
                    <p className="text-xs font-bold text-primary">
                      {achievement.points} pts
                    </p>
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

export default TrophyCaseSection;
