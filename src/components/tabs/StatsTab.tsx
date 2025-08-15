
import { motion } from "framer-motion";
import StatsDashboard from "@/components/StatsDashboard";
import SessionHistory from "@/components/SessionHistory";
import AdvancedAnalyticsDashboard from "@/components/analytics/AdvancedAnalyticsDashboard";
import FeatureGuard from "@/components/access/FeatureGuard";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Crown, TrendingUp } from "lucide-react";

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
      <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span>Progress predictions</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span>Comparative benchmarks</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
          <span>Advanced visualizations</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-orange-500" />
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
        <p className="text-gray-600">Track your plank journey</p>
      </div>

      {/* Basic Statistics Dashboard */}
      <StatsDashboard />

      {/* Advanced Analytics - Premium Feature */}
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
          className="border-t pt-6"
        >
          <AdvancedAnalyticsDashboard />
        </motion.div>
      </FeatureGuard>

      {/* Session History */}
      <SessionHistory />
    </motion.div>
  );
};

export default StatsTab;
