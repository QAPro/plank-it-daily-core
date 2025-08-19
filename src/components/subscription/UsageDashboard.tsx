
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Timer, 
  Users, 
  Zap, 
  ArrowUp, 
  Crown, 
  TrendingUp, 
  Calendar,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, BarChart, Bar } from 'recharts';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { useSubscription } from '@/hooks/useSubscription';

type UsageItem = {
  feature: string;
  current: number;
  limit: number;
  unit: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  upgradeFeature?: string;
  trend: number; // percentage change from last period
  forecast: number; // predicted usage at end of period
};

const UsageDashboard = () => {
  const { tier } = useFeatureAccess();
  const { upgrade, plans } = useSubscription();
  const [viewPeriod, setViewPeriod] = useState<'daily' | 'weekly' | 'monthly'>('monthly');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock real-time usage data - in real app would come from analytics service
  const [usageData, setUsageData] = useState<UsageItem[]>([
    {
      feature: 'Workout Sessions',
      current: 8,
      limit: 10,
      unit: 'sessions',
      icon: Timer,
      color: 'text-blue-600',
      upgradeFeature: 'unlimited_workouts',
      trend: 12.5,
      forecast: 9.2
    },
    {
      feature: 'Advanced Stats',
      current: 0,
      limit: 0,
      unit: 'views',
      icon: BarChart3,
      color: 'text-purple-600',
      upgradeFeature: 'advanced_stats',
      trend: 0,
      forecast: 0
    },
    {
      feature: 'Social Challenges',
      current: 0,
      limit: 0,
      unit: 'challenges',
      icon: Users,
      color: 'text-green-600',
      upgradeFeature: 'social_challenges',
      trend: 0,
      forecast: 0
    },
    {
      feature: 'Smart Recommendations',
      current: 0,
      limit: 0,
      unit: 'recommendations',
      icon: Zap,
      color: 'text-orange-600',
      upgradeFeature: 'smart_recommendations',
      trend: 0,
      forecast: 0
    }
  ]);

  // Historical usage data for charts
  const historicalData = [
    { period: 'Week 1', workouts: 2, stats: 0, challenges: 0, recommendations: 0 },
    { period: 'Week 2', workouts: 3, stats: 0, challenges: 0, recommendations: 0 },
    { period: 'Week 3', workouts: 2, stats: 0, challenges: 0, recommendations: 0 },
    { period: 'Week 4', workouts: 1, stats: 0, challenges: 0, recommendations: 0 },
  ];

  // Auto-refresh usage data every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Simulate real-time updates
      setUsageData(prev => prev.map(item => ({
        ...item,
        // Randomly increment usage occasionally
        current: Math.random() > 0.8 ? Math.min(item.current + 1, item.limit || item.current + 1) : item.current
      })));
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const getUsageColor = (current: number, limit: number) => {
    if (limit === 0) return 'text-gray-400'; // Premium feature
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getProgressColor = (current: number, limit: number) => {
    if (limit === 0) return 'bg-gray-200'; // Premium feature
    const percentage = (current / limit) * 100;
    if (percentage >= 90) return 'bg-red-100';
    if (percentage >= 70) return 'bg-yellow-100';
    return 'bg-green-100';
  };

  const handleUpgrade = () => {
    const premiumPlan = plans.find(plan => 
      plan.name.toLowerCase().includes('premium') && 
      plan.name.toLowerCase().includes('monthly')
    );
    if (premiumPlan) {
      upgrade(premiumPlan);
    }
  };

  const exportUsageReport = () => {
    const data = usageData.map(item => ({
      Feature: item.feature,
      'Current Usage': item.current,
      'Limit': item.limit || 'Unlimited',
      'Unit': item.unit,
      'Trend': `${item.trend > 0 ? '+' : ''}${item.trend}%`,
      'Forecast': item.forecast
    }));
    
    const csvContent = [
      Object.keys(data[0]).join(','),
      ...data.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usage-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getDaysUntilLimit = (current: number, forecast: number, limit: number) => {
    if (limit === 0 || forecast <= current) return null;
    const dailyRate = (forecast - current) / 30; // Assuming monthly cycle
    const remainingUsage = limit - current;
    return Math.floor(remainingUsage / dailyRate);
  };

  if (tier !== 'free') {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Crown className="w-5 h-5 mr-2 text-purple-600" />
              Premium Account
            </CardTitle>
            <Badge className="bg-purple-600 text-white">
              {tier.charAt(0).toUpperCase() + tier.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Crown className="w-12 h-12 mx-auto text-purple-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Unlimited Access
            </h3>
            <p className="text-gray-600">
              You have full access to all premium features with no limits!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
                Usage Dashboard
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Real-time usage tracking with forecasting and limits
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
                className={autoRefresh ? 'bg-green-50 text-green-700' : ''}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
                {autoRefresh ? 'Live' : 'Refresh'}
              </Button>
              <Button variant="outline" size="sm" onClick={exportUsageReport}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Badge variant="outline" className="bg-white">
                Free Plan
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Usage Statistics Overview */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">80%</p>
                <p className="text-sm text-gray-600">Usage This Month</p>
              </div>
            </div>
            <div className="mt-2">
              <Progress value={80} className="h-2" />
              <p className="text-xs text-gray-500 mt-1">8 of 10 sessions used</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-600">+12.5%</p>
                <p className="text-sm text-gray-600">vs Last Month</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">Usage is increasing</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold text-orange-600">4</p>
                <p className="text-sm text-gray-600">Days to Limit</p>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">At current usage rate</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current">Current Usage</TabsTrigger>
          <TabsTrigger value="history">Usage History</TabsTrigger>
          <TabsTrigger value="forecast">Forecast</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {/* Current Usage Items */}
          <div className="grid md:grid-cols-2 gap-4">
            {usageData.map((item, index) => {
              const Icon = item.icon;
              const percentage = item.limit > 0 ? (item.current / item.limit) * 100 : 0;
              const isLimited = item.limit === 0;
              const isNearLimit = percentage >= 80 && !isLimited;
              const daysUntilLimit = getDaysUntilLimit(item.current, item.forecast, item.limit);

              return (
                <motion.div
                  key={item.feature}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className={`${
                    isLimited 
                      ? 'border-purple-200 bg-purple-50/30' 
                      : isNearLimit 
                        ? 'border-orange-200 bg-orange-50/30' 
                        : ''
                  }`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Icon className={`w-5 h-5 mr-2 ${item.color}`} />
                          <CardTitle className="text-base">{item.feature}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          {item.trend !== 0 && (
                            <Badge variant="outline" className={`text-xs ${
                              item.trend > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {item.trend > 0 ? '+' : ''}{item.trend}%
                            </Badge>
                          )}
                          {isLimited && (
                            <Badge className="bg-purple-600 text-white text-xs">
                              Premium
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {isLimited ? (
                        <div className="text-center py-4">
                          <Crown className="w-8 h-8 mx-auto text-purple-400 mb-2" />
                          <p className="text-sm text-gray-600 mb-2">
                            Upgrade to unlock this feature
                          </p>
                          <Button size="sm" onClick={handleUpgrade} className="w-full">
                            <ArrowUp className="w-3 h-3 mr-1" />
                            Upgrade Now
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Usage</span>
                            <span className={`font-medium ${getUsageColor(item.current, item.limit)}`}>
                              {item.current} / {item.limit} {item.unit}
                            </span>
                          </div>
                          <Progress 
                            value={percentage} 
                            className={`h-3 ${getProgressColor(item.current, item.limit)}`}
                          />
                          
                          {/* Forecast and Warnings */}
                          <div className="space-y-2 text-xs">
                            <div className="flex justify-between text-gray-500">
                              <span>Forecasted: {item.forecast} {item.unit}</span>
                              {daysUntilLimit && (
                                <span className="text-orange-600">
                                  ~{daysUntilLimit} days to limit
                                </span>
                              )}
                            </div>
                          </div>

                          {isNearLimit && (
                            <div className="flex items-center justify-between pt-2 border-t">
                              <div className="flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-orange-600" />
                                <p className="text-xs text-orange-600">
                                  Running low
                                </p>
                              </div>
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={handleUpgrade}
                                className="text-xs h-7"
                              >
                                Upgrade
                              </Button>
                            </div>
                          )}
                        </>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historicalData}>
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Area 
                      type="monotone" 
                      dataKey="workouts" 
                      stroke="#3b82f6" 
                      fill="#3b82f6" 
                      fillOpacity={0.1}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forecast" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Forecast</CardTitle>
              <p className="text-sm text-gray-600">
                Predictions based on your current usage patterns
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {usageData.filter(item => item.limit > 0).map((item) => {
                  const daysUntilLimit = getDaysUntilLimit(item.current, item.forecast, item.limit);
                  return (
                    <div key={item.feature} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <item.icon className={`w-5 h-5 ${item.color}`} />
                        <div>
                          <p className="font-medium">{item.feature}</p>
                          <p className="text-sm text-gray-500">
                            Forecast: {item.forecast} {item.unit} by month end
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        {daysUntilLimit ? (
                          <Badge variant="outline" className="text-orange-600 border-orange-200">
                            {daysUntilLimit} days to limit
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-green-600 border-green-200">
                            Within limits
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upgrade CTA */}
      <Card className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0">
        <CardContent className="p-6 text-center">
          <Crown className="w-12 h-12 mx-auto mb-4 text-yellow-300" />
          <h3 className="text-xl font-bold mb-2">Ready to Go Premium?</h3>
          <p className="mb-4 opacity-90">
            Unlock unlimited access to all features and remove usage limits
          </p>
          <Button 
            onClick={handleUpgrade}
            className="bg-white text-purple-600 hover:bg-gray-100"
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageDashboard;
