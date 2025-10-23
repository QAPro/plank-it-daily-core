import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle, 
  FileText, 
  Info, 
  LogOut,
  ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/hooks/useAdmin';
import NewBottomNav from '@/components/navigation/NewBottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const [activeTab, setActiveTab] = useState('settings');

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    const routes: Record<string, string> = {
      home: '/',
      social: '/social',
      events: '/events',
      competition: '/competition',
      friends: '/friends',
      settings: '/settings'
    };
    if (routes[tabId]) {
      navigate(routes[tabId]);
    }
  };

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

  const MenuItem = ({ icon: Icon, label, onClick, color = "text-foreground" }: any) => (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-card hover:bg-accent/50 rounded-lg transition-colors border border-border"
    >
      <div className="flex items-center gap-3">
        <Icon className={`w-5 h-5 ${color}`} />
        <span className={`font-medium ${color}`}>{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your account and preferences</p>
        </motion.div>

        {/* Account & Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                Account & Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <MenuItem 
                icon={User} 
                label="Profile" 
                onClick={() => navigate('/settings/profile')} 
              />
              <MenuItem 
                icon={SettingsIcon} 
                label="App Settings" 
                onClick={() => navigate('/settings/app-settings')} 
              />
              <MenuItem 
                icon={CreditCard} 
                label="Subscription" 
                onClick={() => navigate('/settings/subscription')} 
              />
              <MenuItem 
                icon={Bell} 
                label="Notifications" 
                onClick={() => navigate('/settings/notifications')} 
              />
              <MenuItem 
                icon={Shield} 
                label="Privacy Settings" 
                onClick={() => navigate('/settings/privacy-settings')} 
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Admin Access - Only for admins */}
        {isAdmin && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-primary/50">
              <CardHeader>
                <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                  Admin Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <MenuItem 
                  icon={SettingsIcon} 
                  label="Admin Dashboard" 
                  onClick={() => navigate('/')} 
                  color="text-primary"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Support & Information Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wide">
                Support & Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <MenuItem 
                icon={HelpCircle} 
                label="Help & Support" 
                onClick={() => navigate('/settings/help-support')} 
              />
              <MenuItem 
                icon={FileText} 
                label="Legal" 
                onClick={() => navigate('/settings/legal')} 
              />
              <MenuItem 
                icon={Info} 
                label="About" 
                onClick={() => navigate('/settings/about')} 
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Sign Out Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-t-4 border-t-destructive">
            <CardContent className="pt-6">
              <Button
                onClick={handleSignOut}
                variant="destructive"
                className="w-full flex items-center gap-2"
                size="lg"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      
      <NewBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
    </div>
  );
};

export default Settings;
