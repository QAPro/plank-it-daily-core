
import { motion } from "framer-motion";
import { User, Settings, HelpCircle, LogOut, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfileTab = () => {
  const menuItems = [
    { icon: User, label: "Account Settings", description: "Manage your profile and preferences" },
    { icon: Settings, label: "App Settings", description: "Notifications, privacy, and more" },
    { icon: HelpCircle, label: "Help & Support", description: "Get help and contact support" },
    { icon: Shield, label: "Privacy Policy", description: "Learn about your data protection" }
  ];

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
            <h3 className="text-xl font-bold mb-1">Guest User</h3>
            <p className="text-orange-100 mb-4">Ready to start your plank journey?</p>
            <Button className="bg-white text-orange-500 hover:bg-orange-50 font-semibold py-2 px-6 rounded-lg">
              Sign In / Sign Up
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
