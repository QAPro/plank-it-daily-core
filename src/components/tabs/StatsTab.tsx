
import { motion } from "framer-motion";
import StatsDashboard from "@/components/StatsDashboard";
import SessionHistory from "@/components/SessionHistory";
import AdvancedAnalyticsDashboard from "@/components/analytics/AdvancedAnalyticsDashboard";
import PersonalSatisfactionDashboard from "@/components/analytics/PersonalSatisfactionDashboard";
import FeatureGuard from "@/components/access/FeatureGuard";
import AIFeatureGuard from "@/components/access/AIFeatureGuard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp, BarChart3, Activity, Eye } from "lucide-react";

const PremiumUpgradePrompt = () => (
  <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
    <CardContent className="p-6 text-center">
      <Crown className="w-12 h-12 mx-auto text-orange-500 mb-4" />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">
        Unlock Advanced Analytics
      </h3>
      <p className="text-gray-600 mb-4">
        Get detailed insights, progress predictions, and personalized recommendations with Premium.
      </p>
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm justify-items-center">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span>Progress predictions</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-orange-500" />
          <span>Comparative benchmarks</span>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-orange-500" />
          <span>Advanced visualizations</span>
        </div>
        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-orange-500" />
          <span>Personalized insights</span>
        </div>
      </div>
      <Button className="bg-orange-500 hover:bg-orange-600 text-white">
        Upgrade to Premium
      </Button>
    </CardContent>
  </Card>
);

const StatsTab = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center pt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Progress</h2>
        <p className="text-gray-600">Track your plank journey and transformation</p>
      </div>

      {/* Statistics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Basic Statistics Dashboard */}
          <StatsDashboard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Advanced Analytics - Premium Feature (Only show if AI is enabled) */}
          <AIFeatureGuard>
            <FeatureGuard 
              feature="advanced_stats"
              fallback={
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.5 }}
                >
                  <PremiumUpgradePrompt />
                </motion.div>
              }
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <AdvancedAnalyticsDashboard />
              </motion.div>
            </FeatureGuard>
          </AIFeatureGuard>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          {/* Personal Satisfaction Dashboard - Phase 4 */}
          <PersonalSatisfactionDashboard />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {/* Session History */}
          <SessionHistory />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default StatsTab;
