
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import TabNavigation from './TabNavigation';
import MobileBottomNav from './MobileBottomNav';
import { useIsMobile } from '@/hooks/use-mobile';

import HomeTab from './tabs/HomeTab';
import EnhancedWorkoutTab from './tabs/EnhancedWorkoutTab';
import StatsTab from './tabs/StatsTab';
import AnalyticsTab from './tabs/AnalyticsTab';
import AchievementsTab from './tabs/AchievementsTab';
import ProgressTab from './tabs/ProgressTab';
import GatedCompeteTab from './tabs/GatedCompeteTab';
import FriendsTab from './tabs/FriendsTab';
import EventsTab from './tabs/EventsTab';
import ProfileTab from './tabs/ProfileTab';
import AdminDashboard from './admin/AdminDashboard';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedPushNotificationTest } from '@/components/EnhancedPushNotificationTest';
import { PushNotificationDebug } from '@/components/PushNotificationDebug';
import { VapidKeyManager } from '@/components/VapidKeyManager';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [profileView, setProfileView] = useState<'overview' | 'subscription-plans'>('overview');
  const [showVapidManager, setShowVapidManager] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<{exerciseId: string, duration: number} | null>(null);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Reset profile view when switching tabs
    if (tab !== 'profile') {
      setProfileView('overview');
    }
    // Clear selected workout when navigating away from home
    if (tab !== 'home') {
      setSelectedWorkout(null);
    }
  };

  const handleUpgradeNavigation = () => {
    setProfileView('subscription-plans');
    setActiveTab('profile');
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
        return <EnhancedWorkoutTab onStartWorkout={handleStartWorkout} selectedWorkout={selectedWorkout} />;
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
      case 'profile':
        return <ProfileTab initialView={profileView} onOpenVapidManager={() => setShowVapidManager(true)} />;
      default:
        return <HomeTab onTabChange={handleTabChange} onUpgradeClick={handleUpgradeNavigation} onStartWorkout={handleStartWorkout} selectedWorkout={selectedWorkout} onWorkoutStarted={handleWorkoutStarted} />;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      {/* Debug Components - VAPID Key Manager for troubleshooting */}
      {showVapidManager && (
        <VapidKeyManager onClose={() => setShowVapidManager(false)} />
      )}
      
      <div className="flex flex-col h-screen">        
        {/* Main Content */}
        <div className={`flex-1 overflow-y-auto ${isMobile ? 'pb-28' : ''}`}>
          <div className="h-full">
            <AnimatePresence mode="wait">
              {renderTabContent()}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        {isMobile ? (
          <MobileBottomNav 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        ) : (
          <TabNavigation 
            activeTab={activeTab} 
            onTabChange={handleTabChange} 
          />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
