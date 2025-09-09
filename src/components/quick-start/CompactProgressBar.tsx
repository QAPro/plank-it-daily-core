import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import type { UserLevel } from "@/services/levelProgressionService";

interface CompactProgressBarProps {
  userLevel: UserLevel;
}

const CompactProgressBar = ({ userLevel }: CompactProgressBarProps) => {
  const progressPercentage = userLevel.xp_to_next_level > 0
    ? (userLevel.current_xp / (userLevel.current_xp + userLevel.xp_to_next_level)) * 100
    : 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-4 border border-orange-200"
    >
      {/* Top Row - Level Badge and XP */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Badge 
            variant="secondary" 
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white border-0"
          >
            Level {userLevel.current_level}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            {userLevel.level_title}
          </span>
        </div>
        <div className="text-right">
          <span className="text-lg font-bold text-orange-600">
            {userLevel.current_xp}
          </span>
          <span className="text-sm text-muted-foreground ml-1">XP</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress 
          value={progressPercentage} 
          className="h-2 bg-orange-100"
        />
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          {userLevel.xp_to_next_level > 0 ? (
            <>
              <span>{userLevel.xp_to_next_level} XP to Level {userLevel.current_level + 1}</span>
              {userLevel.next_unlock && (
                <span className="flex items-center space-x-1">
                  <Trophy className="w-3 h-3" />
                  <span>Next: {userLevel.next_unlock.feature_name}</span>
                </span>
              )}
            </>
          ) : (
            <span className="font-medium text-orange-600">🏆 Max Level Reached!</span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CompactProgressBar;