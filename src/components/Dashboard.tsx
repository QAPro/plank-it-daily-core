
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import NewBottomNav from './navigation/NewBottomNav';
import DashboardHeader from './navigation/DashboardHeader';
import { useIsMobile } from '@/hooks/use-mobile';

import HomeTab from './tabs/HomeTab';
import WorkoutTab from './tabs/WorkoutTab';
import StatsTab from './tabs/StatsTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import AchievementsTab from './tabs/AchievementsTab';
import ProgressTab from './tabs/ProgressTab';
import GatedCompeteTab from './tabs/GatedCompeteTab';
import FriendsTab from './tabs/FriendsTab';
import EventsTab from './tabs/EventsTab';
import AdminDashboard from './admin/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedPushNotificationTest } from '@/components/EnhancedPushNotificationTest';
import { PushNotificationDebug } from '@/components/PushNotificationDebug';
import { VapidKeyManager } from '@/components/VapidKeyManager';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'home');
  const [selectedWorkout, setSelectedWorkout] = useState<{exerciseId: string, duration: number} | null>(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleUpgradeNavigation = () => {
    navigate('/settings/subscription');
  };

  const handleStartWorkout = (exerciseId: string, duration: number) => {
    // Navigate to home tab with selected exercise and duration
    setSelectedWorkout({ exerciseId, duration });
    setActiveTab('home');
  };

  const handleWorkoutStarted = () => {
    // Clear the selected workout after it's been processed
    setSelectedWorkout(null);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab onTabChange={handleTabChange} onUpgradeClick={handleUpgradeNavigation} onStartWorkout={handleStartWorkout} selectedWorkout={selectedWorkout} onWorkoutStarted={handleWorkoutStarted} />;
      case 'workout':
        return <WorkoutTab onStartWorkout={handleStartWorkout} />;
      case 'stats':
        return <StatsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'achievements':
        return <AchievementsTab />;
      case 'progress':
        return <ProgressTab />;
      case 'compete':
        return <GatedCompeteTab />;
      case 'friends':
        return <FriendsTab />;
      case 'events':
        return <EventsTab />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <HomeTab onTabChange={handleTabChange} onUpgradeClick={handleUpgradeNavigation} onStartWorkout={handleStartWorkout} selectedWorkout={selectedWorkout} onWorkoutStarted={handleWorkoutStarted} />;
    }
  };

  if (!user) {
    return null;
  }

  console.log('[Dashboard] Rendering Dashboard for user:', user?.email);

  return (
    <div className="h-screen bg-gradient-to-b from-[#FFF9F5] to-[#FFFCFA]">
      {/* Header */}
      <DashboardHeader activeTab={activeTab} />
      
      <div className="flex flex-col h-screen">        
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto pt-16 pb-28">
          <div className="h-full">
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <NewBottomNav activeTab={activeTab} onTabChange={handleTabChange} />
      </div>
    </div>
  );
};

export default Dashboard;
