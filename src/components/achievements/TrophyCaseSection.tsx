import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getBadgeUrl } from "@/utils/badgeAssets";
import { useAchievementById } from "@/hooks/useAchievements";
import { formatDistanceToNow } from "date-fns";

interface TrophyCaseSectionProps {
  recentAchievements: any[];
  loading: boolean;
  onAchievementClick: (achievement: any) => void;
}

// Individual trophy card component that fetches its own achievement data
const TrophyCard = ({ 
  userAchievement, 
  index, 
  onAchievementClick 
}: { 
  userAchievement: any; 
  index: number; 
  onAchievementClick: (achievement: any) => void;
}) => {
  const { data: achievement, isLoading } = useAchievementById(userAchievement.achievement_type);

  if (isLoading || !achievement) return null;

  return (
    <motion.div
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
              src={getBadgeUrl(achievement.badge_file_name)}
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
};

const TrophyCaseSection = ({ 
  recentAchievements, 
  loading, 
  onAchievementClick
}: TrophyCaseSectionProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">🏆 Trophy Case</h3>
            <p className="text-muted-foreground">All your earned achievements</p>
          </div>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
            <h3 className="text-2xl font-bold text-foreground mb-2">🏆 Trophy Case</h3>
            <p className="text-muted-foreground">All your earned achievements</p>
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
          <h3 className="text-2xl font-bold text-foreground mb-2">🏆 Trophy Case</h3>
          <p className="text-muted-foreground">All your earned achievements</p>
        </div>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {recentAchievements.map((userAchievement, index) => (
          <TrophyCard 
            key={userAchievement.id}
            userAchievement={userAchievement}
            index={index}
            onAchievementClick={onAchievementClick}
          />
        ))}
      </div>
    </div>
  );
};

export default TrophyCaseSection;
