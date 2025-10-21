import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getBadgeUrl } from "@/utils/badgeAssets";
import { useActiveAchievements } from "@/hooks/useAchievements";
import { formatDistanceToNow } from "date-fns";
import { CategoryFilter, type AchievementCategory } from "./CategoryFilter";

interface TrophyCaseSectionProps {
  recentAchievements: any[];
  loading: boolean;
  onAchievementClick: (achievement: any) => void;
}

// Individual trophy card component - receives achievement data as prop
const TrophyCard = ({ 
  userAchievement,
  achievement,
  index, 
  onAchievementClick 
}: { 
  userAchievement: any;
  achievement: any;
  index: number; 
  onAchievementClick: (achievement: any) => void;
}) => {
  // Handle missing achievement gracefully (old data or deleted achievement)
  if (!achievement) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.5 }}
      >
        <Card className="border-dashed opacity-50">
          <CardContent className="p-4 text-center">
            <div className="text-2xl mb-2">❓</div>
            <p className="text-xs text-muted-foreground">
              Achievement unavailable
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

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
  const [selectedCategory, setSelectedCategory] = useState<AchievementCategory>('All');
  
  // Fetch all achievement definitions once
  const { data: allAchievements, isLoading: achievementsLoading } = useActiveAchievements();

  // Match user achievements with achievement definitions and filter by category
  const { filteredAchievements, categoryCounts } = useMemo(() => {
    if (!recentAchievements || !allAchievements) {
      return { filteredAchievements: [], categoryCounts: {} };
    }

    // Create a map of achievement definitions
    const achievementMap = new Map(
      allAchievements.map(ach => [ach.id, ach])
    );

    // Match user achievements with definitions
    const matchedAchievements = recentAchievements
      .map(userAch => ({
        userAchievement: userAch,
        achievement: achievementMap.get(userAch.achievement_type)
      }))
      .filter(item => item.achievement); // Filter out unmatched

    // Calculate category counts
    const counts: Record<string, number> = { All: matchedAchievements.length };
    matchedAchievements.forEach(item => {
      const category = item.achievement?.category || 'Unknown';
      counts[category] = (counts[category] || 0) + 1;
    });

    // Filter by selected category
    const filtered = selectedCategory === 'All'
      ? matchedAchievements
      : matchedAchievements.filter(item => item.achievement?.category === selectedCategory);

    return { filteredAchievements: filtered, categoryCounts: counts };
  }, [recentAchievements, allAchievements, selectedCategory]);
  if (loading || achievementsLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold text-foreground mb-2">🏆 Trophy Case</h3>
            <p className="text-muted-foreground">All your earned achievements</p>
          </div>
        </div>
        <Skeleton className="h-10 w-full sm:w-[220px] sm:ml-auto" />
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

  const emptyMessage = selectedCategory === 'All' 
    ? 'Start your journey and earn your first trophy!'
    : `No ${selectedCategory} achievements yet. Keep going!`;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h3 className="text-2xl font-bold text-foreground mb-2">🏆 Trophy Case</h3>
          <p className="text-muted-foreground">All your earned achievements</p>
        </div>
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categoryCounts={categoryCounts}
        />
      </div>

      {filteredAchievements.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <p className="text-lg font-semibold text-foreground mb-2">
              {selectedCategory === 'All' ? 'No achievements yet' : `No ${selectedCategory} achievements`}
            </p>
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      ) : (
        <motion.div 
          key={selectedCategory}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4"
        >
          {filteredAchievements.map((item, index) => (
            <TrophyCard 
              key={item.userAchievement.id}
              userAchievement={item.userAchievement}
              achievement={item.achievement}
              index={index}
              onAchievementClick={onAchievementClick}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default TrophyCaseSection;
