
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, User, Dumbbell, BarChart3, Trophy, Users, Calendar, Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useLevelProgression } from "@/hooks/useLevelProgression";
import FeatureLockIndicator from "@/components/navigation/FeatureLockIndicator";

// Import tab components
import HomeTab from "@/components/tabs/HomeTab";
import WorkoutTab from "@/components/tabs/WorkoutTab";
import StatsTab from "@/components/tabs/StatsTab";
import AchievementsTab from "@/components/tabs/AchievementsTab";
import ProfileTab from "@/components/tabs/ProfileTab";
import FriendsTab from "@/components/tabs/FriendsTab";
import EventsTab from "@/components/tabs/EventsTab";
import CompeteTab from "@/components/tabs/CompeteTab";

const TabNavigation = () => {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  
  const { 
    socialFeaturesEnabled, 
    eventsEnabled, 
    competitionEnabled,
    loading: flagsLoading 
  } = useFeatureFlags();
  
  const { userLevel, loading: levelLoading } = useLevelProgression();

  const handleExerciseSelect = (exerciseId: string) => {
    console.log('Exercise selected:', exerciseId);
    setSelectedExercise(exerciseId);
    setActiveTab("workout");
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  // Check if tab should be locked based on admin flags and level requirements
  const getTabLockInfo = (tabName: string, levelRequirement: number) => {
    // Check admin flags first
    if (tabName === 'friends' && !socialFeaturesEnabled) {
      return { reason: 'Disabled', type: 'admin' as const };
    }
    if (tabName === 'events' && !eventsEnabled) {
      return { reason: 'Disabled', type: 'admin' as const };
    }
    if (tabName === 'compete' && !competitionEnabled) {
      return { reason: 'Disabled', type: 'admin' as const };
    }

    // Check level requirements
    const currentLevel = userLevel?.current_level || 1;
    if (currentLevel < levelRequirement) {
      return { reason: `Level ${levelRequirement}`, type: 'level' as const };
    }

    return null;
  };

  if (flagsLoading || levelLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 flex items-center justify-center">
        <div className="text-orange-600 text-lg">Loading...</div>
      </div>
    );
  }

  // Tab configuration with level requirements
  const tabs = [
    { id: 'home', icon: Home, label: 'Home', levelRequirement: 1 },
    { id: 'workout', icon: Dumbbell, label: 'Workout', levelRequirement: 1 },
    { id: 'stats', icon: BarChart3, label: 'Stats', levelRequirement: 1 },
    { id: 'achievements', icon: Trophy, label: 'Awards', levelRequirement: 1 },
    { id: 'friends', icon: Users, label: 'Friends', levelRequirement: 3 },
    { id: 'events', icon: Calendar, label: 'Events', levelRequirement: 5 },
    { id: 'compete', icon: Gamepad2, label: 'Compete', levelRequirement: 7 },
    { id: 'profile', icon: User, label: 'Profile', levelRequirement: 1 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full h-screen flex flex-col">
        {/* Content Area */}
        <div className="flex-1 overflow-auto pb-20">
          <TabsContent value="home" className="mt-0 h-full">
            <HomeTab onExerciseSelect={handleExerciseSelect} onTabChange={handleTabChange} />
          </TabsContent>
          
          <TabsContent value="workout" className="mt-0 h-full">
            <WorkoutTab selectedExercise={selectedExercise} />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0 h-full">
            <StatsTab />
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-0 h-full">
            <AchievementsTab />
          </TabsContent>
          
          <TabsContent value="friends" className="mt-0 h-full">
            <FriendsTab />
          </TabsContent>
          
          <TabsContent value="events" className="mt-0 h-full">
            <EventsTab />
          </TabsContent>
          
          <TabsContent value="compete" className="mt-0 h-full">
            <CompeteTab />
          </TabsContent>
          
          <TabsContent value="profile" className="mt-0 h-full">
            <ProfileTab />
          </TabsContent>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-orange-100 z-50">
          <TabsList className="w-full h-16 bg-transparent grid grid-cols-4 lg:grid-cols-8 gap-0 rounded-none p-0">
            {tabs.map((tab, index) => {
              const lockInfo = getTabLockInfo(tab.id, tab.levelRequirement);
              
              if (lockInfo) {
                return (
                  <FeatureLockIndicator
                    key={tab.id}
                    featureName={tab.label}
                    levelRequirement={tab.levelRequirement}
                    lockInfo={lockInfo}
                    icon={tab.icon}
                    label={tab.label}
                    tabValue={tab.id}
                  />
                );
              }

              return (
                <TabsTrigger 
                  key={tab.id}
                  value={tab.id} 
                  className="flex flex-col items-center justify-center h-full data-[state=active]:bg-orange-50 data-[state=active]:text-orange-600 relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex flex-col items-center"
                  >
                    <tab.icon className="w-4 h-4 mb-1" />
                    <span className="text-xs">{tab.label}</span>
                  </motion.div>
                  
                  {activeTab === tab.id && (
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-500"
                      layoutId="activeTab"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </Tabs>
    </div>
  );
};

export default TabNavigation;
