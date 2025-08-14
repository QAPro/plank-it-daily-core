import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Star, Target, Award, Search } from "lucide-react";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { useExpandedAchievementProgress } from "@/hooks/useExpandedAchievementProgress";
import { ExpandedAchievementEngine, EXPANDED_ACHIEVEMENTS } from "@/services/expandedAchievementService";
import EnhancedAchievementCard from "@/components/achievements/EnhancedAchievementCard";
import EnhancedAchievementCelebration from "@/components/achievements/EnhancedAchievementCelebration";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

const EnhancedAchievementsGallery = () => {
  const { achievements: earnedAchievements, loading: achievementsLoading } = useUserAchievements();
  const { achievementProgress, loading: progressLoading } = useExpandedAchievementProgress();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedAchievement, setSelectedAchievement] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');

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
    const earnedSet = new Set(earnedAchievements?.map(a => a.achievement_name) || []);
    
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

    // Add "All" category
    const totalEarned = earnedAchievements?.length || 0;
    const totalAvailable = EXPANDED_ACHIEVEMENTS.length;
    
    return [
      {
        id: 'all',
        name: 'All',
        icon: <Award className="w-5 h-5" />,
        color: 'from-gray-400 to-gray-600',
        count: totalAvailable,
        earnedCount: totalEarned
      },
      ...categoryData
    ];
  }, [earnedAchievements]);

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

  // Sort achievements: earned first, then by rarity, then by progress
  const sortedProgress = useMemo(() => {
    const rarityOrder = { legendary: 5, epic: 4, rare: 3, uncommon: 2, common: 1 };
    
    return [...filteredProgress].sort((a, b) => {
      // Earned achievements first
      if (a.isEarned && !b.isEarned) return -1;
      if (!a.isEarned && b.isEarned) return 1;
      
      if (!a.isEarned && !b.isEarned) {
        // For unearned: higher progress first, then rarity
        if (b.progressPercentage !== a.progressPercentage) {
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
        // Fallback to copying to clipboard
        navigator.clipboard.writeText(shareText);
      }
    }
  };

  // Calculate total points from achievements (using metadata if available, otherwise default)
  const totalPoints = useMemo(() => {
    return earnedAchievements?.reduce((sum, achievement) => {
      // Try metadata.points first, then points property, then default to 0
      const points = achievement.metadata?.points || (achievement as any).points || 0;
      return sum + points;
    }, 0) || 0;
  }, [earnedAchievements]);

  if (achievementsLoading || progressLoading) {
    return (
      <div className="space-y-6">
        {/* Category skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4 text-center">
                <Skeleton className="h-8 w-8 mx-auto mb-2 rounded" />
                <Skeleton className="h-4 w-20 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Achievement cards skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(12)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
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
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {earnedAchievements?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Unlocked</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {EXPANDED_ACHIEVEMENTS.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {totalPoints}
            </div>
            <div className="text-sm text-gray-600">Points</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Math.round(((earnedAchievements?.length || 0) / EXPANDED_ACHIEVEMENTS.length) * 100)}%
            </div>
            <div className="text-sm text-gray-600">Complete</div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <Input
          placeholder="Search achievements..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Filter */}
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

      {/* Achievement Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {sortedProgress.map((progressItem, index) => (
          <motion.div
            key={`${progressItem.achievement.id}-${selectedCategory}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
          >
            <EnhancedAchievementCard
              achievementProgress={progressItem}
              onClick={() => handleAchievementClick(progressItem)}
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

export default EnhancedAchievementsGallery;
