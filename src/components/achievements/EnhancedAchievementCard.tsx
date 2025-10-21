
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Clock, Trophy, Star } from "lucide-react";
import { getRarityColor, getRarityGlow } from "@/utils/achievementDisplay";
import type { AchievementWithProgress } from "@/hooks/useExpandedAchievementProgress";

interface EnhancedAchievementCardProps {
  achievementProgress: AchievementWithProgress;
  onClick?: () => void;
}

const EnhancedAchievementCard = ({ achievementProgress, onClick }: EnhancedAchievementCardProps) => {
  const { achievement, isEarned, currentProgress, progressPercentage, estimatedCompletion } = achievementProgress;
  const rarityColors = getRarityColor(achievement.rarity as any);
  const rarityGlow = getRarityGlow(achievement.rarity as any);

  const getCategoryIcon = () => {
    // Check if it's a category-specific achievement
    if (achievement.category === 'category_specific' && achievement.requirement.conditions?.exercise_categories) {
      const exerciseCategory = achievement.requirement.conditions.exercise_categories[0];
      switch (exerciseCategory) {
        case 'cardio': return '❤️';
        case 'leg_lift': return '🦵';
        case 'planking': return '🏋️';
        case 'seated_exercise': return '🪑';
        case 'standing_movement': return '🚶';
        case 'strength': return '💪';
      }
    }
    
    switch (achievement.category) {
      case 'consistency':
        return <Clock className="w-4 h-4" />;
      case 'performance':
        return <Trophy className="w-4 h-4" />;
      case 'exploration':
        return <Star className="w-4 h-4" />;
      case 'milestone':
        return <Trophy className="w-4 h-4" />;
      case 'category_specific':
        return <Star className="w-4 h-4" />;
      case 'cross_category':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
    }
  };


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <Card 
        className={`relative cursor-pointer transition-all duration-300 hover:shadow-md ${
          isEarned ? 'border-2 border-orange-200 bg-orange-50' : 'hover:border-gray-300'
        } ${rarityGlow}`}
        onClick={onClick}
      >
        <CardContent className="p-4">
          {/* Icon and Title */}
          <div className="flex items-start space-x-3 mb-3">
            <div className={`
              text-3xl p-2 rounded-lg transition-all duration-300
              ${isEarned ? 'bg-orange-100' : 'bg-gray-100 grayscale opacity-60'}
            `}>
              {achievement.icon}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                {getCategoryIcon()}
                <h3 className={`font-semibold truncate ${
                  isEarned ? 'text-gray-900' : 'text-gray-600'
                }`}>
                  {achievement.name}
                </h3>
              </div>
              <p className={`text-sm ${
                isEarned ? 'text-gray-700' : 'text-gray-500'
              }`}>
                {achievement.description}
              </p>
            </div>
          </div>

          {/* Progress Section */}
          {!isEarned && (
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium text-gray-800">
                  {currentProgress} / {achievement.requirement.value}
                </span>
              </div>
              
              <Progress 
                value={progressPercentage} 
                className="h-2"
              />
              
              {estimatedCompletion && (
                <p className="text-xs text-gray-500 mt-1">
                  {estimatedCompletion}
                </p>
              )}
            </div>
          )}

          {/* Bottom Section */}
          <div className="flex justify-between items-center">
            {isEarned ? (
              <div className="flex items-center space-x-2">
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  ✓ Unlocked
                </Badge>
                <span className="text-sm font-medium text-orange-600">
                  +{achievement.points} pts
                </span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {Math.round(progressPercentage)}% complete
                </span>
                <span className="text-sm text-gray-400">
                  {achievement.points} pts
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EnhancedAchievementCard;
