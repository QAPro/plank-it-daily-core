
import { motion } from "framer-motion";
import { Play, Flame, Calendar, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useSessionStats } from "@/hooks/useSessionHistory";
import { useAuth } from "@/contexts/AuthContext";

const HomeTab = () => {
  const { data: stats } = useSessionStats();
  const { user } = useAuth();

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
      icon: Flame, 
      label: "Current Streak", 
      value: "0 days", // This would come from user_streaks table
      color: "text-orange-500" 
    },
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
          Welcome Back{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}!
        </h2>
        <p className="text-gray-600">Ready for today's plank challenge?</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
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

      {/* Today's Workout */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold">Today's Challenge</h3>
                <p className="text-orange-100">Basic Plank Hold</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">5:00</p>
                <p className="text-orange-100 text-sm">minutes</p>
              </div>
            </div>
            <Button
              className="w-full bg-white text-orange-500 hover:bg-orange-50 font-semibold py-3 rounded-xl"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Workout
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Summary */}
      {stats && stats.totalSessions > 0 ? (
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
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
          transition={{ delay: 0.6, duration: 0.6 }}
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
