
import { motion } from "framer-motion";
import { User, Settings, HelpCircle, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

const ProfileTab = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    { icon: User, label: "Account Settings", description: "Manage your profile and preferences" },
    { icon: Settings, label: "App Settings", description: "Notifications, privacy, and more" },
    { icon: HelpCircle, label: "Help & Support", description: "Get help and contact support" },
    { icon: Shield, label: "Privacy Policy", description: "Learn about your data protection" }
  ];

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching user profile:', error);
      } else if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
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

  const getDisplayName = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name;
    }
    if (userProfile?.username) {
      return `@${userProfile.username}`;
    }
    return user?.email || 'User';
  };

  const getSubtitle = () => {
    if (userProfile?.username && userProfile?.full_name) {
      return `@${userProfile.username}`;
    }
    if (user?.email) {
      return user.email;
    }
    return 'Ready to start your plank journey?';
  };

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

      {/* User Info */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5 }}
      >
        <Card className="bg-gradient-to-br from-orange-500 to-amber-500 text-white border-0">
          <CardContent className="p-6 text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-1">{getDisplayName()}</h3>
            <p className="text-orange-100 mb-4">{getSubtitle()}</p>
            <Button 
              onClick={handleSignOut}
              disabled={loading}
              className="bg-white text-orange-500 hover:bg-orange-50 font-semibold py-2 px-6 rounded-lg"
            >
              {loading ? 'Signing out...' : 'Sign Out'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>

      {/* Menu Items */}
      <div className="space-y-3">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.label}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-orange-100 hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mr-4">
                    <item.icon className="w-5 h-5 text-orange-500" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-800">{item.label}</h4>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* App Info */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.6 }}
      >
        <Card className="bg-white/80 backdrop-blur-sm border-orange-100">
          <CardHeader>
            <CardTitle className="text-center text-lg">PlankIt</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
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
