
import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Target, Calendar, TrendingUp, Star, Award, Heart, Dumbbell, Activity, Zap, User, Gauge } from "lucide-react";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { useExpandedAchievementProgress } from "@/hooks/useExpandedAchievementProgress";
import { EXPANDED_ACHIEVEMENTS } from "@/services/expandedAchievementService";
import AchievementCategories, { AchievementCategory } from "@/components/achievements/AchievementCategories";
import EnhancedAchievementCard from "@/components/achievements/EnhancedAchievementCard";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import FlagGuard from '@/components/access/FlagGuard';

const AchievementsGallery = () => {
  const { achievements: earnedAchievements, loading: achievementsLoading } = useUserAchievements();
  const { achievementProgress, loading: progressLoading } = useExpandedAchievementProgress();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categoryIcons = {
    consistency: <Calendar className="w-6 h-6 text-white" />,
    performance: <Trophy className="w-6 h-6 text-white" />,
    exploration: <Star className="w-6 h-6 text-white" />,
    milestone: <Target className="w-6 h-6 text-white" />,
    category_specific: <Activity className="w-6 h-6 text-white" />,
    cross_category: <TrendingUp className="w-6 h-6 text-white" />,
    // Exercise category icons
    cardio: <Heart className="w-6 h-6 text-white" />,
    leg_lift: <Dumbbell className="w-6 h-6 text-white" />,
    planking: <Activity className="w-6 h-6 text-white" />,
    seated_exercise: <User className="w-6 h-6 text-white" />,
    standing_movement: <Zap className="w-6 h-6 text-white" />,
    strength: <Gauge className="w-6 h-6 text-white" />
  };

  const categoryColors = {
    consistency: 'bg-gradient-to-br from-orange-500 to-red-600',
    performance: 'bg-gradient-to-br from-blue-500 to-purple-600',
    exploration: 'bg-gradient-to-br from-green-500 to-teal-600',
    milestone: 'bg-gradient-to-br from-purple-500 to-pink-600',
    category_specific: 'bg-gradient-to-br from-indigo-500 to-blue-600',
    cross_category: 'bg-gradient-to-br from-yellow-500 to-orange-600',
    // Exercise category colors
    cardio: 'bg-gradient-to-br from-red-500 to-pink-600',
    leg_lift: 'bg-gradient-to-br from-blue-600 to-indigo-700',
    planking: 'bg-gradient-to-br from-green-600 to-emerald-700',
    seated_exercise: 'bg-gradient-to-br from-purple-600 to-violet-700',
    standing_movement: 'bg-gradient-to-br from-yellow-600 to-amber-700',
    strength: 'bg-gradient-to-br from-gray-600 to-slate-700'
  };

  const categories: AchievementCategory[] = useMemo(() => {
    const earnedSet = new Set(earnedAchievements?.map(a => a.achievement_name) || []);
    
    // Main achievement categories
    const mainCategories = ['consistency', 'performance', 'exploration', 'milestone', 'category_specific', 'cross_category'];
    const categoryData = mainCategories.map(categoryId => {
      const categoryAchievements = EXPANDED_ACHIEVEMENTS.filter(a => a.category === categoryId);
      const earnedCount = categoryAchievements.filter(a => earnedSet.has(a.name)).length;
      
      return {
        id: categoryId,
        name: categoryId === 'category_specific' ? 'Exercise Specific' : 
              categoryId === 'cross_category' ? 'Multi-Exercise' :
              categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        description: `View ${categoryId.replace('_', ' ')} achievements`,
        icon: categoryIcons[categoryId as keyof typeof categoryIcons] || <Star className="w-6 h-6 text-white" />,
        color: categoryColors[categoryId as keyof typeof categoryColors] || 'bg-gradient-to-br from-gray-500 to-gray-600',
        count: categoryAchievements.length,
        earnedCount
      };
    });

    // Exercise categories for category_specific achievements
    const exerciseCategories = ['cardio', 'leg_lift', 'planking', 'seated_exercise', 'standing_movement', 'strength'];
    const exerciseCategoryData = exerciseCategories.map(categoryId => {
      const categoryAchievements = EXPANDED_ACHIEVEMENTS.filter(a => 
        a.category === 'category_specific' && 
        a.requirement.conditions?.exercise_categories?.includes(categoryId)
      );
      const earnedCount = categoryAchievements.filter(a => earnedSet.has(a.name)).length;
      
      return {
        id: categoryId,
        name: categoryId === 'leg_lift' ? 'Leg Lift' :
              categoryId === 'seated_exercise' ? 'Seated Exercise' :
              categoryId === 'standing_movement' ? 'Standing Movement' :
              categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        description: `View ${categoryId.replace('_', ' ')} achievements`,
        icon: categoryIcons[categoryId as keyof typeof categoryIcons] || <Star className="w-6 h-6 text-white" />,
        color: categoryColors[categoryId as keyof typeof categoryColors] || 'bg-gradient-to-br from-gray-500 to-gray-600',
        count: categoryAchievements.length,
        earnedCount
      };
    });

    // Add "All" category
    const totalEarned = earnedAchievements?.length || 0;
    const totalAvailable = EXPANDED_ACHIEVEMENTS.length;
    
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
      ...categoryData,
      ...exerciseCategoryData
    ];
  }, [earnedAchievements]);

  const filteredProgress = useMemo(() => {
    if (selectedCategory === 'all') {
      return achievementProgress;
    }
    
    // Handle exercise categories
    if (['cardio', 'leg_lift', 'planking', 'seated_exercise', 'standing_movement', 'strength'].includes(selectedCategory)) {
      return achievementProgress.filter(ap => 
        ap.achievement.category === 'category_specific' &&
        ap.achievement.requirement.conditions?.exercise_categories?.includes(selectedCategory)
      );
    }
    
    return achievementProgress.filter(ap => ap.achievement.category === selectedCategory);
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
    <FlagGuard featureName="achievements_gallery">
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
              <EnhancedAchievementCard
                achievementProgress={progressItem}
                onClick={() => {}}
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
    </FlagGuard>
  );
};

export default AchievementsGallery;
