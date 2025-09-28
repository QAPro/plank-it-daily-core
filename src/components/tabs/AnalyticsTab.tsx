
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, BarChart3, Target, Activity, TrendingUp } from 'lucide-react';
import UserAnalyticsDashboard from '@/components/analytics/UserAnalyticsDashboard';
import BasicPerformanceDashboard from '@/components/analytics/BasicPerformanceDashboard';
import CondensedPerformanceDashboard from '@/components/analytics/CondensedPerformanceDashboard';
import GoalTrackingDashboard from '@/components/analytics/GoalTrackingDashboard';
import FeatureGuard from '@/components/access/FeatureGuard';
import AIFeatureGuard from '@/components/access/AIFeatureGuard';
import { isAIEnabled } from '@/constants/featureGating';

const PremiumUpgradePrompt = () => (
  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
    <CardContent className="p-6 text-center">
      <Crown className="w-12 h-12 mx-auto text-orange-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Unlock Premium Analytics
      </h3>
      <p className="text-gray-600 mb-4">
        Get insights, detailed performance tracking, and advanced goal setting.
      </p>
      <div className="flex flex-wrap justify-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-500" />
          <span>Workout insights</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-orange-500" />
          <span>Advanced analytics</span>
        </div>
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-orange-500" />
          <span>Goal tracking</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span>Performance Metrics</span>
        </div>
      </div>
      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
        Upgrade to Premium
      </Button>
    </CardContent>
  </Card>
);

const AnalyticsTab = () => {
  const aiEnabled = isAIEnabled();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center pt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Analytics & Insights</h2>
        <p className="text-gray-600">Track your progress and get personalized recommendations</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
        </TabsList>

        {/* Overview Tab - High-level summary with condensed dashboard */}
        <TabsContent value="overview" className="space-y-6">
          {aiEnabled ? (
            <AIFeatureGuard fallback={null}>
              <FeatureGuard 
                feature="advanced_stats"
                fallback={<CondensedPerformanceDashboard />}
              >
                <UserAnalyticsDashboard />
              </FeatureGuard>
            </AIFeatureGuard>
          ) : (
            <CondensedPerformanceDashboard />
          )}
        </TabsContent>

        {/* Performance Tab - Detailed analytics and trends with full dashboard */}
        <TabsContent value="performance" className="space-y-6">
          {aiEnabled ? (
            <AIFeatureGuard fallback={null}>
              <FeatureGuard 
                feature="advanced_stats"
                fallback={<BasicPerformanceDashboard />}
              >
                <UserAnalyticsDashboard />
              </FeatureGuard>
            </AIFeatureGuard>
          ) : (
            <BasicPerformanceDashboard />
          )}
        </TabsContent>

        {/* Goals Tab - Goal setting and tracking */}
        <TabsContent value="goals" className="space-y-6">
          {aiEnabled ? (
            <AIFeatureGuard fallback={null}>
              <FeatureGuard 
                feature="advanced_stats"
                fallback={<PremiumUpgradePrompt />}
              >
                <GoalTrackingDashboard />
              </FeatureGuard>
            </AIFeatureGuard>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <Target className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Goal Setting</h3>
                <p className="text-gray-600">Set personal workout goals and track your progress. Upgrade to Premium for advanced goal tracking with AI-powered insights and automated progress monitoring.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AnalyticsTab;
