

import { motion } from 'framer-motion';
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
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { handleAuthSignOut } from '@/utils/authCleanup';
import { useToast } from '@/hooks/use-toast';


interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { socialFeaturesEnabled, eventsEnabled, competitionEnabled, loading: flagsLoading } = useFeatureFlags();
  const { toast } = useToast();

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
  const tabs = allTabs.filter(tab => {
    if (tab.requiresCompetition && !competitionEnabled) return false;
    if (tab.requiresSocial && !socialFeaturesEnabled) return false;
    if (tab.requiresEvents && !eventsEnabled) return false;
    if (tab.requiresAdmin && !isAdmin) return false;
    return true;
  });

  // Show loading skeleton while flags are loading
  if (flagsLoading) {
    return (
      <div className="bg-white border-t border-gray-200 px-4 py-2">
        <div className="flex justify-around items-center max-w-screen-xl mx-auto">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex flex-col items-center space-y-1 px-2 py-1">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
              <div className="w-12 h-3 bg-gray-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border-t border-gray-200 px-4 py-2">
      <div className="flex justify-around items-center max-w-screen-xl mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors ${
                isActive 
                  ? 'text-orange-500 bg-orange-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`p-2 rounded-lg ${
                  isActive ? 'bg-orange-100' : 'hover:bg-gray-100'
                }`}
              >
                <Icon size={20} />
              </motion.div>
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
        
        {/* Sign Out Button */}
        <button
          onClick={onSignOut}
          className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-colors text-red-500 hover:text-red-700 hover:bg-red-50"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg hover:bg-red-100"
          >
            <LogOut size={20} />
          </motion.div>
          <span className="text-xs font-medium">Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default TabNavigation;
