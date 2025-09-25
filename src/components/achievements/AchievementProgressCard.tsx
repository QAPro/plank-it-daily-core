
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Lock, CheckCircle } from "lucide-react";
import { AchievementService, Achievement } from "@/services/achievementService";

interface AchievementProgressCardProps {
  achievement: Achievement;
  isEarned?: boolean;
  currentProgress?: number;
  showProgress?: boolean;
}

const AchievementProgressCard = ({ 
  achievement, 
  isEarned = false, 
  currentProgress = 0,
  showProgress = true 
}: AchievementProgressCardProps) => {
  const progressPercentage = Math.min((currentProgress / achievement.condition.value) * 100, 100);
  const rarityColor = AchievementService.getRarityColor(achievement.rarity);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card className={`relative overflow-hidden ${isEarned ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'opacity-75'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className={`text-3xl ${isEarned ? '' : 'grayscale opacity-50'}`}>
                {achievement.icon}
              </div>
              <div>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <span>{achievement.name}</span>
                  {isEarned && <CheckCircle className="w-5 h-5 text-green-500" />}
                  {!isEarned && currentProgress === 0 && <Lock className="w-4 h-4 text-gray-400" />}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">{achievement.description}</p>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {showProgress && !isEarned && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Progress</span>
                <span className="font-medium">{currentProgress}/{achievement.condition.value}</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          )}
          
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="text-xs">
                {achievement.type}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {achievement.points} pts
              </Badge>
            </div>
            
            {isEarned && (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                Earned!
              </Badge>
            )}
          </div>
        </CardContent>
        
        {/* Decorative elements for earned achievements */}
        {isEarned && (
          <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-yellow-400 to-orange-400 opacity-20 rounded-bl-full" />
        )}
      </Card>
    </motion.div>
  );
};

export default AchievementProgressCard;
