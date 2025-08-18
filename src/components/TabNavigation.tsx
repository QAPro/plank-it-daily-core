
import React from 'react';
import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs';
import { Home, Dumbbell, BarChart3, Trophy, Users, Swords } from 'lucide-react';
import GatedHomeTab from './tabs/GatedHomeTab';
import EnhancedWorkoutTab from './tabs/EnhancedWorkoutTab';
import StatsTab from './tabs/StatsTab';
import AchievementsTab from './tabs/AchievementsTab';
import GatedFriendsTab from './tabs/GatedFriendsTab';
import GatedCompeteTab from './tabs/GatedCompeteTab';
import PremiumTabIndicator from './navigation/PremiumTabIndicator';
import { TabsTrigger } from "@/components/ui/tabs";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface TabNavigationProps {
  selectedExercise?: Exercise | null;
  onExerciseSelect?: (exercise: Exercise) => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({ 
  selectedExercise, 
  onExerciseSelect 
}) => {
  const handleStartWorkout = () => {
    // Default to basic plank if no exercise selected
    // This will be handled by the workout tab
  };

  return (
    <Tabs defaultValue="home" className="w-full">
      <TabsList className="grid w-full grid-cols-6 mb-6">
        <TabsTrigger value="home" className="flex items-center gap-2">
          <Home className="w-4 h-4" />
          <span className="hidden sm:inline">Home</span>
        </TabsTrigger>
        
        <TabsTrigger value="workout" className="flex items-center gap-2">
          <Dumbbell className="w-4 h-4" />
          <span className="hidden sm:inline">Workout</span>
        </TabsTrigger>
        
        <TabsTrigger value="stats" className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4" />
          <span className="hidden sm:inline">Stats</span>
        </TabsTrigger>
        
        <TabsTrigger value="achievements" className="flex items-center gap-2">
          <Trophy className="w-4 h-4" />
          <span className="hidden sm:inline">Awards</span>
        </TabsTrigger>
        
        <PremiumTabIndicator
          feature="social_challenges"
          icon={Users}
          label="Friends"
          tabValue="friends"
        />
        
        <PremiumTabIndicator
          feature="social_challenges"
          icon={Swords}
          label="Compete"
          tabValue="compete"
        />
      </TabsList>

      <TabsContent value="home" className="mt-0">
        <GatedHomeTab 
          onStartWorkout={handleStartWorkout}
          onExerciseSelect={onExerciseSelect}
        />
      </TabsContent>

      <TabsContent value="workout" className="mt-0">
        <EnhancedWorkoutTab />
      </TabsContent>

      <TabsContent value="stats" className="mt-0">
        <StatsTab />
      </TabsContent>

      <TabsContent value="achievements" className="mt-0">
        <AchievementsTab />
      </TabsContent>

      <TabsContent value="friends" className="mt-0">
        <GatedFriendsTab />
      </TabsContent>

      <TabsContent value="compete" className="mt-0">
        <GatedCompeteTab />
      </TabsContent>
    </Tabs>
  );
};

export default TabNavigation;
