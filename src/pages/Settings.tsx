import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { 
  User, 
  Settings as SettingsIcon, 
  CreditCard, 
  Shield, 
  HelpCircle, 
  FileText, 
  Info, 
  LogOut,
  ChevronRight,
  Moon,
  Sun,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { handleAuthSignOut } from '@/utils/authCleanup';
import { useAdmin } from '@/hooks/useAdmin';
import { useTheme } from '@/components/theme-provider';
import NewBottomNav from '@/components/navigation/NewBottomNav';

const Settings = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { isAdmin } = useAdmin();
  const { theme, setTheme } = useTheme();
  const fromTab = location.state?.fromTab || 'home';
  const [activeTab, setActiveTab] = useState(fromTab);

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

  const handleBack = () => {
    navigate('/', { state: { activeTab: fromTab } });
  };

  const handleSignOut = async () => {
    try {
      await handleAuthSignOut();
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
      className="group w-full flex items-center justify-between p-4 bg-card rounded-xl transition-all duration-300 ease-out border border-border hover:border-primary/20 shadow-soft hover:shadow-medium hover:-translate-y-0.5 active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/10 to-gold/10 flex items-center justify-center group-hover:from-primary/20 group-hover:to-gold/20 transition-all duration-300">
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <span className={`font-medium ${color}`}>{label}</span>
      </div>
      <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20">
      <div className="max-w-2xl mx-auto p-6 space-y-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 pt-4 mb-8"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Manage your account and preferences</p>
          </div>
        </motion.div>

        {/* Account & Preferences Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-soft">
            <CardHeader>
              <CardTitle className="text-xs text-muted-foreground/70 uppercase tracking-wider font-semibold">
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
                icon={Shield} 
                label="Privacy Settings" 
                onClick={() => navigate('/settings/privacy-settings')} 
              />
              
              {/* Dark Mode Toggle */}
              <div className="group flex items-center justify-between p-4 bg-card rounded-xl border border-border shadow-soft hover:shadow-medium transition-all duration-300">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gold/20 to-primary/20 flex items-center justify-center transition-all duration-300">
                    {theme === 'dark' ? (
                      <Moon className="w-5 h-5 text-foreground" />
                    ) : (
                      <Sun className="w-5 h-5 text-gold" />
                    )}
                  </div>
                  <Label htmlFor="dark-mode" className="font-medium cursor-pointer">
                    Dark Mode
                  </Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
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
            <Card className="border-0 bg-gradient-to-br from-primary/5 to-gold/5 shadow-glow">
              <CardHeader>
                <CardTitle className="text-xs text-primary uppercase tracking-wider font-semibold">
                  Admin Access
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
              <MenuItem 
                icon={SettingsIcon} 
                label="Admin Dashboard" 
                onClick={() => navigate('/', { state: { activeTab: 'admin' } })} 
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
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-soft">
            <CardHeader>
              <CardTitle className="text-xs text-muted-foreground/70 uppercase tracking-wider font-semibold">
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
          <Card className="border-0 bg-card/80 backdrop-blur-sm shadow-soft">
            <CardContent className="pt-6">
              <Button
                onClick={handleSignOut}
                variant="outline"
                className="w-full flex items-center justify-center gap-2 h-12 border-2 border-border hover:border-primary/30 hover:bg-primary/5 text-foreground hover:text-primary transition-all duration-300"
                size="lg"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Sign Out</span>
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
