
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Calendar, TrendingUp, Star, Award } from "lucide-react";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { useAchievementProgress } from "@/hooks/useAchievementProgress";
import { EnhancedAchievementService, ACHIEVEMENT_CATEGORIES } from "@/services/enhancedAchievementService";
import AchievementCategories, { AchievementCategory } from "@/components/achievements/AchievementCategories";
import AchievementProgressCard from "@/components/achievements/AchievementProgressCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const AchievementsGallery = () => {
  const { achievements: earnedAchievements, loading: achievementsLoading } = useUserAchievements();
  const { achievementProgress, loading: progressLoading } = useAchievementProgress();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryIcons = {
    streak: <Calendar className="w-6 h-6 text-white" />,
    duration: <Target className="w-6 h-6 text-white" />,
    consistency: <TrendingUp className="w-6 h-6 text-white" />,
    progress: <Trophy className="w-6 h-6 text-white" />
  };

  const categoryColors = {
    streak: 'bg-gradient-to-br from-blue-500 to-blue-600',
    duration: 'bg-gradient-to-br from-green-500 to-green-600',
    consistency: 'bg-gradient-to-br from-purple-500 to-purple-600',
    progress: 'bg-gradient-to-br from-orange-500 to-orange-600'
  };

  const categories: AchievementCategory[] = useMemo(() => {
    const earnedSet = new Set(earnedAchievements?.map(a => a.achievement_name) || []);
    
    const categoryData = ACHIEVEMENT_CATEGORIES.map(category => {
      const categoryAchievements = category.achievements;
      const earnedCount = categoryAchievements.filter(a => earnedSet.has(a.name)).length;
      
      return {
        id: category.id,
        name: category.name,
        description: category.description,
        icon: categoryIcons[category.id as keyof typeof categoryIcons] || <Star className="w-6 h-6 text-white" />,
        color: categoryColors[category.id as keyof typeof categoryColors] || 'bg-gradient-to-br from-gray-500 to-gray-600',
        count: categoryAchievements.length,
        earnedCount
      };
    });

    // Add "All" category
    const totalEarned = earnedAchievements?.length || 0;
    const totalAvailable = ACHIEVEMENT_CATEGORIES.reduce((sum, cat) => sum + cat.achievements.length, 0);
    
    return [
      {
        id: 'all',
        name: 'All',
        description: 'View all achievements',
        icon: <Award className="w-6 h-6 text-white" />,
        color: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
        count: totalAvailable,
        earnedCount: totalEarned
      },
      ...categoryData
    ];
  }, [earnedAchievements]);

  const filteredProgress = useMemo(() => {
    if (selectedCategory === 'all') {
      return achievementProgress;
    }
    return achievementProgress.filter(ap => ap.achievement.type === selectedCategory);
  }, [achievementProgress, selectedCategory]);

  // Sort achievements: earned first, then by progress percentage
  const sortedProgress = useMemo(() => {
    return [...filteredProgress].sort((a, b) => {
      if (a.isEarned && !b.isEarned) return -1;
      if (!a.isEarned && b.isEarned) return 1;
      if (!a.isEarned && !b.isEarned) {
        return b.progressPercentage - a.progressPercentage;
      }
      return 0;
    });
  }, [filteredProgress]);

  if (achievementsLoading || progressLoading) {
    return (
      <div className="space-y-6">
        {/* Category skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-12 w-12 mx-auto mb-3 rounded-full" />
                <Skeleton className="h-4 w-16 mx-auto mb-2" />
                <Skeleton className="h-3 w-12 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Achievement cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(9)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-start space-x-3 mb-4">
                  <Skeleton className="h-12 w-12 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full mb-3" />
                <div className="flex justify-between">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Achievement Categories */}
      <AchievementCategories 
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Achievement Progress Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {sortedProgress.map((progressItem, index) => (
          <motion.div
            key={progressItem.achievement.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
          >
            <AchievementProgressCard
              achievement={progressItem.achievement}
              isEarned={progressItem.isEarned}
              currentProgress={progressItem.currentProgress}
              showProgress={!progressItem.isEarned}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty state */}
      {sortedProgress.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No achievements yet</h3>
          <p className="text-gray-500">Start working out to earn your first achievement!</p>
        </motion.div>
      )}
    </div>
  );
};

export default AchievementsGallery;
