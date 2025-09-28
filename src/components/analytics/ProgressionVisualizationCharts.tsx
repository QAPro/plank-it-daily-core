import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target, Zap, Clock } from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  AreaChart, 
  Area,
  ComposedChart,
  ReferenceLine
} from 'recharts';
import { useExtendedSessionHistory } from '@/hooks/useExtendedSessionHistory';
import { generateTrendData, findPersonalRecords, calculateMilestones } from '@/utils/analyticsUtils';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface ProgressionVisualizationChartsProps {
  days?: number;
}

const ProgressionVisualizationCharts = ({ 
  days = 90 
}) => {
  const { user } = useAuth();
  const { data: sessions = [], isLoading } = useExtendedSessionHistory(days);

  // Get streak data
  const { data: streakData } = useQuery({
    queryKey: ['user-streak', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const trendData = generateTrendData(sessions, days);
  const personalRecords = findPersonalRecords(sessions);
  const milestones = calculateMilestones(sessions, streakData);

  // Calculate performance comparison with previous period
  const halfPoint = Math.floor(days / 2);
  const recentSessions = sessions.slice(0, sessions.length / 2);
  const olderSessions = sessions.slice(sessions.length / 2);
  
  const recentAvg = recentSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / recentSessions.length || 0;
  const olderAvg = olderSessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / olderSessions.length || 0;
  const performanceChange = ((recentAvg - olderAvg) / olderAvg) * 100 || 0;

  // Weekly aggregation for consistency tracking
  const weeklyData = useMemo(() => {
    const weeks = new Map<string, { duration: number; sessions: number; week: string }>();
    
    sessions.forEach(session => {
      const date = new Date(session.completed_at);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      const existing = weeks.get(weekKey) || { duration: 0, sessions: 0, week: weekKey };
      weeks.set(weekKey, {
        ...existing,
        duration: existing.duration + (session.duration_seconds || 0),
        sessions: existing.sessions + 1
      });
    });
    
    return Array.from(weeks.values())
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-12) // Last 12 weeks
      .map(week => ({
        ...week,
        avgDuration: Math.round(week.duration / Math.max(week.sessions, 1)),
        week: new Date(week.week).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
  }, [sessions]);

  // Progress velocity calculation
  const progressVelocity = useMemo(() => {
    if (trendData.length < 7) return 0;
    
    const recent7 = trendData.slice(-7);
    const previous7 = trendData.slice(-14, -7);
    
    const recentAvg = recent7.reduce((sum, d) => sum + d.duration, 0) / recent7.length;
    const previousAvg = previous7.reduce((sum, d) => sum + d.duration, 0) / previous7.length;
    
    return ((recentAvg - previousAvg) / previousAvg) * 100 || 0;
  }, [trendData]);

  const getTrendIcon = (change: number) => {
    if (change > 5) return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (change < -5) return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-500" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 5) return 'text-green-600';
    if (change < -5) return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="space-y-6">
      {/* Performance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Performance Trend</p>
                <p className="text-2xl font-bold">{Math.round(Math.abs(performanceChange))}%</p>
                <p className="text-xs text-muted-foreground">vs. previous period</p>
              </div>
              {getTrendIcon(performanceChange)}
            </div>
            <div className="mt-2">
              <span className={`text-sm font-medium ${getTrendColor(performanceChange)}`}>
                {performanceChange > 0 ? '+' : ''}{Math.round(performanceChange)}% change
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progress Velocity</p>
                <p className="text-2xl font-bold">{Math.round(Math.abs(progressVelocity))}%</p>
                <p className="text-xs text-muted-foreground">weekly improvement</p>
              </div>
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="mt-2">
              <Badge variant={progressVelocity > 0 ? "default" : "secondary"} className="text-xs">
                {progressVelocity > 0 ? 'Accelerating' : 'Stable'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Consistency Score</p>
                <p className="text-2xl font-bold">{weeklyData.length > 0 ? Math.round((weeklyData.filter(w => w.sessions > 0).length / weeklyData.length) * 100) : 0}%</p>
                <p className="text-xs text-muted-foreground">weekly activity</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">
                {weeklyData.filter(w => w.sessions > 0).length}/{weeklyData.length} weeks active
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progressive Trend Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Progressive Improvement
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Duration trend with moving average
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${value}s`, 
                    name === 'duration' ? 'Duration' : '7-day Average'
                  ]}
                />
                <Bar dataKey="sessions" fill="hsl(var(--muted))" opacity={0.3} />
                <Line 
                  type="monotone" 
                  dataKey="duration" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="movingAverage" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Weekly Consistency Tracking */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Weekly Consistency
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Session frequency and average duration
            </p>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'sessions' ? `${value} sessions` : `${value}s avg`,
                    name === 'sessions' ? 'Sessions' : 'Avg Duration'
                  ]}
                />
                <Bar dataKey="sessions" fill="hsl(var(--primary))" />
                <Line 
                  type="monotone" 
                  dataKey="avgDuration" 
                  stroke="hsl(var(--accent))" 
                  strokeWidth={3}
                  yAxisId="right"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Personal Records Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Personal Records
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your best performances by exercise
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personalRecords.length > 0 ? personalRecords.map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{record.exercise}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(record.achievedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{record.duration}s</p>
                    {record.isRecent && (
                      <Badge variant="secondary" className="text-xs">
                        Recent PR
                      </Badge>
                    )}
                  </div>
                </div>
              )) : (
                <p className="text-center text-muted-foreground py-8">
                  Complete more workouts to see your personal records
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Milestone Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              Milestone Progress
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Your progress towards key achievements
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {milestones.map((milestone, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{milestone.icon}</span>
                      <span className="font-medium">{milestone.title}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {milestone.current}/{milestone.target}
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(milestone.percentage, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {Math.round(milestone.percentage)}% complete
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProgressionVisualizationCharts;