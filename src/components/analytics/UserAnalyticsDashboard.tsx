
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  Brain,
  Trophy,
  AlertTriangle,
  Clock,
  BarChart3
} from 'lucide-react';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { useMLInsights } from '@/hooks/useMLInsights';
import { useBenchmarking } from '@/hooks/useBenchmarking';
import FeatureGuard from '@/components/access/FeatureGuard';
import { ProgressTrendChart, PerformanceRadarChart } from '@/components/charts/AdvancedCharts';

const UserAnalyticsDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('month');
  const { data: analytics, isLoading } = useAdvancedAnalytics(selectedTimeframe);
  const { data: mlInsights } = useMLInsights();
  const { data: benchmarks } = useBenchmarking();

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m ${seconds % 60}s`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-center text-gray-500">No analytics data available</p>
        </CardContent>
      </Card>
    );
  }

  const radarData = [
    { metric: 'Consistency', value: analytics.metrics.consistency_score, fullMark: 100 },
    { metric: 'Improvement', value: Math.max(0, analytics.metrics.improvement_rate + 50), fullMark: 100 },
    { metric: 'Variety', value: Math.min(100, analytics.metrics.exercise_variety * 20), fullMark: 100 },
    { metric: 'Duration', value: Math.min(100, (analytics.metrics.average_session_duration / 300) * 100), fullMark: 100 },
    { metric: 'Goal Progress', value: analytics.metrics.goal_achievement_probability * 100, fullMark: 100 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Advanced Analytics</h2>
          <p className="text-gray-600">Deep insights into your fitness journey</p>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'quarter'] as const).map((timeframe) => (
            <Button
              key={timeframe}
              variant={selectedTimeframe === timeframe ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeframe(timeframe)}
              className="capitalize"
            >
              {timeframe}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Consistency Score</p>
                  <p className="text-2xl font-bold">{analytics.metrics.consistency_score.toFixed(0)}%</p>
                </div>
                <Activity className="w-8 h-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Improvement Rate</p>
                  <p className="text-2xl font-bold">
                    {analytics.metrics.improvement_rate > 0 ? '+' : ''}
                    {analytics.metrics.improvement_rate.toFixed(1)}%
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Goal Achievement</p>
                  <p className="text-2xl font-bold">{(analytics.metrics.goal_achievement_probability * 100).toFixed(0)}%</p>
                </div>
                <Target className="w-8 h-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Avg Duration</p>
                  <p className="text-2xl font-bold">{formatTime(analytics.metrics.average_session_duration)}</p>
                </div>
                <Clock className="w-8 h-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="benchmarks">Benchmarks</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceRadarChart
              title="Performance Overview"
              data={radarData}
            />
            <Card>
              <CardHeader>
                <CardTitle>Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressTrendChart
                  title=""
                  data={analytics.charts.find(c => c.type === 'line')?.data || []}
                  height={250}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <FeatureGuard 
            feature="detailed_performance_tracking"
            fallback={
              <Card className="p-6 text-center">
                <Trophy className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold mb-2">Unlock Detailed Performance Tracking</h3>
                <p className="text-gray-600 mb-4">
                  Get advanced performance insights with Premium
                </p>
                <Button className="bg-orange-500 hover:bg-orange-600">
                  Upgrade to Premium
                </Button>
              </Card>
            }
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Plateau Risk Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Current Risk Level</span>
                      <Badge variant={analytics.metrics.plateau_risk > 60 ? 'destructive' : 'secondary'}>
                        {analytics.metrics.plateau_risk.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${analytics.metrics.plateau_risk}%` }}
                      />
                    </div>
                    {analytics.metrics.plateau_risk > 60 && (
                      <div className="flex items-start gap-2 text-sm text-amber-600">
                        <AlertTriangle className="w-4 h-4 mt-0.5" />
                        <span>Consider adding variety to your routine to break through plateaus</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Optimal Workout Times</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Best Time:</span>
                    <Badge variant="outline">{analytics.timeCorrelation.best_time_of_day}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Best Day:</span>
                    <Badge variant="outline">{analytics.timeCorrelation.best_day_of_week}</Badge>
                  </div>
                  <div className="text-xs text-gray-500">
                    Based on your performance history
                  </div>
                </CardContent>
              </Card>
            </div>
          </FeatureGuard>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          {mlInsights ? (
            <div className="space-y-4">
              {/* ML Predictions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Performance Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Next 7 Days Avg</p>
                      <p className="text-xl font-bold text-orange-500">
                        {formatTime(mlInsights.performance_prediction.next_7_day_avg)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Next 30 Days Avg</p>
                      <p className="text-xl font-bold text-orange-500">
                        {formatTime(mlInsights.performance_prediction.next_30_day_avg)}
                      </p>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-500">Confidence</p>
                      <p className="text-xl font-bold text-orange-500">
                        {Math.round(mlInsights.performance_prediction.confidence * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Goal Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>AI Goal Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  {mlInsights.goal_suggestions.length === 0 ? (
                    <p className="text-gray-500">Complete more sessions to get personalized goals</p>
                  ) : (
                    <div className="space-y-3">
                      {mlInsights.goal_suggestions.map((goal, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="font-medium">{goal.title}</p>
                            <p className="text-sm text-gray-600">
                              Target: {goal.measurement_unit === 'seconds' ? formatTime(goal.target_value) : goal.target_value}
                              {' '}by {new Date(goal.target_date).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Set Goal
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="p-6 text-center">
              <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Complete more workouts to generate AI insights</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          {benchmarks ? (
            <Card>
              <CardHeader>
                <CardTitle>Performance Benchmarks</CardTitle>
                <p className="text-sm text-gray-600">
                  Compare your performance with similar users ({benchmarks.segment})
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Duration Percentile</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {benchmarks.percentile_duration || 'N/A'}
                      {benchmarks.percentile_duration ? 'th' : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      Better than {benchmarks.percentile_duration || 0}% of users
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Consistency Percentile</p>
                    <p className="text-2xl font-bold text-orange-500">
                      {benchmarks.percentile_consistency || 'N/A'}
                      {benchmarks.percentile_consistency ? 'th' : ''}
                    </p>
                    <p className="text-xs text-gray-500">
                      Better than {benchmarks.percentile_consistency || 0}% of users
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  Based on {benchmarks.sample_size} users in your segment
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500">Building your benchmark profile...</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserAnalyticsDashboard;
