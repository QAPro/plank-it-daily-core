
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import TabNavigation from './TabNavigation';
import HomeTab from './tabs/HomeTab';
import WorkoutTab from './tabs/WorkoutTab';
import StatsTab from './tabs/StatsTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import AchievementsTab from './tabs/AchievementsTab';
import CompeteTab from './tabs/CompeteTab';
import FriendsTab from './tabs/FriendsTab';
import EventsTab from './tabs/EventsTab';
import ProfileTab from './tabs/ProfileTab';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const { user } = useAuth();

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return <HomeTab />;
      case 'workout':
        return <WorkoutTab />;
      case 'stats':
        return <StatsTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'achievements':
        return <AchievementsTab />;
      case 'compete':
        return <CompeteTab />;
      case 'friends':
        return <FriendsTab />;
      case 'events':
        return <EventsTab />;
      case 'profile':
        return <ProfileTab />;
      default:
        return <HomeTab />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="flex flex-col h-screen">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {renderTabContent()}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation */}
        <TabNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
      </div>
    </div>
  );
};

export default Dashboard;
