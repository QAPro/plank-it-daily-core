
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Users, TrendingUp, Target, Clock, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface ExerciseDetailDrillDownProps {
  exerciseId: string;
  metadata?: Record<string, any>;
}

interface ExerciseAnalytics {
  exercise: any;
  usageStats: {
    totalSessions: number;
    uniqueUsers: number;
    avgDuration: number;
    completionRate: number;
  };
  dailyUsage: any[];
  userPerformance: any[];
  difficultyDistribution: any[];
}

const ExerciseDetailDrillDown: React.FC<ExerciseDetailDrillDownProps> = ({ exerciseId, metadata }) => {
  const [analytics, setAnalytics] = useState<ExerciseAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExerciseAnalytics();
  }, [exerciseId]);

  const loadExerciseAnalytics = async () => {
    setLoading(true);
    try {
      // Load exercise details
      const { data: exercise } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', exerciseId)
        .single();

      // Load usage statistics
      const { data: sessions } = await supabase
        .from('user_sessions')
        .select('*, users!inner(subscription_tier)')
        .eq('exercise_id', exerciseId)
        .gte('completed_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const totalSessions = sessions?.length || 0;
      const uniqueUsers = new Set(sessions?.map(s => s.user_id)).size;
      const avgDuration = sessions?.reduce((sum, s) => sum + s.duration_seconds, 0) / totalSessions || 0;
      const completionRate = sessions?.filter(s => s.duration_seconds >= 30).length / totalSessions * 100 || 0;

      // Daily usage over last 30 days
      const dailyUsage = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(Date.now() - i * 24 * 60 * 60 * 1000);
        const dateStr = date.toISOString().split('T')[0];
        const daySessions = sessions?.filter(s => s.completed_at?.startsWith(dateStr)) || [];
        
        return {
          date: dateStr,
          sessions: daySessions.length,
          avgDuration: daySessions.reduce((sum, s) => sum + s.duration_seconds, 0) / daySessions.length || 0,
          uniqueUsers: new Set(daySessions.map(s => s.user_id)).size
        };
      }).reverse();

      // User performance distribution
      const { data: userPerformance } = await supabase
        .from('user_exercise_performance')
        .select('*, users!inner(subscription_tier)')
        .eq('exercise_id', exerciseId)
        .order('best_duration_seconds', { ascending: false })
        .limit(10);

      // Subscription tier distribution
      const tierCounts = sessions?.reduce((acc: any, session: any) => {
        const tier = session.users?.subscription_tier || 'free';
        acc[tier] = (acc[tier] || 0) + 1;
        return acc;
      }, {});

      const difficultyDistribution = Object.entries(tierCounts || {}).map(([tier, count]) => ({
        tier,
        count,
        percentage: (count as number) / totalSessions * 100
      }));

      setAnalytics({
        exercise,
        usageStats: {
          totalSessions,
          uniqueUsers,
          avgDuration,
          completionRate
        },
        dailyUsage,
        userPerformance: userPerformance || [],
        difficultyDistribution
      });
    } catch (error) {
      console.error('Error loading exercise analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-6 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) {
    return <div className="text-center py-8 text-muted-foreground">Failed to load exercise analytics</div>;
  }

  const { exercise, usageStats, dailyUsage, userPerformance, difficultyDistribution } = analytics;

  const chartConfig = {
    sessions: { label: "Sessions", color: "hsl(var(--primary))" },
    avgDuration: { label: "Avg Duration (s)", color: "hsl(var(--secondary))" },
    uniqueUsers: { label: "Unique Users", color: "hsl(var(--accent))" }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6">
      {/* Exercise Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{exercise.name}</CardTitle>
              <p className="text-muted-foreground mt-1">{exercise.description}</p>
            </div>
            <Badge variant="secondary" className="text-sm">
              Level {exercise.difficulty_level}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <Activity className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <p className="text-2xl font-bold text-blue-600">{usageStats.totalSessions}</p>
              <p className="text-sm text-muted-foreground">Total Sessions</p>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <p className="text-2xl font-bold text-green-600">{usageStats.uniqueUsers}</p>
              <p className="text-sm text-muted-foreground">Unique Users</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <Clock className="h-6 w-6 mx-auto mb-2 text-orange-600" />
              <p className="text-2xl font-bold text-orange-600">
                {Math.round(usageStats.avgDuration / 60)}m {usageStats.avgDuration % 60}s
              </p>
              <p className="text-sm text-muted-foreground">Avg Duration</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <Target className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <p className="text-2xl font-bold text-purple-600">{usageStats.completionRate.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Usage Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Usage (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyUsage}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="sessions" 
                    stroke="var(--color-sessions)" 
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="uniqueUsers" 
                    stroke="var(--color-uniqueUsers)" 
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* User Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Usage by Subscription Tier</CardTitle>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={difficultyDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tier, percentage }) => `${tier}: ${percentage.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {difficultyDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {userPerformance.slice(0, 5).map((performance, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="w-8 h-8 rounded-full flex items-center justify-center">
                    {index + 1}
                  </Badge>
                  <div>
                    <p className="font-medium">User {performance.user_id.slice(0, 8)}...</p>
                    <p className="text-sm text-muted-foreground">
                      {performance.total_sessions} sessions • {(performance.success_rate * 100).toFixed(1)}% success rate
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {Math.floor(performance.best_duration_seconds / 60)}:{(performance.best_duration_seconds % 60).toString().padStart(2, '0')}
                  </p>
                  <p className="text-sm text-muted-foreground">Personal Best</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExerciseDetailDrillDown;
