
import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { UserLevel } from "@/services/levelProgressionService";

interface LevelProgressBarProps {
  userLevel: UserLevel;
  compact?: boolean;
}

const LevelProgressBar = ({ userLevel, compact = false }: LevelProgressBarProps) => {
  const progressPercentage = userLevel.xp_to_next_level > 0
    ? (userLevel.current_xp / (userLevel.current_xp + userLevel.xp_to_next_level)) * 100
    : 100;

  if (compact) {
    return (
      <div className="flex items-center space-x-3">
        <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0">
          Level {userLevel.current_level}
        </Badge>
        <div className="flex-1">
          <Progress value={progressPercentage} className="h-2" />
        </div>
        <span className="text-sm text-gray-600">
          {userLevel.current_xp} XP
        </span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="p-6">
          {/* Level Badge and Title */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {userLevel.current_level}
                </div>
                {userLevel.current_level === 20 && (
                  <div className="absolute -top-1 -right-1 text-yellow-400">
                    <span className="text-lg">👑</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800">{userLevel.level_title}</h3>
                <p className="text-sm text-gray-600">Level {userLevel.current_level}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-2xl font-bold text-orange-600">{userLevel.total_xp}</p>
              <p className="text-sm text-gray-600">Total XP</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">
                {userLevel.current_xp} XP
              </span>
              {userLevel.xp_to_next_level > 0 ? (
                <span className="text-sm text-gray-600">
                  {userLevel.xp_to_next_level} XP to level {userLevel.current_level + 1}
                </span>
              ) : (
                <span className="text-sm font-bold text-orange-600">
                  🏆 Max Level Reached!
                </span>
              )}
            </div>
            
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-orange-100"
            />
          </div>

          {/* Next Unlock Preview */}
          {userLevel.next_unlock && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 p-3 bg-white/60 rounded-lg border border-orange-200"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{userLevel.next_unlock.icon}</span>
                <div>
                  <p className="font-medium text-gray-800">
                    Next unlock: {userLevel.next_unlock.feature_name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {userLevel.next_unlock.feature_description}
                  </p>
                  <p className="text-xs text-orange-600 font-medium">
                    Level {userLevel.next_unlock.level} required
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default LevelProgressBar;
