
import { motion } from "framer-motion";
import { Flame, Trophy, Target, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStreakTracking } from "@/hooks/useStreakTracking";
import { useEffect } from "react";

interface StreakDisplayProps {
  variant?: "compact" | "detailed";
}

const StreakDisplay = ({ variant = "detailed" }: StreakDisplayProps) => {
  const {
    streak,
    isLoading,
    checkStreakMaintenance,
    getStreakStatus,
    getStreakMilestone,
    getMotivationalMessage,
  } = useStreakTracking();

  useEffect(() => {
    checkStreakMaintenance();
  }, []);

  if (isLoading) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
        <CardContent className="p-4">
          <div className="animate-pulse space-y-3">
            <div className="h-6 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStreak = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;
  const { status, message } = getStreakStatus();
  const { currentMilestone, nextMilestone } = getStreakMilestone();
  const motivationalMessage = getMotivationalMessage();

  const getStreakIcon = () => {
    switch (status) {
      case 'completed':
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 'active':
        return <Flame className="w-6 h-6 text-orange-500" />;
      case 'broken':
      case 'new':
        return <Target className="w-6 h-6 text-blue-500" />;
      default:
        return <Calendar className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStreakColor = () => {
    switch (status) {
      case 'completed':
        return "from-yellow-500 to-orange-500";
      case 'active':
        return "from-orange-500 to-red-500";
      case 'broken':
        return "from-blue-500 to-purple-500";
      case 'new':
        return "from-green-500 to-blue-500";
      default:
        return "from-gray-400 to-gray-500";
    }
  };

  if (variant === "compact") {
    return (
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="flex items-center space-x-2"
      >
        {getStreakIcon()}
        <div>
          <p className="font-bold text-gray-800">{currentStreak} days</p>
          <p className="text-xs text-gray-600">Current Streak</p>
        </div>
      </motion.div>
    );
  }

  const progressToNext = nextMilestone
    ? (currentStreak / nextMilestone.days) * 100
    : 100;

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      <Card className={`bg-gradient-to-br ${getStreakColor()} text-white border-0 shadow-xl`}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {getStreakIcon()}
              <div>
                <h3 className="text-xl font-bold">
                  {currentStreak} Day{currentStreak !== 1 ? 's' : ''}
                </h3>
                <p className="text-sm opacity-90">Current Streak</p>
              </div>
            </div>
            {longestStreak > 0 && (
              <div className="text-right">
                <p className="text-2xl font-bold">{longestStreak}</p>
                <p className="text-sm opacity-90">Best Ever</p>
              </div>
            )}
          </div>

          {/* Status Message */}
          <motion.p
            key={motivationalMessage}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-lg font-medium mb-4 opacity-95"
          >
            {motivationalMessage}
          </motion.p>

          {/* Current Milestone */}
          {currentMilestone && (
            <div className="mb-4">
              <Badge variant="secondary" className="bg-white/20 text-white border-0">
                🏆 {currentMilestone.title}: {currentMilestone.description}
              </Badge>
            </div>
          )}

          {/* Progress to Next Milestone */}
          {nextMilestone && (
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm opacity-90">
                  Next: {nextMilestone.title}
                </span>
                <span className="text-sm opacity-90">
                  {currentStreak}/{nextMilestone.days} days
                </span>
              </div>
              <Progress 
                value={progressToNext} 
                className="h-2 bg-white/20"
              />
              <p className="text-xs opacity-75 text-center">
                {nextMilestone.days - currentStreak} more days to unlock!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StreakDisplay;
