import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Settings, 
  BarChart3, 
  Flag,
  Beaker,
  Shield
} from 'lucide-react';
import UserManagement from './UserManagement';
import FeatureFlagsManager from './FeatureFlagsManager';
import FeatureAnalyticsDashboard from './FeatureAnalyticsDashboard';
import EnhancedAdminAnalytics from './analytics/EnhancedAdminAnalytics';
import ABTestingDashboard from './analytics/ABTestingDashboard';
import NotificationAnalyticsDashboard from './analytics/NotificationAnalyticsDashboard';
import RoleManagementDashboard from './roles/RoleManagementDashboard';
import { useAdmin } from '@/hooks/useAdmin';

const AdminDashboard = () => {
  const { isAdmin, loading } = useAdmin();

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>;
  }

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You need admin privileges to access this dashboard.</p>
        </div>
      </div>
    );
  }

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
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="features" className="flex items-center gap-2">
            <Flag className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="experiments" className="flex items-center gap-2">
            <Beaker className="w-4 h-4" />
            A/B Tests
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

        <TabsContent value="roles" className="space-y-6">
          <RoleManagementDashboard />
        </TabsContent>

        <TabsContent value="features" className="space-y-6">
          <FeatureFlagsManager />
          <div className="mt-8">
            <FeatureAnalyticsDashboard />
          </div>
        </TabsContent>

        <TabsContent value="experiments" className="space-y-6">
          <ABTestingDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
