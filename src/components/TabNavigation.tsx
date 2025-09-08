
import React from 'react';
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
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAdmin } from '@/hooks/useAdmin';
import { isSocialEnabled } from '@/constants/featureGating';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ activeTab, onTabChange }) => {
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const socialEnabled = isSocialEnabled();

  const allTabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'analytics', label: 'Analytics', icon: Zap },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'investment', label: 'Progress', icon: TrendingUp },
    { id: 'compete', label: 'Compete', icon: Users, requiresSocial: true },
    { id: 'friends', label: 'Friends', icon: Users, requiresSocial: true },
    { id: 'events', label: 'Events', icon: Calendar, requiresSocial: true },
    { id: 'admin', label: 'Admin', icon: Settings, requiresAdmin: true },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  // Filter out social tabs when social features are disabled
  // Filter out admin tab when user is not admin
  const tabs = allTabs.filter(tab => {
    if (tab.requiresSocial && !socialEnabled) return false;
    if (tab.requiresAdmin && !isAdmin) return false;
    return true;
  });

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
      </div>
    </div>
  );
};

export default TabNavigation;
