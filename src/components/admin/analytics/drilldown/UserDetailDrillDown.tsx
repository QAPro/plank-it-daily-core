
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Activity, TrendingUp, Calendar, Target, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface UserDetailDrillDownProps {
  userId: string;
  metadata?: Record<string, any>;
}

interface UserDetails {
  profile: any;
  recentSessions: any[];
  streakData: any;
  monthlyStats: any[];
  achievements: any[];
  exercisePerformance: any[];
}

const UserDetailDrillDown: React.FC<UserDetailDrillDownProps> = ({ userId, metadata }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserDetails();
  }, [userId]);

  const loadUserDetails = async () => {
    setLoading(true);
    try {
      // Load user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      // Load recent sessions
      const { data: recentSessions } = await supabase
        .from('user_sessions')
        .select(`
          *,
          plank_exercises (name, category)
        `)
        .eq('user_id', userId)
        .order('completed_at', { ascending: false })
        .limit(10);

      // Load streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', userId)
        .single();

      // Load monthly stats
      const { data: monthlyStats } = await supabase
        .from('user_monthly_stats')
        .select('*')
        .eq('user_id', userId)
        .order('month_start', { ascending: false })
        .limit(6);

      // Load exercise performance
      const { data: exercisePerformance } = await supabase
        .from('user_exercise_performance')
        .select(`
          *,
          plank_exercises (name)
        `)
        .eq('user_id', userId)
        .order('total_sessions', { ascending: false })
        .limit(5);

      setUserDetails({
        profile,
        recentSessions: recentSessions || [],
        streakData,
        monthlyStats: monthlyStats || [],
        achievements: [], // Placeholder for achievements
        exercisePerformance: exercisePerformance || []
      });
    } catch (error) {
      console.error('Error loading user details:', error);
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

  if (!userDetails) {
    return <div className="text-center py-8 text-muted-foreground">Failed to load user details</div>;
  }

  const { profile, recentSessions, streakData, monthlyStats, exercisePerformance } = userDetails;

  const chartConfig = {
    sessions: { label: "Sessions", color: "hsl(var(--primary))" },
    duration: { label: "Duration (min)", color: "hsl(var(--secondary))" }
  };

  return (
    <div className="space-y-6">
      {/* User Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Profile</span>
            </div>
            <div className="space-y-1">
              <p className="font-semibold">{profile?.full_name || 'Unknown User'}</p>
              <p className="text-sm text-muted-foreground">{profile?.email}</p>
              <Badge variant="secondary" className="text-xs">
                Level {profile?.current_level || 1}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Streak</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{streakData?.current_streak || 0}</p>
              <p className="text-sm text-muted-foreground">Current streak</p>
              <p className="text-xs">Best: {streakData?.longest_streak || 0} days</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">XP</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{profile?.total_xp || 0}</p>
              <p className="text-sm text-muted-foreground">Total XP</p>
              <Badge variant="outline" className="text-xs">
                {profile?.subscription_tier || 'free'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Sessions</span>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">{recentSessions.length}</p>
              <p className="text-sm text-muted-foreground">Recent sessions</p>
              <p className="text-xs">Last 30 days</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="activity">Activity</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Monthly Activity Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyStats.reverse()}>
                    <XAxis 
                      dataKey="month_start" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="sessions_count" 
                      stroke="var(--color-sessions)" 
                      strokeWidth={2}
                      dot={{ fill: "var(--color-sessions)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Exercise Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {exercisePerformance.map((exercise, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{exercise.plank_exercises?.name || 'Unknown Exercise'}</p>
                      <p className="text-sm text-muted-foreground">
                        {exercise.total_sessions} sessions • Best: {Math.round(exercise.best_duration_seconds / 60)}min
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">Avg: {Math.round(exercise.average_duration_seconds / 60)}min</p>
                      <Progress 
                        value={exercise.success_rate * 100} 
                        className="w-20 h-2 mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Duration Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyStats}>
                    <XAxis 
                      dataKey="month_start" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short' })}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="total_duration" 
                      fill="var(--color-duration)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentSessions.slice(0, 5).map((session, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{session.plank_exercises?.name || 'Unknown Exercise'}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(session.completed_at).toLocaleDateString()} at{' '}
                        {new Date(session.completed_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">
                        {Math.round(session.duration_seconds / 60)}min {session.duration_seconds % 60}s
                      </Badge>
                      {session.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{session.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserDetailDrillDown;
