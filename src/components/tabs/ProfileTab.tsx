
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Settings, CreditCard, LogOut, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import ProfileHeader from '@/components/profile/ProfileHeader';
import AccountStats from '@/components/profile/AccountStats';
import PreferencesSettings from '@/components/profile/PreferencesSettings';
import SubscriptionManagement from '@/components/subscription/SubscriptionManagement';
import SubscriptionPlansPage from '@/components/subscription/SubscriptionPlansPage';
import { PushNotificationManager } from '@/components/notifications/PushNotificationManager';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { PushNotificationDebugger } from '@/components/debug/PushNotificationDebugger';
import RichNotificationTester from '@/components/debug/RichNotificationTester';
import StatusTracksDashboard from '@/components/status/StatusTracksDashboard';

interface ProfileTabProps {
  initialView?: 'overview' | 'subscription-plans';
  onOpenVapidManager?: () => void;
}

const ProfileTab = ({ initialView = 'overview', onOpenVapidManager }: ProfileTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

  // Set initial tab based on prop
  useEffect(() => {
    if (initialView === 'subscription-plans') {
      setActiveTab('subscription');
    }
  }, [initialView]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "See you next time!"
      });
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error signing out",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleBackToManagement = () => {
    // Switch back to regular subscription management view
    setActiveTab('subscription');
  };

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      <ProfileHeader />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="status" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Status
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" />
            Subscription
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AccountStats />
        </TabsContent>

        <TabsContent value="status" className="space-y-6">
          <StatusTracksDashboard />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          {/* Show subscription plans if this was triggered by upgrade button */}
          {initialView === 'subscription-plans' ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Subscription Plans</h2>
                <Button 
                  variant="outline" 
                  onClick={handleBackToManagement}
                  className="text-sm"
                >
                  Back to Management
                </Button>
              </div>
              <SubscriptionPlansPage />
            </div>
          ) : (
            <SubscriptionManagement onBack={handleBackToManagement} />
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <PreferencesSettings />
          
          
          
          {/* Push Notification Management */}
          <PushNotificationManager />

          {/* Rich Notification Testing - Dev Only */}
          {process.env.NODE_ENV === 'development' && (
            <RichNotificationTester />
          )}
          <NotificationPreferences />
          
          {/* Sign Out Section */}
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Account Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default ProfileTab;
