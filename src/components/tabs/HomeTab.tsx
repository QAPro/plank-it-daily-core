
import { motion } from "framer-motion";
import { Play, Calendar, Trophy, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionStats } from "@/hooks/useSessionHistory";
import { useAuth } from "@/contexts/AuthContext";
import StreakDisplay from "@/components/StreakDisplay";
import RecommendationsDashboard from "@/components/RecommendationsDashboard";
import LevelProgressBar from "@/components/level/LevelProgressBar";
import { useLevelProgression } from "@/hooks/useLevelProgression";

interface HomeTabProps {
  onExerciseSelect?: (exerciseId: string) => void;
}

const HomeTab = ({ onExerciseSelect }: HomeTabProps) => {
  const { data: stats } = useSessionStats();
  const { user } = useAuth();
  const { userLevel, loading: levelLoading } = useLevelProgression();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Use real data if available, otherwise show placeholder
  const displayStats = [
    { 
      icon: Calendar, 
      label: "This Week", 
      value: stats ? `${stats.thisWeekSessions}/${stats.weeklyGoal} days` : "0/7 days", 
      color: "text-blue-500" 
    },
    { 
      icon: Trophy, 
      label: "Best Time", 
      value: stats && stats.totalSessions > 0 ? formatDuration(stats.averageDuration) : "0:00", 
      color: "text-yellow-500" 
    }
  ];

  // Get the user's full name from user_metadata or email
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Try to get full_name from user_metadata
    const fullName = user.user_metadata?.full_name;
    if (fullName) {
      return `, ${fullName.split(' ')[0]}`;
    }
    
    // Fallback to email username
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      return `, ${emailUsername}`;
    }
    
    return '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center pt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Welcome Back{getUserDisplayName()}!
        </h2>
        <p className="text-gray-600">Ready for today's plank challenge?</p>
      </div>

      {/* Level Progress Bar */}
      {!levelLoading && userLevel && (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.6 }}
        >
          <LevelProgressBar userLevel={userLevel} />
        </motion.div>
      )}

      {/* Streak Display */}
      <StreakDisplay />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        {displayStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.4 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <p className="text-lg font-bold text-gray-800">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Smart Recommendations Dashboard */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <RecommendationsDashboard onExerciseSelect={onExerciseSelect} />
      </motion.div>

      {/* Progress Summary */}
      {stats && stats.totalSessions > 0 ? (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Your Progress</h3>
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalSessions}</p>
                  <p className="text-sm text-gray-600">Total Sessions</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{formatTime(stats.totalTimeSpent)}</p>
                  <p className="text-sm text-gray-600">Time Spent</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Recent Activity</h3>
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardContent className="p-6 text-center">
              <div className="text-gray-400 mb-2">
                <Calendar className="w-12 h-12 mx-auto" />
              </div>
              <p className="text-gray-600">No workouts yet</p>
              <p className="text-sm text-gray-500">Complete your first plank to see your progress here</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomeTab;
