import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, AlertTriangle, Download, Award, TrendingUp } from 'lucide-react';
import InvestmentDashboard from '@/components/investment/InvestmentDashboard';
import InvestmentProtectionDashboard from '@/components/investment/InvestmentProtectionDashboard';
import AbandonmentCostCalculator from '@/components/investment/AbandonmentCostCalculator';
import DataExportComplexity from '@/components/investment/DataExportComplexity';
import SeasonalRewards from '@/components/investment/SeasonalRewards';

const InvestmentTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <motion.div
      key="investment"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="p-4 space-y-6"
    >
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Investment Protection System</h1>
          <p className="text-muted-foreground">
            Monitor your accumulated investment value and understand the cost of platform abandonment
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="protection" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Protection</span>
            </TabsTrigger>
            <TabsTrigger value="abandonment" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              <span className="hidden sm:inline">Cost Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Data Export</span>
            </TabsTrigger>
            <TabsTrigger value="seasonal" className="flex items-center gap-2">
              <Award className="w-4 h-4" />
              <span className="hidden sm:inline">Seasonal</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <InvestmentDashboard />
          </TabsContent>

          <TabsContent value="protection" className="space-y-6">
            <InvestmentProtectionDashboard />
          </TabsContent>

          <TabsContent value="abandonment" className="space-y-6">
            <AbandonmentCostCalculator />
          </TabsContent>

          <TabsContent value="export" className="space-y-6">
            <DataExportComplexity />
          </TabsContent>

          <TabsContent value="seasonal" className="space-y-6">
            <SeasonalRewards />
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default InvestmentTab;