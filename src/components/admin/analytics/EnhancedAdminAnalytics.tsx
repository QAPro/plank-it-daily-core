
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Activity,
  Target,
  DollarSign,
  RefreshCw,
  TrendingUp
} from 'lucide-react';
import AdminAnalyticsDashboard from '@/components/admin/analytics/AdminAnalyticsDashboard';
import ConversionFunnelChart from '@/components/analytics/ConversionFunnelChart';
import ChurnPredictionPanel from '@/components/analytics/ChurnPredictionPanel';
import EnhancedSubscriptionAnalyticsDashboard from '@/components/admin/analytics/EnhancedSubscriptionAnalyticsDashboard';
import RetentionCohortChart from '@/components/admin/analytics/RetentionCohortChart';
import { useQuery } from '@tanstack/react-query';
import { 
  getUserEngagementSummary,
  getActiveUsersMetrics,
  getWorkoutCompletionAnalytics,
  getFeatureFlagAnalytics
} from '@/services/adminAnalyticsService';

const EnhancedAdminAnalytics = () => {
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: engagement } = useQuery({
    queryKey: ['admin-engagement', refreshKey],
    queryFn: getUserEngagementSummary,
  });

  const { data: activeUsers } = useQuery({
    queryKey: ['admin-active-users', refreshKey], 
    queryFn: getActiveUsersMetrics,
  });

  const { data: workoutAnalytics } = useQuery({
    queryKey: ['admin-workout-analytics', refreshKey],
    queryFn: () => getWorkoutCompletionAnalytics(30),
  });

  const { data: featureAnalytics } = useQuery({
    queryKey: ['admin-feature-analytics', refreshKey],
    queryFn: getFeatureFlagAnalytics,
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Enhanced Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive insights for business optimization</p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto text-blue-500 mb-2" />
            <p className="text-2xl font-bold">{engagement?.total_users || 0}</p>
            <p className="text-sm text-gray-600">Total Users</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Activity className="w-8 h-8 mx-auto text-green-500 mb-2" />
            <p className="text-2xl font-bold">{engagement?.active_today || 0}</p>
            <p className="text-sm text-gray-600">Active Today</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-purple-500 mb-2" />
            <p className="text-2xl font-bold">{engagement?.active_this_week || 0}</p>
            <p className="text-sm text-gray-600">Active This Week</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <Target className="w-8 h-8 mx-auto text-orange-500 mb-2" />
            <p className="text-2xl font-bold">{engagement?.avg_sessions_per_user?.toFixed(1) || '0.0'}</p>
            <p className="text-sm text-gray-600">Avg Sessions/User</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 text-center">
            <DollarSign className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
            <p className="text-2xl font-bold">{Math.round((engagement?.avg_session_duration || 0) / 60)}</p>
            <p className="text-sm text-gray-600">Avg Duration (min)</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="conversion">Conversion</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdminAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="conversion" className="space-y-6">
          <ConversionFunnelChart />
          
          {/* Real Revenue & Subscription Metrics */}
          <EnhancedSubscriptionAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <ChurnPredictionPanel />
          
          {/* Real Retention Cohorts */}
          <RetentionCohortChart monthsBack={6} />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {featureAnalytics?.map((feature) => (
                  <div key={feature.feature_name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium capitalize">{feature.feature_name.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-600">
                        {feature.unique_users} users • {feature.total_evaluations} evaluations
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={feature.adoption_rate > 50 ? 'default' : 'secondary'}>
                        {feature.adoption_rate}% adoption
                      </Badge>
                      <p className="text-xs text-gray-500 mt-1">
                        {feature.enabled_evaluations} enabled
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workouts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workout Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {workoutAnalytics?.slice(0, 10).map((workout, index) => (
                  <div key={workout.exercise_name} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{workout.exercise_name}</p>
                        <p className="text-sm text-gray-600">
                          {workout.total_attempts} attempts • {workout.avg_duration}s avg
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={workout.completion_rate > 80 ? 'default' : 'secondary'}>
                        {workout.completion_rate}% completion
                      </Badge>
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

export default EnhancedAdminAnalytics;
