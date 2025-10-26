
import { motion } from "framer-motion";
import StatsDashboard from "@/components/tabs/stats/StatsDashboard";
import SessionHistory from "@/components/SessionHistory";
import DeepDiveAnalytics from "@/components/tabs/stats/DeepDiveAnalytics";
import FeatureGuard from "@/components/access/FeatureGuard";
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
      className="min-h-screen bg-[#E8D4C4] p-4 pb-32"
    >
      {/* Header */}
      <div className="text-center pt-6 pb-4">
        <h2 className="text-2xl font-bold text-[#2C3E50] mb-1">Your Progress</h2>
        <p className="text-[#7F8C8D] text-sm">Track your plank journey and transformation</p>
      </div>

      {/* Statistics Tabs */}
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="bg-white rounded-full p-1 mx-auto max-w-md grid grid-cols-3 shadow-soft">
          <TabsTrigger 
            value="dashboard"
            className="rounded-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] data-[state=active]:rounded-b-none"
          >
            Dashboard
          </TabsTrigger>
          <TabsTrigger 
            value="deepdive"
            className="rounded-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] data-[state=active]:rounded-b-none"
          >
            Deep Dive
          </TabsTrigger>
          <TabsTrigger 
            value="history"
            className="rounded-full data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-[#FF6B35] data-[state=active]:rounded-b-none"
          >
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <StatsDashboard />
        </TabsContent>

        <TabsContent value="deepdive" className="space-y-6">
          <FeatureGuard 
            feature="advanced_stats"
            fallback={<PremiumUpgradePrompt />}
          >
            <DeepDiveAnalytics />
          </FeatureGuard>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <SessionHistory />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default StatsTab;
