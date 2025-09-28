import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  Target, 
  Activity, 
  Calendar,
  Clock,
  Brain,
  AlertTriangle,
  Award
} from 'lucide-react';
import { useAdvancedAnalytics } from '@/hooks/useAdvancedAnalytics';
import { 
  ProgressTrendChart, 
  ExerciseVarietyChart, 
  ConsistencyHeatmap,
  PerformanceRadarChart 
} from '@/components/charts/AdvancedCharts';
import MLInsightsPanel from '@/components/analytics/MLInsightsPanel';

type TimeframeType = 'week' | 'month' | 'quarter' | 'year';

const AdvancedAnalyticsDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<TimeframeType>('month');
  const { data: analytics, isLoading, error } = useAdvancedAnalytics(selectedTimeframe);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="w-4 h-4" />;
      case 'plateau': return <AlertTriangle className="w-4 h-4" />;
      case 'achievement': return <Award className="w-4 h-4" />;
      case 'recommendation': return <Target className="w-4 h-4" />;
      default: return <Brain className="w-4 h-4" />;
    }
  };

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'bg-green-100 text-green-800 border-green-200';
      case 'plateau': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'achievement': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recommendation': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-12 w-12 rounded-full mb-4" />
                <Skeleton className="h-6 w-16 mb-2" />
                <Skeleton className="h-4 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-center text-gray-500">Failed to load advanced analytics</p>
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Advanced Analytics
          </h2>
          <p className="text-gray-600">Deep insights into your fitness journey</p>
        </div>
        
        <div className="flex gap-2">
          {(['week', 'month', 'quarter', 'year'] as TimeframeType[]).map((timeframe) => (
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.4 }}
        >
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Consistency Score</p>
                  <p className="text-2xl font-bold">{analytics.metrics.consistency_score.toFixed(0)}%</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
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
            <CardContent className="p-6">
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
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Exercise Variety</p>
                  <p className="text-2xl font-bold">{analytics.metrics.exercise_variety}</p>
                </div>
                <Activity className="w-8 h-8 text-purple-200" />
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
            <CardContent className="p-6">
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

      {/* Detailed Analytics */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="patterns">Patterns</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformanceRadarChart
              title="Performance Overview"
              data={radarData}
            />
            <Card>
              <CardHeader>
                <CardTitle>Goal Achievement Probability</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-orange-500 mb-2">
                    {(analytics.metrics.goal_achievement_probability * 100).toFixed(0)}%
                  </div>
                  <p className="text-gray-600">Likelihood of achieving your goals</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Best workout time:</span>
                    <span className="font-medium">{analytics.timeCorrelation.best_time_of_day}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Best workout day:</span>
                    <span className="font-medium">{analytics.timeCorrelation.best_day_of_week}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Plateau risk:</span>
                    <span className={`font-medium ${analytics.metrics.plateau_risk > 60 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {analytics.metrics.plateau_risk.toFixed(0)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ML Insights Panel */}
          <MLInsightsPanel />
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <ProgressTrendChart
            title="Duration Progress Over Time"
            data={analytics.charts.find(c => c.type === 'line')?.data || []}
          />
          <ExerciseVarietyChart
            title="Exercise Distribution"
            data={analytics.charts.find(c => c.type === 'bar')?.data || []}
          />
        </TabsContent>

        <TabsContent value="patterns" className="space-y-6">
          <ConsistencyHeatmap
            title="30-Day Workout Consistency"
            data={analytics.charts.find(c => c.type === 'heatmap')?.data || []}
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          {analytics.insights.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Brain className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  Keep working out to generate personalized insights!
                </p>
              </CardContent>
            </Card>
          ) : (
            analytics.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className={`border-l-4 ${getInsightColor(insight.type)}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-gray-800">
                            {insight.icon} {insight.title}
                          </h3>
                          <Badge variant="secondary" className="ml-2">
                            {Math.round(insight.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-3">{insight.description}</p>
                        {insight.actionable && (
                          <Badge variant="outline" className="text-xs">
                            Actionable
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AdvancedAnalyticsDashboard;
