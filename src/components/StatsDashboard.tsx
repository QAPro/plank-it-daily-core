
import { motion } from "framer-motion";
import { BarChart, Clock, Calendar, Trophy, Target, Settings } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useSessionStats } from "@/hooks/useSessionHistory";
import WeeklyGoalSettings from "@/components/WeeklyGoalSettings";
import FlagGuard from '@/components/access/FlagGuard';

const StatsDashboard = () => {
  const { data: stats, isLoading, error } = useSessionStats();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="bg-white/80 backdrop-blur-sm border-orange-100">
              <CardContent className="p-4">
                <Skeleton className="h-8 w-8 rounded-full mb-2" />
                <Skeleton className="h-6 w-12 mb-1" />
                <Skeleton className="h-4 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Weekly Progress */}
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
        <CardContent className="p-6 text-center">
          <p className="text-gray-500">Failed to load statistics</p>
        </CardContent>
      </Card>
    );
  }

  const weeklyProgressPercent = Math.round((stats.thisWeekSessions / stats.weeklyGoal) * 100);
  const maxSessionsInWeek = Math.max(...stats.weeklyProgress.map(day => day.sessions), 1);

  return (
    <FlagGuard featureName="stats_dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-blue-500 to-purple-500 text-white border-0">
              <CardContent className="p-4 text-center">
                <Trophy className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.totalSessions}</p>
                <p className="text-sm text-blue-100">Total Sessions</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white border-0">
              <CardContent className="p-4 text-center">
                <Clock className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</p>
                <p className="text-sm text-green-100">Time Spent</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white border-0">
              <CardContent className="p-4 text-center">
                <BarChart className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{formatDuration(stats.averageDuration)}</p>
                <p className="text-sm text-yellow-100">Avg Duration</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
          >
            <Card className="bg-gradient-to-br from-pink-500 to-rose-500 text-white border-0">
              <CardContent className="p-4 text-center">
                <Target className="w-8 h-8 mx-auto mb-2" />
                <p className="text-2xl font-bold">{stats.thisWeekSessions}</p>
                <p className="text-sm text-pink-100">This Week</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Weekly Goal Progress */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center">
                  <Target className="w-5 h-5 mr-2 text-orange-500" />
                  Weekly Goal: {stats.weeklyGoal} {stats.weeklyGoal === 1 ? 'day' : 'days'}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">
                    {stats.thisWeekSessions}/{stats.weeklyGoal}
                  </span>
                  <WeeklyGoalSettings>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </WeeklyGoalSettings>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Progress value={weeklyProgressPercent} className="h-3" />
                <p className="text-sm text-gray-600 text-center">
                  {weeklyProgressPercent}% of weekly goal completed
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                This Week's Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between space-x-2 h-24">
                {stats.weeklyProgress.map((day, index) => (
                  <div key={day.day} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        day.completed ? 'bg-orange-500' : 'bg-gray-200'
                      }`}
                      style={{
                        height: `${Math.max((day.sessions / maxSessionsInWeek) * 100, 10)}%`,
                        minHeight: '8px',
                      }}
                    />
                    <div className="mt-2 text-center">
                      <p className="text-xs font-medium text-gray-600">{day.day} {day.date}</p>
                      <p className="text-xs text-gray-500">{day.sessions}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </FlagGuard>
  );
};

export default StatsDashboard;
