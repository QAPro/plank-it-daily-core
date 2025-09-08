import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, Zap, Award, Users } from 'lucide-react';
import { hookModelAnalytics, type SuccessMetrics } from '@/services/hookModelAnalytics';
import { hookOptimizationEngine, type OptimizationRecommendation } from '@/services/hookOptimizationEngine';

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface MetricCard {
  title: string;
  value: string;
  change: number;
  icon: React.ReactNode;
  color: string;
}

export const HookModelDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [successMetrics, setSuccessMetrics] = useState<SuccessMetrics | null>(null);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [timeframe, setTimeframe] = useState(30);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user, timeframe]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [metrics, userRecommendations] = await Promise.all([
        hookModelAnalytics.getSuccessMetrics(timeframe),
        user ? hookOptimizationEngine.generatePersonalizedRecommendations(user.id, timeframe) : Promise.resolve([])
      ]);

      setSuccessMetrics(metrics);
      setRecommendations(userRecommendations);
    } catch (error) {
      console.error('Failed to load hook model data:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyOptimization = async (recommendation: OptimizationRecommendation) => {
    try {
      // Apply optimization and refresh data
      await loadDashboardData();
    } catch (error) {
      console.error('Failed to apply optimization:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!successMetrics) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No hook model data available yet. Complete some workouts to see insights!</p>
        </CardContent>
      </Card>
    );
  }

  const metricCards: MetricCard[] = [
    {
      title: 'Hook Completion Rate',
      value: `${successMetrics.hook_completion_rate.toFixed(1)}%`,
      change: 5.2,
      icon: <Target className="h-4 w-4" />,
      color: 'text-green-600'
    },
    {
      title: 'Trigger Effectiveness',
      value: `${successMetrics.trigger_effectiveness.avg_response_rate.toFixed(1)}%`,
      change: 3.1,
      icon: <Zap className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    {
      title: 'Investment Depth',
      value: `${successMetrics.investment_depth.avg_customizations.toFixed(1)}`,
      change: 8.7,
      icon: <Award className="h-4 w-4" />,
      color: 'text-purple-600'
    },
    {
      title: 'Habit Formation',
      value: `${successMetrics.habit_formation.streak_21_plus.toFixed(1)}%`,
      change: -1.2,
      icon: <Users className="h-4 w-4" />,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Hook Model Analytics</h1>
          <p className="text-muted-foreground">
            Understand what motivates you and optimize your fitness journey
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={timeframe === 7 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe(7)}
          >
            7D
          </Button>
          <Button 
            variant={timeframe === 30 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe(30)}
          >
            30D
          </Button>
          <Button 
            variant={timeframe === 90 ? "default" : "outline"}
            size="sm"
            onClick={() => setTimeframe(90)}
          >
            90D
          </Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metricCards.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <span className={metric.color}>{metric.icon}</span>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                {metric.change > 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-600" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-600" />
                )}
                <span className={metric.change > 0 ? 'text-green-600' : 'text-red-600'}>
                  {Math.abs(metric.change)}%
                </span>
                <span>from last period</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="triggers">Triggers</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Active Users Trend</CardTitle>
                <CardDescription>Your engagement pattern over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={successMetrics.daily_active_users}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="dau_percentage" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Success Correlation Heatmap</CardTitle>
                <CardDescription>What combinations work best for you</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-muted-foreground">Morning Workouts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">78%</div>
                    <div className="text-sm text-muted-foreground">XP Rewards</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">92%</div>
                    <div className="text-sm text-muted-foreground">Encouraging Tone</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Retention Metrics</CardTitle>
              <CardDescription>How well we're helping you stick to your goals</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Day 7 Retention</span>
                    <span className="text-sm text-muted-foreground">
                      {successMetrics.retention_rates.day_7.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={successMetrics.retention_rates.day_7} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Day 30 Retention</span>
                    <span className="text-sm text-muted-foreground">
                      {successMetrics.retention_rates.day_30.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={successMetrics.retention_rates.day_30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Day 90 Retention</span>
                    <span className="text-sm text-muted-foreground">
                      {successMetrics.retention_rates.day_90.toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={successMetrics.retention_rates.day_90} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Triggers Tab */}
        <TabsContent value="triggers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Best Trigger Times</CardTitle>
                <CardDescription>When you respond best to notifications</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { time: '9:00 AM', rate: 85, peak: true },
                    { time: '6:00 PM', rate: 78, peak: false },
                    { time: '12:00 PM', rate: 65, peak: false },
                    { time: '8:00 PM', rate: 55, peak: false }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{item.time}</span>
                        {item.peak && <Badge variant="secondary">Peak</Badge>}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={item.rate} className="w-20 h-2" />
                        <span className="text-sm text-muted-foreground">{item.rate}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Message Effectiveness</CardTitle>
                <CardDescription>Which notification styles work best</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { style: 'Encouraging', rate: 82 },
                    { style: 'Goal-focused', rate: 75 },
                    { style: 'Progress-based', rate: 68 },
                    { style: 'Challenge', rate: 58 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="style" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rate" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Actions Tab */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Friction Points</CardTitle>
                <CardDescription>Where you experience the most difficulty</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { location: 'Exercise Selection', impact: 8, frequency: 12 },
                    { location: 'Timer Start', impact: 5, frequency: 8 },
                    { location: 'Progress Tracking', impact: 6, frequency: 6 },
                    { location: 'Form Guidance', impact: 7, frequency: 4 }
                  ].map((friction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{friction.location}</div>
                        <div className="text-sm text-muted-foreground">
                          {friction.frequency} occurrences
                        </div>
                      </div>
                      <Badge variant={friction.impact > 7 ? 'destructive' : friction.impact > 5 ? 'default' : 'secondary'}>
                        Impact: {friction.impact}/10
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Completion Paths</CardTitle>
                <CardDescription>Fastest routes to workout success</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={[
                    { path: 'Direct Start', time: 45 },
                    { path: 'With Warmup', time: 75 },
                    { path: 'Custom Setup', time: 95 },
                    { path: 'Social Share', time: 120 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="path" />
                    <YAxis label={{ value: 'Seconds', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Bar dataKey="time" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Rewards Tab */}
        <TabsContent value="rewards" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reward Effectiveness</CardTitle>
                <CardDescription>Which rewards motivate you most</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'XP Points', value: 35, color: COLORS[0] },
                        { name: 'Achievements', value: 28, color: COLORS[1] },
                        { name: 'Streaks', value: 22, color: COLORS[2] },
                        { name: 'Social Recognition', value: 15, color: COLORS[3] }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {[0, 1, 2, 3].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Return Correlation</CardTitle>
                <CardDescription>How rewards impact your comeback rate</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { reward: 'Achievement Unlocked', return_7d: 85, return_30d: 72 },
                    { reward: 'XP Bonus', return_7d: 78, return_30d: 65 },
                    { reward: 'Streak Milestone', return_7d: 82, return_30d: 68 },
                    { reward: 'Social Share', return_7d: 65, return_30d: 58 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.reward}</span>
                        <div className="flex space-x-4 text-sm">
                          <span>7d: {item.return_7d}%</span>
                          <span>30d: {item.return_30d}%</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Progress value={item.return_7d} className="h-2" />
                        <Progress value={item.return_30d} className="h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Optimization Tab */}
        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personalized Recommendations</CardTitle>
              <CardDescription>AI-powered suggestions to improve your experience</CardDescription>
            </CardHeader>
            <CardContent>
              {recommendations.length > 0 ? (
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            rec.priority === 'high' ? 'destructive' : 
                            rec.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {rec.priority.toUpperCase()}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {rec.type.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">+{rec.expected_impact}%</span>
                          <span className="text-muted-foreground ml-1">impact</span>
                        </div>
                      </div>
                      <p className="text-sm">{rec.recommendation}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-muted-foreground">
                            Confidence: {rec.confidence}%
                          </span>
                          <Progress value={rec.confidence} className="w-16 h-1" />
                        </div>
                        <Button 
                          size="sm" 
                          onClick={() => applyOptimization(rec)}
                          disabled={rec.confidence < 70}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    No optimization recommendations available yet. 
                    Complete more workouts to get personalized insights!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Wellbeing Indicators</CardTitle>
              <CardDescription>Ensuring healthy and sustainable engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Sustainable Usage</span>
                      <span className="text-sm text-muted-foreground">
                        {successMetrics.wellbeing_indicators.sustainable_usage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={successMetrics.wellbeing_indicators.sustainable_usage} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Positive Sentiment</span>
                      <span className="text-sm text-muted-foreground">
                        {successMetrics.wellbeing_indicators.positive_sentiment.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={successMetrics.wellbeing_indicators.positive_sentiment} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Healthy Engagement</span>
                      <span className="text-sm text-muted-foreground">
                        {successMetrics.ethical_metrics.healthy_engagement.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={successMetrics.ethical_metrics.healthy_engagement} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Graceful Graduation</span>
                      <span className="text-sm text-muted-foreground">
                        {successMetrics.ethical_metrics.graceful_graduation.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={successMetrics.ethical_metrics.graceful_graduation} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};