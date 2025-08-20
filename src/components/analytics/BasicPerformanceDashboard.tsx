
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Target, Calendar, Trophy, Clock, BarChart3 } from 'lucide-react';
import { useSessionHistory, useSessionStats } from '@/hooks/useSessionHistory';
import { useExercisePerformance } from '@/hooks/useExercisePerformance';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, eachDayOfInterval } from 'date-fns';

const BasicPerformanceDashboard = () => {
  const { data: sessions, isLoading: sessionsLoading } = useSessionHistory(30);
  const { data: stats, isLoading: statsLoading } = useSessionStats();
  const { performanceData, isLoading: performanceLoading } = useExercisePerformance();

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Generate performance trend data from actual sessions
  const generateTrendData = () => {
    if (!sessions || sessions.length === 0) return [];

    const last30Days = eachDayOfInterval({
      start: subDays(new Date(), 29),
      end: new Date()
    });

    return last30Days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const daySessions = sessions.filter(session => {
        const sessionDate = format(new Date(session.completed_at || ''), 'yyyy-MM-dd');
        return sessionDate === dayStr;
      });

      const avgDuration = daySessions.length > 0 
        ? Math.round(daySessions.reduce((sum, s) => sum + s.duration_seconds, 0) / daySessions.length)
        : 0;

      return {
        date: format(day, 'MMM dd'),
        duration: avgDuration,
        sessions: daySessions.length
      };
    });
  };

  // Generate exercise distribution data
  const generateExerciseDistribution = () => {
    if (!sessions || sessions.length === 0) return [];

    const exerciseCount = sessions.reduce((acc, session) => {
      const exerciseName = session.plank_exercises?.name || 'Unknown';
      acc[exerciseName] = (acc[exerciseName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const colors = ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#fff7ed'];
    
    return Object.entries(exerciseCount).map(([name, count], index) => ({
      name,
      value: count,
      color: colors[index % colors.length]
    }));
  };

  // Calculate personal records
  const getPersonalRecords = () => {
    if (!performanceData || performanceData.length === 0) return [];

    return performanceData
      .filter(p => p.plank_exercises)
      .map(p => ({
        exercise: p.plank_exercises!.name,
        bestTime: p.best_duration_seconds,
        totalSessions: p.total_sessions,
        averageTime: p.average_duration_seconds
      }))
      .sort((a, b) => b.bestTime - a.bestTime)
      .slice(0, 5);
  };

  const trendData = generateTrendData();
  const exerciseDistribution = generateExerciseDistribution();
  const personalRecords = getPersonalRecords();

  if (sessionsLoading || statsLoading || performanceLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!sessions || sessions.length === 0) {
    return (
      <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
        <CardContent className="p-8 text-center">
          <BarChart3 className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Performance Data Yet</h3>
          <p className="text-gray-600">
            Complete a few workouts to see your performance trends and analytics here.
          </p>
        </CardContent>
      </Card>
    );
  }

  const weeklyImprovement = stats && stats.weeklyProgress.length > 1 
    ? ((stats.weeklyProgress[stats.weeklyProgress.length - 1].sessions - stats.weeklyProgress[0].sessions) / Math.max(stats.weeklyProgress[0].sessions, 1)) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto text-blue-600 mb-2" />
              <p className="text-2xl font-bold text-blue-800">
                {weeklyImprovement > 0 ? '+' : ''}{weeklyImprovement.toFixed(1)}%
              </p>
              <p className="text-sm text-blue-600">Weekly Improvement</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto text-green-600 mb-2" />
              <p className="text-2xl font-bold text-green-800">
                {personalRecords.length > 0 ? formatDuration(personalRecords[0].bestTime) : '0:00'}
              </p>
              <p className="text-sm text-green-600">Personal Best</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-4 text-center">
              <Target className="w-8 h-8 mx-auto text-purple-600 mb-2" />
              <p className="text-2xl font-bold text-purple-800">
                {exerciseDistribution.length}
              </p>
              <p className="text-sm text-purple-600">Exercises Tried</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Performance Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
              Performance Trend (30 Days)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#666" fontSize={12} />
                <YAxis 
                  stroke="#666" 
                  fontSize={12}
                  tickFormatter={(value) => formatDuration(value)}
                />
                <Tooltip 
                  formatter={(value: number) => [formatDuration(value), 'Average Duration']}
                  labelStyle={{ color: '#333' }}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc', borderRadius: '8px' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: '#ea580c' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* Exercise Distribution and Personal Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exercise Distribution */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-orange-500" />
                Exercise Variety
              </CardTitle>
            </CardHeader>
            <CardContent>
              {exerciseDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={exerciseDistribution}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                    >
                      {exerciseDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No exercise data available</p>
                </div>
              )}
              <div className="mt-4 space-y-2">
                {exerciseDistribution.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2" 
                        style={{ backgroundColor: exercise.color }}
                      />
                      <span>{exercise.name}</span>
                    </div>
                    <span className="text-gray-600">{exercise.value} sessions</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Personal Records */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-orange-500" />
                Personal Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              {personalRecords.length > 0 ? (
                <div className="space-y-4">
                  {personalRecords.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-800">{record.exercise}</p>
                        <p className="text-sm text-gray-600">
                          {record.totalSessions} sessions • Avg: {formatDuration(record.averageTime)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-orange-600">
                          {formatDuration(record.bestTime)}
                        </p>
                        <p className="text-xs text-gray-500">Best Time</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No personal records yet</p>
                  <p className="text-sm text-gray-400">Complete more workouts to track your progress</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default BasicPerformanceDashboard;
