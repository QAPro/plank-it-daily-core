import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Heart, Download, Award, Users } from 'lucide-react';
import ProgressDashboard from '@/components/progress/ProgressDashboard';
import ProgressCelebrationDashboard from '@/components/progress/ProgressCelebrationDashboard';
import DataPortabilityHelper from '@/components/data/DataPortabilityHelper';
import CommunityValueDashboard from '@/components/community/CommunityValueDashboard';
import SeasonalRewards from '@/components/seasonal/SeasonalRewards';
import StatsDashboard from '@/components/StatsDashboard';

const ProgressTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('celebration');

  return (
    <motion.div
      key="progress"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-6"
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Your Fitness Progress</h1>
          <p className="text-muted-foreground">
            Celebrate your achievements, track your growth, and connect with your fitness community
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="celebration" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Progress</span>
            </TabsTrigger>
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Community</span>
            </TabsTrigger>
            <TabsTrigger value="data" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Your Data</span>
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Challenges</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="celebration" className="space-y-6">
            <ProgressCelebrationDashboard />
          </TabsContent>

        <TabsContent value="overview" className="space-y-6">
          <StatsDashboard />
        </TabsContent>

          <TabsContent value="community" className="space-y-6">
            <CommunityValueDashboard />
          </TabsContent>

          <TabsContent value="data" className="space-y-6">
            <DataPortabilityHelper />
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-6">
            <SeasonalRewards />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default ProgressTab;