
import { motion } from "framer-motion";
import { Settings, HelpCircle, LogOut, Shield, CreditCard, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AccountStats from "@/components/profile/AccountStats";
import PreferencesSettings from "@/components/profile/PreferencesSettings";
import AdminDashboard from "@/components/admin/AdminDashboard";
import SubscriptionPlansPage from "@/components/subscription/SubscriptionPlansPage";
import SubscriptionManagement from "@/components/subscription/SubscriptionManagement";
import { useAdmin } from "@/hooks/useAdmin";
import { useSubscription } from "@/hooks/useSubscription";

const ProfileTab = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const { active } = useSubscription();
  const [loading, setLoading] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);
  const [showSubscriptionPlans, setShowSubscriptionPlans] = useState(false);
  const [showSubscriptionManagement, setShowSubscriptionManagement] = useState(false);

  const menuItems = [
    { icon: Settings, label: "App Settings", description: "Notifications, privacy, and more" },
    { icon: HelpCircle, label: "Help & Support", description: "Get help and contact support" },
    { icon: Shield, label: "Privacy Policy", description: "Learn about your data protection" }
  ];

  // Add subscription option
  menuItems.unshift({
    icon: CreditCard,
    label: active ? "Manage Subscription" : "Subscription Plans",
    description: active ? "View and manage your current plan" : "Upgrade to unlock premium features"
  });

  // Add admin option if user is admin
  if (isAdmin) {
    menuItems.unshift({
      icon: Shield,
      label: "Admin Dashboard",
      description: "Manage app features and settings"
    });
  }

  const handleMenuClick = (label: string) => {
    if (label === "Admin Dashboard") {
      setShowAdminDashboard(true);
    } else if (label === "Subscription Plans") {
      setShowSubscriptionPlans(true);
    } else if (label === "Manage Subscription") {
      setShowSubscriptionManagement(true);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out successfully",
        description: "You've been logged out of your account.",
      });
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToProfile = () => {
    setShowAdminDashboard(false);
    setShowSubscriptionPlans(false);
    setShowSubscriptionManagement(false);
  };

  if (showAdminDashboard) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={handleBackToProfile}
          >
            ← Back to Profile
          </Button>
        </div>
        <AdminDashboard />
      </motion.div>
    );
  }

  if (showSubscriptionPlans) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-4">
          <Button 
            variant="outline" 
            onClick={handleBackToProfile}
          >
            ← Back to Profile
          </Button>
        </div>
        <SubscriptionPlansPage />
      </motion.div>
    );
  }

  if (showSubscriptionManagement) {
    return (
      <SubscriptionManagement onBack={handleBackToProfile} />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center pt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Profile</h2>
        <p className="text-gray-600">Manage your account and settings</p>
      </div>

      {/* Profile Header */}
      <ProfileHeader />

      {/* Account Statistics */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <AccountStats />
      </motion.div>

      {/* Preferences Settings */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <PreferencesSettings />
      </motion.div>

      {/* Menu Items */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-800">More Options</h3>
        {menuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 + index * 0.1, duration: 0.5 }}
          >
            <Card 
              className="bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleMenuClick(item.label)}
            >
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mr-4 ${
                    item.label === "Admin Dashboard" ? "bg-red-50" : 
                    item.label.includes("Subscription") ? "bg-blue-50" :
                    "bg-orange-50"
                  }`}>
                    <item.icon className={`w-5 h-5 ${
                      item.label === "Admin Dashboard" ? "text-red-500" : 
                      item.label.includes("Subscription") ? "text-blue-500" :
                      "text-orange-500"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.label}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                  {item.label.includes("Subscription") && active && (
                    <div className="ml-2">
                      <Crown className="w-4 h-4 text-blue-500" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Sign Out Button */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="pt-4"
      >
        <Button 
          onClick={handleSignOut}
          disabled={loading}
          variant="destructive"
          className="w-full bg-red-500 hover:bg-red-600 text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          {loading ? 'Signing out...' : 'Sign Out'}
        </Button>
      </motion.div>

      {/* App Info */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.6 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
          <CardContent className="p-4 text-center">
            <h4 className="font-bold text-lg text-gray-800 mb-1">PlankIt</h4>
            <p className="text-sm text-gray-600 mb-2">Version 1.0.0</p>
            <p className="text-xs text-gray-500">
              Build your core strength, one plank at a time
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProfileTab;
