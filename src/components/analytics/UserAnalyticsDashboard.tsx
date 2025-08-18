
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Clock, Zap, Calendar, Award } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import FeatureGuard from '@/components/access/FeatureGuard';

const UserAnalyticsDashboard = () => {
  const { user } = useAuth();

  // Mock data for demonstration
  const performanceData = [
    { date: '2024-01-01', duration: 30, sessions: 1 },
    { date: '2024-01-02', duration: 35, sessions: 1 },
    { date: '2024-01-03', duration: 40, sessions: 2 },
    { date: '2024-01-04', duration: 45, sessions: 1 },
    { date: '2024-01-05', duration: 50, sessions: 2 },
    { date: '2024-01-06', duration: 55, sessions: 1 },
    { date: '2024-01-07', duration: 60, sessions: 3 },
  ];

  const exerciseDistribution = [
    { name: 'Standard Plank', value: 45, color: '#f97316' },
    { name: 'Side Plank', value: 25, color: '#eab308' },
    { name: 'Plank Variations', value: 20, color: '#22c55e' },
    { name: 'Core Workouts', value: 10, color: '#3b82f6' },
  ];

  const weeklyProgress = [
    { week: 'Week 1', average: 25, sessions: 4 },
    { week: 'Week 2', average: 35, sessions: 5 },
    { week: 'Week 3', average: 42, sessions: 6 },
    { week: 'Week 4', average: 48, sessions: 7 },
  ];

  const { data: userStats, isLoading } = useQuery({
    queryKey: ['user-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Get user stats from database
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error) throw error;

      return {
        totalSessions: sessions?.length || 0,
        totalDuration: sessions?.reduce((sum, session) => sum + (session.duration || 0), 0) || 0,
        averageDuration: sessions?.length ? Math.round((sessions.reduce((sum, session) => sum + (session.duration || 0), 0) / sessions.length)) : 0,
        streak: 5, // Mock streak data
        bestSession: Math.max(...(sessions?.map(s => s.duration || 0) || [0])),
        improvement: 25, // Mock improvement percentage
      };
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = userStats || {
    totalSessions: 0,
    totalDuration: 0,
    averageDuration: 0,
    streak: 0,
    bestSession: 0,
    improvement: 0,
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalSessions}</p>
              </div>
              <Calendar className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+12% this month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Time</p>
                <p className="text-2xl font-bold text-gray-900">{Math.floor(stats.totalDuration / 60)}m</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+8% this week</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Duration</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageDuration}s</p>
              </div>
              <Target className="w-8 h-8 text-green-500" />
            </div>
            <div className="mt-2 flex items-center">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{stats.improvement}% improvement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Current Streak</p>
                <p className="text-2xl font-bold text-gray-900">{stats.streak}</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <Badge variant="secondary" className="text-xs">
                Personal Best: {stats.bestSession}s
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <p className="text-sm text-gray-600">Your workout duration over time</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="#f97316" 
                  strokeWidth={2}
                  dot={{ fill: '#f97316', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Exercise Distribution</CardTitle>
            <p className="text-sm text-gray-600">Your workout variety</p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={exerciseDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {exerciseDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-4 space-y-2">
              {exerciseDistribution.map((entry, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: entry.color }}
                    />
                    <span>{entry.name}</span>
                  </div>
                  <span className="font-medium">{entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Progress</CardTitle>
          <p className="text-sm text-gray-600">Average duration and session frequency by week</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="average" fill="#f97316" name="Avg Duration (s)" />
              <Bar dataKey="sessions" fill="#eab308" name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gated Advanced Features */}
      <FeatureGuard 
        feature="advanced_stats"
        fallback={
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6 text-center">
              <Award className="w-12 h-12 mx-auto text-orange-500 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Unlock Advanced Analytics
              </h3>
              <p className="text-gray-600 mb-4">
                Get detailed performance insights, goal tracking, and AI-powered recommendations.
              </p>
            </CardContent>
          </Card>
        }
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Advanced metrics would go here */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Consistency Score</span>
                  <Badge className="bg-green-500">Excellent</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Progress Rate</span>
                  <Badge className="bg-blue-500">Above Average</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">Challenge Level</span>
                  <Badge className="bg-orange-500">Optimal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Next Milestones</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm font-medium">2min plank (75%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="text-sm font-medium">30-day streak (40%)</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm font-medium">100 sessions (60%)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </FeatureGuard>
    </div>
  );
};

export default UserAnalyticsDashboard;
