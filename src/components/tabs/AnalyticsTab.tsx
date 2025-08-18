
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Crown, BarChart3, Target, Brain, TrendingUp } from 'lucide-react';
import UserAnalyticsDashboard from '@/components/analytics/UserAnalyticsDashboard';
import GoalTrackingDashboard from '@/components/analytics/GoalTrackingDashboard';
import SmartRecommendationsPanel from '@/components/analytics/SmartRecommendationsPanel';
import FeatureGuard from '@/components/access/FeatureGuard';

const PremiumUpgradePrompt = () => (
  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
    <CardContent className="p-6 text-center">
      <Crown className="w-12 h-12 mx-auto text-orange-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Unlock Premium Analytics
      </h3>
      <p className="text-gray-600 mb-4">
        Get AI-powered insights, detailed performance tracking, and advanced goal setting.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-orange-500" />
          <span>AI recommendations</span>
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
          <span>Performance insights</span>
        </div>
      </div>
      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
        Upgrade to Premium
      </Button>
    </CardContent>
  </Card>
);

const AnalyticsTab = () => {
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <FeatureGuard 
            feature="analytics_dashboard"
            fallback={<PremiumUpgradePrompt />}
          >
            <UserAnalyticsDashboard />
          </FeatureGuard>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <FeatureGuard 
            feature="detailed_performance_tracking"
            fallback={<PremiumUpgradePrompt />}
          >
            <UserAnalyticsDashboard />
          </FeatureGuard>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <FeatureGuard 
            feature="goal_tracking"
            fallback={<PremiumUpgradePrompt />}
          >
            <GoalTrackingDashboard />
          </FeatureGuard>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <FeatureGuard 
            feature="ai_recommendations"
            fallback={<PremiumUpgradePrompt />}
          >
            <SmartRecommendationsPanel />
          </FeatureGuard>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default AnalyticsTab;
