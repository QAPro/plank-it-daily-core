
import { motion } from "framer-motion";
import { Trophy, Lock, Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUserAchievements } from "@/hooks/useUserAchievements";
import { ACHIEVEMENTS, AchievementService } from "@/services/achievementService";
import { format } from "date-fns";

const AchievementsGallery = () => {
  const { achievements, loading } = useUserAchievements();

  const earnedAchievements = new Set(achievements.map(a => a.achievement_name));
  
  const groupedAchievements = ACHIEVEMENTS.reduce((groups, achievement) => {
    if (!groups[achievement.type]) {
      groups[achievement.type] = [];
    }
    groups[achievement.type].push(achievement);
    return groups;
  }, {} as Record<string, typeof ACHIEVEMENTS>);

  const getEarnedAchievement = (achievementName: string) => {
    return achievements.find(a => a.achievement_name === achievementName);
  };

  const getTotalPoints = () => {
    return achievements.reduce((total, achievement) => {
      const metadata = achievement.metadata as any;
      return total + (metadata?.points || 0);
    }, 0);
  };

  const getProgressPercentage = () => {
    return Math.round((achievements.length / ACHIEVEMENTS.length) * 100);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-orange-600 text-lg">Loading achievements...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="grid grid-cols-3 gap-4"
      >
        <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Trophy className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{achievements.length}</div>
            <div className="text-sm opacity-90">Unlocked</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <Star className="w-6 h-6 mx-auto mb-2" />
            <div className="text-2xl font-bold">{getTotalPoints()}</div>
            <div className="text-sm opacity-90">Points</div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white border-0">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{getProgressPercentage()}%</div>
            <div className="text-sm opacity-90">Complete</div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-white rounded-full h-2 transition-all duration-300"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Achievement Categories */}
      {Object.entries(groupedAchievements).map(([category, categoryAchievements], categoryIndex) => (
        <motion.div
          key={category}
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: categoryIndex * 0.1 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-gray-800 capitalize flex items-center">
            {category === 'streak' && '🔥'}
            {category === 'duration' && '⏱️'}
            {category === 'consistency' && '📅'}
            {category === 'progress' && '📈'}
            <span className="ml-2">{category} Achievements</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryAchievements.map((achievement, achievementIndex) => {
              const isEarned = earnedAchievements.has(achievement.name);
              const earnedData = getEarnedAchievement(achievement.name);
              
              return (
                <motion.div
                  key={achievement.id}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: (categoryIndex * 0.1) + (achievementIndex * 0.05) }}
                >
                  <Card className={`relative overflow-hidden transition-all duration-300 ${
                    isEarned 
                      ? 'bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-md' 
                      : 'bg-gray-50 border-gray-200'
                  }`}>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`text-3xl ${isEarned ? 'grayscale-0' : 'grayscale opacity-50'}`}>
                          {achievement.icon}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className={`font-semibold ${isEarned ? 'text-gray-800' : 'text-gray-500'}`}>
                              {achievement.name}
                            </h4>
                            {!isEarned && <Lock className="w-4 h-4 text-gray-400" />}
                          </div>
                          
                          <p className={`text-sm mb-2 ${isEarned ? 'text-gray-600' : 'text-gray-400'}`}>
                            {achievement.description}
                          </p>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <Badge 
                                variant="secondary" 
                                className={AchievementService.getRarityColor(achievement.rarity)}
                              >
                                {achievement.rarity}
                              </Badge>
                              {achievement.points > 0 && (
                                <Badge variant="outline" className="text-xs">
                                  {achievement.points}pts
                                </Badge>
                              )}
                            </div>
                            
                            {isEarned && earnedData?.earned_at && (
                              <div className="text-xs text-gray-500">
                                {format(new Date(earnedData.earned_at), 'MMM d, yyyy')}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {isEarned && (
                        <div className="absolute top-2 right-2">
                          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                            <Trophy className="w-3 h-3 text-white" />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      ))}

      {achievements.length === 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center py-8"
        >
          <Trophy className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Achievements Yet</h3>
          <p className="text-gray-500">Complete your first plank session to start earning achievements!</p>
        </motion.div>
      )}
    </div>
  );
};

export default AchievementsGallery;
