import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Star, Target, Award, Search, RefreshCw, Heart, Dumbbell, Activity, Zap, User, Gauge, TrendingUp, ArrowLeft } from "lucide-react";
import { useOptimizedAchievementProgress } from "@/hooks/useOptimizedAchievementProgress";
import { useAchievements } from "@/hooks/useAchievements";
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

interface EarnedAchievementsGalleryProps {
  onBackClick?: () => void;
}

const EarnedAchievementsGallery = ({ onBackClick }: EarnedAchievementsGalleryProps = {}) => {
  const { data: allAchievements = [] } = useAchievements();
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
    category_specific: <Activity className="w-5 h-5" />,
    cross_category: <TrendingUp className="w-5 h-5" />,
    // Exercise category icons
    cardio: <Heart className="w-5 h-5" />,
    leg_lift: <Dumbbell className="w-5 h-5" />,
    planking: <Activity className="w-5 h-5" />,
    seated_exercise: <User className="w-5 h-5" />,
    standing_movement: <Zap className="w-5 h-5" />,
    strength: <Gauge className="w-5 h-5" />
  };

  const categoryColors = {
    consistency: 'from-orange-400 to-red-500',
    performance: 'from-blue-400 to-purple-500',
    exploration: 'from-green-400 to-teal-500',
    milestone: 'from-purple-400 to-pink-500',
    category_specific: 'from-indigo-400 to-blue-500',
    cross_category: 'from-yellow-400 to-orange-500',
    // Exercise category colors
    cardio: 'from-red-400 to-pink-500',
    leg_lift: 'from-blue-500 to-indigo-600',
    planking: 'from-green-500 to-emerald-600',
    seated_exercise: 'from-purple-500 to-violet-600',
    standing_movement: 'from-yellow-500 to-amber-600',
    strength: 'from-gray-500 to-slate-600'
  };

  const categories = useMemo(() => {
    const earnedSet = new Set(
      achievementProgress
        .filter(ap => ap.isEarned)
        .map(ap => ap.achievement.name)
    );
    
    // Main achievement categories
    const mainCategories = ['consistency', 'performance', 'exploration', 'milestone', 'category_specific', 'cross_category'];
    const categoryData = mainCategories.map(categoryId => {
      const categoryAchievements = allAchievements.filter((a: any) => a.category === categoryId);
      const earnedCount = categoryAchievements.filter(a => earnedSet.has(a.name)).length;
      
      return {
        id: categoryId,
        name: categoryId === 'category_specific' ? 'Exercise Specific' : 
              categoryId === 'cross_category' ? 'Multi-Exercise' :
              categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
        icon: categoryIcons[categoryId as keyof typeof categoryIcons],
        color: categoryColors[categoryId as keyof typeof categoryColors],
        count: categoryAchievements.length,
        earnedCount
      };
    });

    // Exercise categories for category_specific achievements
    const exerciseCategories = ['cardio', 'leg_lift', 'planking', 'seated_exercise', 'standing_movement', 'strength'];
    const exerciseCategoryData = exerciseCategories.map(categoryId => {
      const categoryAchievements = allAchievements.filter((a: any) => 
        a.category === 'category_specific' && 
        (a.unlock_criteria as any)?.category === categoryId
      );
      const earnedCount = categoryAchievements.filter(a => earnedSet.has(a.name)).length;
      
      return {
        id: categoryId,
        name: categoryId === 'leg_lift' ? 'Leg Lift' :
              categoryId === 'seated_exercise' ? 'Seated Exercise' :
              categoryId === 'standing_movement' ? 'Standing Movement' :
              categoryId.charAt(0).toUpperCase() + categoryId.slice(1),
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
      ...categoryData,
      ...exerciseCategoryData
    ];
  }, [achievementProgress, earnedCount, totalCount, allAchievements]);

  const filteredProgress = useMemo(() => {
    let filtered;
    
    if (selectedCategory === 'all') {
      filtered = achievementProgress;
    } else if (['cardio', 'leg_lift', 'planking', 'seated_exercise', 'standing_movement', 'strength'].includes(selectedCategory)) {
      // Handle exercise categories
      filtered = achievementProgress.filter(ap => 
        ap.achievement.category === 'category_specific' &&
        ap.achievement.requirement.conditions?.exercise_categories?.includes(selectedCategory)
      );
    } else {
      filtered = achievementProgress.filter(ap => ap.achievement.category === selectedCategory);
    }

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

  // Sort achievements: earned only, by rarity and points
  const sortedProgress = useMemo(() => {
    const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
    
    // Only show earned achievements
    const earnedAchievements = filteredProgress.filter(progress => progress.isEarned);
    
    return earnedAchievements.sort((a, b) => {
      // Sort by rarity first
      const rarityDiff = rarityOrder[b.achievement.rarity as keyof typeof rarityOrder] - 
                        rarityOrder[a.achievement.rarity as keyof typeof rarityOrder];
      if (rarityDiff !== 0) return rarityDiff;
      
      // Then by points
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
          title: 'Inner Fire Achievement',
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
    <div className="space-y-6 pb-24">
      {/* Progressive Loading Indicator */}
      {progressiveLoading && needsRefresh && (
        <ProgressiveLoadingIndicator 
          earnedCount={earnedCount}
          totalCount={totalCount}
          currentPhase="Updating progress calculations..."
        />
      )}

      {/* Back Button */}
      {onBackClick && (
        <Button 
          variant="ghost" 
          onClick={onBackClick}
          className="flex items-center gap-2 mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to What's Next
        </Button>
      )}

      {/* Stats Overview */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-2 gap-4"
      >
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {earnedCount}
            </div>
            <div className="text-sm text-orange-700">Achievements Earned</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {totalPoints}
            </div>
            <div className="text-sm text-purple-700">Total Points</div>
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
                {category.earnedCount} earned
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
            {searchQuery ? 'No matching earned achievements' : 'No achievements earned yet'}
          </h3>
          <p className="text-gray-500">
            {searchQuery ? 'Try a different search term among your earned achievements' : 'Complete workouts to discover and earn achievements!'}
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

export default EarnedAchievementsGallery;