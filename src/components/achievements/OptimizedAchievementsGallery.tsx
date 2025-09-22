import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Star, Target, Award, Search, RefreshCw } from "lucide-react";
import { useOptimizedAchievementProgress } from "@/hooks/useOptimizedAchievementProgress";
import { EXPANDED_ACHIEVEMENTS } from "@/services/expandedAchievementService";
import EnhancedAchievementCard from "./EnhancedAchievementCard";
import EnhancedAchievementCelebration from "./EnhancedAchievementCelebration";
import { 
  AchievementStatsSkeletons, 
  AchievementCategorySkeleton, 
  AchievementCardSkeletons,
  LoadingIndicator,
  ProgressiveLoadingIndicator 
} from "./AchievementSkeletons";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const OptimizedAchievementsGallery = () => {
  const { 
    achievementProgress, 
    loading, 
    earnedCount, 
    totalCount,
    refetch, 
    needsRefresh,
    progressiveLoading
  } = useOptimizedAchievementProgress();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const categoryIcons = {
    consistency: <Clock className="w-5 h-5" />,
    performance: <Trophy className="w-5 h-5" />,
    exploration: <Star className="w-5 h-5" />,
    milestone: <Target className="w-5 h-5" />,
    social: <Award className="w-5 h-5" />
  };

  const categoryColors = {
    consistency: 'from-orange-400 to-red-500',
    performance: 'from-blue-400 to-purple-500',
    exploration: 'from-green-400 to-teal-500',
    milestone: 'from-purple-400 to-pink-500',
    social: 'from-yellow-400 to-orange-500'
  };

  const categories = useMemo(() => {
    const earnedSet = new Set(
      achievementProgress
        .filter(ap => ap.isEarned)
        .map(ap => ap.achievement.name)
    );
    
    const categoryData = ['consistency', 'performance', 'exploration', 'milestone'].map(categoryId => {
      const categoryAchievements = EXPANDED_ACHIEVEMENTS.filter(a => a.category === categoryId);
      const earnedCount = categoryAchievements.filter(a => earnedSet.has(a.name)).length;
      
      return {
        id: categoryId,
        name: categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        icon: categoryIcons[categoryId as keyof typeof categoryIcons],
        color: categoryColors[categoryId as keyof typeof categoryColors],
        count: categoryAchievements.length,
        earnedCount
      };
    });

    return [
      {
        id: 'all',
        name: 'All',
        icon: <Award className="w-5 h-5" />,
        color: 'from-gray-400 to-gray-600',
        count: totalCount,
        earnedCount: earnedCount
      },
      ...categoryData
    ];
  }, [achievementProgress, earnedCount, totalCount]);

  const filteredProgress = useMemo(() => {
    let filtered = selectedCategory === 'all' 
      ? achievementProgress 
      : achievementProgress.filter(ap => ap.achievement.category === selectedCategory);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ap => 
        ap.achievement.name.toLowerCase().includes(query) ||
        ap.achievement.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [achievementProgress, selectedCategory, searchQuery]);

  // Sort achievements: earned first, then by progress, then by rarity
  const sortedProgress = useMemo(() => {
    const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
    
    return [...filteredProgress].sort((a, b) => {
      // Earned achievements first
      if (a.isEarned && !b.isEarned) return -1;
      if (!a.isEarned && b.isEarned) return 1;
      
      if (!a.isEarned && !b.isEarned) {
        // For unearned: higher progress first, then rarity
        if (Math.abs(b.progressPercentage - a.progressPercentage) > 1) {
          return b.progressPercentage - a.progressPercentage;
        }
      }
      
      // Then by rarity
      const rarityDiff = rarityOrder[b.achievement.rarity as keyof typeof rarityOrder] - 
                        rarityOrder[a.achievement.rarity as keyof typeof rarityOrder];
      if (rarityDiff !== 0) return rarityDiff;
      
      // Finally by points
      return b.achievement.points - a.achievement.points;
    });
  }, [filteredProgress]);

  const handleAchievementClick = (achievementProgress: any) => {
    setSelectedAchievement(achievementProgress.achievement);
  };

  const handleShare = () => {
    if (selectedAchievement) {
      const shareText = selectedAchievement.share_message;
      if (navigator.share) {
        navigator.share({
          title: 'PlankCoach Achievement',
          text: shareText,
        });
      } else {
        navigator.clipboard.writeText(shareText);
        toast({
          title: "Copied to clipboard!",
          description: "Achievement share text copied successfully.",
        });
      }
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
      toast({
        title: "Progress updated!",
        description: "Your achievement progress has been refreshed.",
      });
    } catch (error) {
      toast({
        title: "Update failed",
        description: "Could not refresh progress. Please try again.",
        variant: "destructive"
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate total points from achievements
  const totalPoints = useMemo(() => {
    return achievementProgress
      .filter(ap => ap.isEarned)
      .reduce((sum, ap) => sum + (ap.achievement.points || 0), 0);
  }, [achievementProgress]);

  const completionPercentage = Math.round((earnedCount / totalCount) * 100);

  // Show progressive loading for initial load
  if (loading && achievementProgress.length === 0) {
    return (
      <div className="space-y-6">
        <AchievementStatsSkeletons />
        <LoadingIndicator />
        <AchievementCategorySkeleton />
        <AchievementCardSkeletons count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progressive Loading Indicator */}
      {progressiveLoading && needsRefresh && (
        <ProgressiveLoadingIndicator 
          earnedCount={earnedCount}
          totalCount={totalCount}
          currentPhase="Updating progress calculations..."
        />
      )}

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {earnedCount}
            </div>
            <div className="text-sm text-orange-700">Unlocked</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {totalCount}
            </div>
            <div className="text-sm text-blue-700">Total</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {totalPoints}
            </div>
            <div className="text-sm text-purple-700">Points</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {completionPercentage}%
            </div>
            <div className="text-sm text-green-700">Complete</div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controls Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search achievements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          size="sm"
          className={`flex items-center space-x-2 ${needsRefresh ? 'border-orange-300 text-orange-600 bg-orange-50' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Updating...' : 'Refresh'}</span>
          {needsRefresh && (
            <Badge variant="secondary" className="bg-orange-200 text-orange-800 text-xs">
              New
            </Badge>
          )}
        </Button>
      </div>

      {/* Category Filter */}
      {loading && categories.length === 0 ? (
        <AchievementCategorySkeleton />
      ) : (
        <div className="flex flex-wrap gap-3">
          {categories.map(category => (
            <motion.button
              key={category.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative p-4 rounded-xl text-white transition-all duration-300 ${
                selectedCategory === category.id
                  ? `bg-gradient-to-br ${category.color} shadow-lg scale-105`
                  : `bg-gradient-to-br ${category.color} opacity-70 hover:opacity-90`
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              <div className="flex items-center space-x-2 mb-2">
                {category.icon}
                <span className="font-semibold">{category.name}</span>
              </div>
              <div className="text-sm opacity-90">
                {category.earnedCount} / {category.count}
              </div>
              {category.earnedCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-white text-gray-800 text-xs h-5 px-1">
                  {category.earnedCount}
                </Badge>
              )}
            </motion.button>
          ))}
        </div>
      )}

      {/* Achievement Grid */}
      {loading && sortedProgress.length === 0 ? (
        <AchievementCardSkeletons />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {sortedProgress.map((progressItem, index) => (
            <motion.div
              key={`${progressItem.achievement.id}-${selectedCategory}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03, duration: 0.3 }}
            >
              <EnhancedAchievementCard
                achievementProgress={progressItem}
                onClick={() => handleAchievementClick(progressItem)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Empty state */}
      {!loading && sortedProgress.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">
            {searchQuery ? 'No matching achievements' : 'No achievements yet'}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try a different search term' : 'Start working out to earn your first achievement!'}
          </p>
        </motion.div>
      )}

      {/* Achievement Detail Modal */}
      {selectedAchievement && (
        <EnhancedAchievementCelebration
          achievement={selectedAchievement}
          onClose={() => setSelectedAchievement(null)}
          onShare={handleShare}
          isVisible={!!selectedAchievement}
        />
      )}
    </div>
  );
};

export default OptimizedAchievementsGallery;