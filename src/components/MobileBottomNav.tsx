import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Home, 
  Dumbbell, 
  BarChart3, 
  Trophy, 
  Users, 
  User,
  Calendar,
  Zap,
  Settings,
  TrendingUp,
  MoreHorizontal,
  X,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { handleAuthSignOut } from '@/utils/authCleanup';
import { useToast } from '@/hooks/use-toast';


interface MobileBottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const MobileBottomNav: React.FC<MobileBottomNavProps> = ({ activeTab, onTabChange }) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { socialFeaturesEnabled, eventsEnabled, competitionEnabled, loading: flagsLoading } = useFeatureFlags();
  const { toast } = useToast();

  const allTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: Zap },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'progress', label: 'Progress', icon: TrendingUp },
    { id: 'compete', label: 'Compete', icon: Users, requiresCompetition: true },
    { id: 'friends', label: 'Friends', icon: Users, requiresSocial: true },
    { id: 'events', label: 'Events', icon: Calendar, requiresEvents: true },
    { id: 'admin', label: 'Admin', icon: Settings, requiresAdmin: true },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Filter tabs based on dynamic feature flags
  const filteredTabs = allTabs.filter(tab => {
    if (tab.requiresCompetition && !competitionEnabled) return false;
    if (tab.requiresSocial && !socialFeaturesEnabled) return false;
    if (tab.requiresEvents && !eventsEnabled) return false;
    if (tab.requiresAdmin && !isAdmin) return false;
    return true;
  });

  const mainTabs = filteredTabs.slice(0, 4);
  const moreTabs = filteredTabs.slice(4);

  const handleTabClick = (tabId: string) => {
    onTabChange(tabId);
    setShowMoreMenu(false);
  };

  const onSignOut = async () => {
    try {
      await handleAuthSignOut();
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Sign out failed",
        description: "There was an error signing you out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const NavButton = ({ tab, isCompact = false }: { tab: any; isCompact?: boolean }) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    
    return (
      <button
        onClick={() => handleTabClick(tab.id)}
        className={`flex flex-col items-center justify-center transition-colors ${
          isCompact ? 'p-3' : 'py-2 px-1'
        } ${
          isActive 
            ? 'text-primary' 
            : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`${isCompact ? 'p-2' : 'p-1'} rounded-lg ${
            isActive ? 'bg-primary/10' : ''
          }`}
        >
          <Icon size={isCompact ? 22 : 20} />
        </motion.div>
        <span className={`font-medium ${isCompact ? 'text-sm mt-1' : 'text-xs mt-0.5'}`}>
          {tab.label}
        </span>
      </button>
    );
  };

  return (
    <>
      {/* Overlay for more menu */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-40"
            onClick={() => setShowMoreMenu(false)}
          />
        )}
      </AnimatePresence>

      {/* More menu */}
      <AnimatePresence>
        {showMoreMenu && (
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-20 left-4 right-4 bg-card border border-border rounded-xl shadow-lg z-50 p-4"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-card-foreground">More Options</h3>
              <button
                onClick={() => setShowMoreMenu(false)}
                className="p-1 hover:bg-muted rounded-lg"
              >
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {moreTabs.map((tab) => (
                <NavButton key={tab.id} tab={tab} isCompact />
              ))}
              {/* Sign Out Button */}
              <button
                onClick={onSignOut}
                className="flex flex-col items-center justify-center py-3 px-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={20} />
                <span className="text-xs mt-1 font-medium">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom navigation bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-30 pb-safe">
        <div className="flex items-center justify-around px-2 py-1 max-w-screen-xl mx-auto">
          {mainTabs.map((tab) => (
            <NavButton key={tab.id} tab={tab} />
          ))}
          
          {/* More button */}
          {moreTabs.length > 0 && (
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className={`flex flex-col items-center justify-center py-2 px-1 transition-colors ${
                showMoreMenu || moreTabs.some(tab => tab.id === activeTab)
                  ? 'text-primary' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-1 rounded-lg ${
                  showMoreMenu || moreTabs.some(tab => tab.id === activeTab) ? 'bg-primary/10' : ''
                }`}
              >
                <MoreHorizontal size={20} />
              </motion.div>
              <span className="text-xs mt-0.5 font-medium">More</span>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default MobileBottomNav;