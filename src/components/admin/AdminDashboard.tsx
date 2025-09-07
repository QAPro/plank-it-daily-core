
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Flag,
  Beaker,
  TrendingUp
} from 'lucide-react';
import UserManagement from './UserManagement';
import FeatureFlagsManager from './FeatureFlagsManager';
import EnhancedAdminAnalytics from './analytics/EnhancedAdminAnalytics';
import ABTestingDashboard from './analytics/ABTestingDashboard';
import NotificationAnalyticsDashboard from './analytics/NotificationAnalyticsDashboard';

const AdminDashboard = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage users, features, and analyze platform performance</p>
      </div>

      <Tabs defaultValue="analytics" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="experiments" className="flex items-center gap-2">
            <Beaker className="w-4 h-4" />
            A/B Tests
          </TabsTrigger>
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="space-y-6">
          <EnhancedAdminAnalytics />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <FeatureFlagsManager />
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <ABTestingDashboard />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">Growth Opportunities</h3>
                  <div className="space-y-2 text-sm text-blue-700">
                    <div>• Onboarding completion rate can be improved by 15%</div>
                    <div>• Premium conversion increases with goal-setting features</div>
                    <div>• Social features drive 2x higher retention</div>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">Success Metrics</h3>
                  <div className="space-y-2 text-sm text-green-700">
                    <div>• 82% user satisfaction with current features</div>
                    <div>• Average session duration increased 23%</div>
                    <div>• Weekly active users up 31% this month</div>
                  </div>
                </div>
                
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-800 mb-2">Action Items</h3>
                  <div className="space-y-2 text-sm text-orange-700">
                    <div>• Implement progressive onboarding flow</div>
                    <div>• A/B test premium upgrade prompts</div>
                    <div>• Expand social sharing capabilities</div>
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-800 mb-2">User Feedback Trends</h3>
                  <div className="space-y-2 text-sm text-purple-700">
                    <div>• Users want more exercise variety</div>
                    <div>• Mobile experience highly rated</div>
                    <div>• AI recommendations are popular feature</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
