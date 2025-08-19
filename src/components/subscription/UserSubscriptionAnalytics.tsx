
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Target, 
  Award, 
  Clock, 
  Zap, 
  BarChart3, 
  Users, 
  Star,
  CheckCircle,
  ArrowUp
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { useSubscription } from '@/hooks/useSubscription';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import { formatPrice } from '@/utils/price';

const UserSubscriptionAnalytics = () => {
  const { active, plans } = useSubscription();
  const { tier } = useFeatureAccess();

  // Mock usage data - in real app would come from analytics
  const usageData = [
    { month: 'Jan', sessions: 12, features: 3, value: 89 },
    { month: 'Feb', sessions: 18, features: 5, value: 124 },
    { month: 'Mar', sessions: 25, features: 8, value: 189 },
    { month: 'Apr', sessions: 32, features: 12, value: 267 },
    { month: 'May', sessions: 28, features: 15, value: 298 },
    { month: 'Jun', sessions: 35, features: 18, value: 356 }
  ];

  const currentPlan = active ? plans.find(p => p.name === active.plan_name) : null;
  const monthlyValue = currentPlan ? currentPlan.price_cents / 100 : 0;
  const avgSessionsPerMonth = 28;
  const costPerSession = monthlyValue > 0 ? monthlyValue / avgSessionsPerMonth : 0;

  // Calculate ROI metrics
  const roiMetrics = useMemo(() => {
    const alternativeCostPerSession = 15; // Gym session cost
    const potentialSavings = (avgSessionsPerMonth * alternativeCostPerSession) - monthlyValue;
    const roiPercentage = monthlyValue > 0 ? ((potentialSavings / monthlyValue) * 100) : 0;
    
    return {
      costPerSession: costPerSession.toFixed(2),
      potentialSavings: potentialSavings.toFixed(0),
      roiPercentage: roiPercentage.toFixed(0),
      breakEvenSessions: monthlyValue > 0 ? Math.ceil(monthlyValue / alternativeCostPerSession) : 0
    };
  }, [monthlyValue, costPerSession, avgSessionsPerMonth]);

  // Feature usage efficiency
  const featureEfficiency = [
    { name: 'Workout Tracking', usage: 95, potential: 100, category: 'Core' },
    { name: 'Advanced Stats', usage: 78, potential: 100, category: 'Analytics' },
    { name: 'Social Challenges', usage: 45, potential: 90, category: 'Social' },
    { name: 'Smart Recommendations', usage: 62, potential: 85, category: 'AI' },
    { name: 'Custom Workouts', usage: 23, potential: 75, category: 'Premium' }
  ];

  // Upgrade recommendations
  const recommendations = [
    {
      title: 'Unlock Advanced Analytics',
      description: 'Get detailed insights into your progress and performance trends',
      icon: BarChart3,
      action: 'View Analytics Features',
      priority: 'high',
      savings: '$25/month vs personal trainer'
    },
    {
      title: 'Join Social Challenges', 
      description: 'Stay motivated with community-driven fitness challenges',
      icon: Users,
      action: 'Explore Challenges',
      priority: 'medium',
      savings: 'Boost motivation by 40%'
    },
    {
      title: 'Try Smart Recommendations',
      description: 'AI-powered workout suggestions based on your progress',
      icon: Zap,
      action: 'Enable Smart Features',
      priority: 'medium',
      savings: 'Optimize workout time'
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscription Analytics</h2>
        <p className="text-gray-600">Track your subscription value and optimize your fitness journey</p>
      </div>

      {/* ROI Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {roiMetrics.roiPercentage}%
                </p>
                <p className="text-sm text-gray-600">ROI vs Gym</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  ${roiMetrics.costPerSession}
                </p>
                <p className="text-sm text-gray-600">Per Session</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  ${roiMetrics.potentialSavings}
                </p>
                <p className="text-sm text-gray-600">Monthly Savings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {roiMetrics.breakEvenSessions}
                </p>
                <p className="text-sm text-gray-600">Break-even Point</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Usage & Value Trend</CardTitle>
          <CardDescription>
            Track how your subscription usage and value have grown over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={usageData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#3b82f6" 
                  fill="#3b82f6" 
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
                <Line type="monotone" dataKey="sessions" stroke="#10b981" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Feature Efficiency */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Usage Efficiency</CardTitle>
          <CardDescription>
            See how well you're utilizing available features and discover optimization opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {featureEfficiency.map((feature, index) => {
            const efficiency = (feature.usage / feature.potential) * 100;
            return (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{feature.name}</p>
                    <p className="text-sm text-gray-500">{feature.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{efficiency.toFixed(0)}% efficiency</p>
                    <p className="text-xs text-gray-500">{feature.usage}/{feature.potential} potential</p>
                  </div>
                </div>
                <Progress value={efficiency} className="h-2" />
              </motion.div>
            );
          })}
        </CardContent>
      </Card>

      {/* Personalized Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Upgrade Recommendations</CardTitle>
          <CardDescription>
            Personalized suggestions to maximize your subscription value
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {recommendations.map((rec, index) => {
            const Icon = rec.icon;
            return (
              <motion.div
                key={rec.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{rec.title}</h3>
                    <Badge variant="outline" className={getPriorityColor(rec.priority)}>
                      {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
                  <p className="text-sm font-medium text-green-600">{rec.savings}</p>
                </div>
                <Button variant="outline" size="sm">
                  {rec.action}
                </Button>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserSubscriptionAnalytics;
