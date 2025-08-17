
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import HomeTab from '@/components/tabs/HomeTab';
import WorkoutTab from '@/components/tabs/WorkoutTab';
import StatsTab from '@/components/tabs/StatsTab';
import AchievementsTab from '@/components/tabs/AchievementsTab';
import ProfileTab from '@/components/tabs/ProfileTab';
import FriendsTab from './tabs/FriendsTab';
import EventsTab from './tabs/EventsTab';
import CompeteTab from './tabs/CompeteTab';
import { Users, User, Lock, Calendar, Trophy as TrophyIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useLevelProgressionContext } from './level/LevelProgressionProvider';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import FeatureLockIndicator from './navigation/FeatureLockIndicator';

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState("home");
  
  const { isFeatureUnlocked, userLevel } = useLevelProgressionContext();
  const { flags } = useFeatureFlags();
  
  // Helper function to check if a feature is both unlocked by level AND enabled by feature flag
  const isFeatureAvailable = (featureName: string, levelRequirement: number) => {
    const levelUnlocked = (userLevel?.current_level || 0) >= levelRequirement;
    const featureUnlocked = isFeatureUnlocked(featureName);
    const featureFlag = flags.find(flag => flag.feature_name === featureName);
    const flagEnabled = featureFlag?.is_enabled !== false; // Default to true if flag doesn't exist
    
    return (levelUnlocked || featureUnlocked) && flagEnabled;
  };

  // Get reason why feature is locked with priority: Admin > Level
  const getFeatureLockReason = (featureName: string, levelRequirement: number) => {
    const featureFlag = flags.find(flag => flag.feature_name === featureName);
    const flagEnabled = featureFlag?.is_enabled !== false;
    const levelUnlocked = (userLevel?.current_level || 0) >= levelRequirement;
    
    // Admin disabled takes priority
    if (!flagEnabled) return { reason: 'Admin Disabled', type: 'admin' as const };
    if (!levelUnlocked) return { reason: `Level ${levelRequirement}`, type: 'level' as const };
    return { reason: 'Locked', type: 'unknown' as const };
  };

  const isFriendsAvailable = isFeatureAvailable('friends_system', 10);
  const isEventsAvailable = isFeatureAvailable('seasonal_events', 5);
  const isCompeteAvailable = isFeatureAvailable('competitive_features', 8);

  return (
    <div className="pb-20">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="sticky top-0 z-10 bg-white border-b">
          <TabsList className="grid w-full h-16 grid-cols-7">
            <TabsTrigger value="home" className="flex flex-col items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-home w-4 h-4 mb-1"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span className="text-xs">Home</span>
            </TabsTrigger>

            <TabsTrigger value="workout" className="flex flex-col items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flame w-4 h-4 mb-1"><path d="M8.5 14.5A2.5 2.5 0 0 0 6 12c0-2.2 4-6 7-6s6 3 6 5c0 1.5-1 1.5-2.5 3.5-1.5 2-2.5 2-2.5 3.5 0 1.5 1 1.5 2.5 3.5 1.5 2 2.5 2 2.5 3.5 0 1.5-1 1.5-2.5 3.5-1.5 2-2.5 2-2.5 3.5 0 1.5 1 1.5 2.5 3.5"/><path d="M15 5h-.5c-1.1 0-2-.9-2-2s.9-2 2-2H15"/></svg>
              <span className="text-xs">Workout</span>
            </TabsTrigger>

            <TabsTrigger value="stats" className="flex flex-col items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-bar-chart-3 w-4 h-4 mb-1"><path d="M3 3v18h18"/><path d="M7 15v6"/><path d="M11 6v15"/><path d="M15 10v11"/></svg>
              <span className="text-xs">Stats</span>
            </TabsTrigger>

            <TabsTrigger value="achievements" className="flex flex-col items-center justify-center h-full">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy w-4 h-4 mb-1"><circle cx="12" cy="8" r="5"/><path d="M5 3h14"/><path d="M10 21h4"/><path d="M6 3v7a6 6 0 0 0 12 0V3"/></svg>
              <span className="text-xs">Achievements</span>
            </TabsTrigger>

            {isEventsAvailable ? (
              <TabsTrigger value="events" className="flex flex-col items-center justify-center h-full">
                <Calendar className="w-4 h-4 mb-1" />
                <span className="text-xs">Events</span>
              </TabsTrigger>
            ) : (
              <FeatureLockIndicator
                featureName="seasonal_events"
                levelRequirement={5}
                lockInfo={getFeatureLockReason('seasonal_events', 5)}
                icon={Calendar}
                label="Events"
                tabValue="events"
              />
            )}

            {isCompeteAvailable ? (
              <TabsTrigger value="compete" className="flex flex-col items-center justify-center h-full">
                <TrophyIcon className="w-4 h-4 mb-1" />
                <span className="text-xs">Compete</span>
              </TabsTrigger>
            ) : (
              <FeatureLockIndicator
                featureName="competitive_features"
                levelRequirement={8}
                lockInfo={getFeatureLockReason('competitive_features', 8)}
                icon={TrophyIcon}
                label="Compete"
                tabValue="compete"
              />
            )}
            
            {isFriendsAvailable ? (
              <TabsTrigger value="friends" className="flex flex-col items-center justify-center h-full">
                <Users className="w-4 h-4 mb-1" />
                <span className="text-xs">Friends</span>
              </TabsTrigger>
            ) : (
              <FeatureLockIndicator
                featureName="friends_system"
                levelRequirement={10}
                lockInfo={getFeatureLockReason('friends_system', 10)}
                icon={Users}
                label="Friends"
                tabValue="friends"
              />
            )}
            
            <TabsTrigger value="profile" className="flex flex-col items-center justify-center h-full">
              <User className="w-4 h-4 mb-1" />
              <span className="text-xs">Profile</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="home" className="mt-0">
          <HomeTab />
        </TabsContent>
        
        <TabsContent value="workout" className="mt-0">
          <WorkoutTab />
        </TabsContent>
        
        <TabsContent value="stats" className="mt-0">
          <StatsTab />
        </TabsContent>
        
        <TabsContent value="achievements" className="mt-0">
          <AchievementsTab />
        </TabsContent>
        
        <TabsContent value="events" className="mt-0">
          {isEventsAvailable ? (
            <EventsTab />
          ) : (
            <div className="container mx-auto p-4 text-center">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Events Locked</h3>
                <p className="text-gray-600 mb-4">
                  {getFeatureLockReason('seasonal_events', 5).type === 'admin' 
                    ? 'This feature has been temporarily disabled by administrators.'
                    : 'Reach Level 5 to unlock Seasonal Events and special challenges!'}
                </p>
                <Badge variant="secondary" className={`${
                  getFeatureLockReason('seasonal_events', 5).type === 'admin' 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                }`}>
                  {getFeatureLockReason('seasonal_events', 5).reason}
                </Badge>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="compete" className="mt-0">
          {isCompeteAvailable ? (
            <CompeteTab />
          ) : (
            <div className="container mx-auto p-4 text-center">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Competition Locked</h3>
                <p className="text-gray-600 mb-4">
                  {getFeatureLockReason('competitive_features', 8).type === 'admin'
                    ? 'This feature has been temporarily disabled by administrators.'
                    : 'Reach Level 8 to unlock Leagues, Tournaments, and competitive features!'}
                </p>
                <Badge variant="secondary" className={`${
                  getFeatureLockReason('competitive_features', 8).type === 'admin' 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                }`}>
                  {getFeatureLockReason('competitive_features', 8).reason}
                </Badge>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="friends" className="mt-0">
          {isFriendsAvailable ? (
            <FriendsTab />
          ) : (
            <div className="container mx-auto p-4 text-center">
              <div className="bg-white rounded-lg p-8 shadow-sm">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Friends Locked</h3>
                <p className="text-gray-600 mb-4">
                  {getFeatureLockReason('friends_system', 10).type === 'admin'
                    ? 'This feature has been temporarily disabled by administrators.'
                    : 'Reach Level 10 to unlock the Friends feature and connect with others!'}
                </p>
                <Badge variant="secondary" className={`${
                  getFeatureLockReason('friends_system', 10).type === 'admin' 
                    ? 'bg-red-100 text-red-800 border-red-200' 
                    : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white'
                }`}>
                  {getFeatureLockReason('friends_system', 10).reason}
                </Badge>
              </div>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="profile" className="mt-0">
          <ProfileTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TabNavigation;
