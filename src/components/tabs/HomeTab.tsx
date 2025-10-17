
import { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Calendar, Trophy, Users, TrendingUp, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSessionStats } from "@/hooks/useSessionHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import CountdownTimer from "@/components/timer/CountdownTimer";
import CompactProgressBar from "@/components/quick-start/CompactProgressBar";
import { useNewExercises, type ExerciseWithCategory } from "@/hooks/useNewExercises";
import GatedRecommendationsDashboard from "@/components/recommendations/GatedRecommendationsDashboard";
import CommunityStatsWidget from "@/components/social/CommunityStatsWidget";
import UserRankingDisplay from "@/components/social/UserRankingDisplay";
import XPMultiplierNotification from "@/components/xp/XPMultiplierNotification";
import { useLevelProgression } from "@/hooks/useLevelProgression";
import { useRewardTiming } from "@/hooks/useRewardTiming";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useUserProfile } from "@/hooks/useUserProfile";
import { logger } from '@/utils/productionLogger';
import FirstTimeOverlay from '@/components/FirstTimeOverlay';
import MomentumScoreWidget from "@/components/momentum/MomentumScoreWidget";

interface HomeTabProps {
  onExerciseSelect?: (exerciseId: string) => void;
  onTabChange?: (tab: string) => void;
  onUpgradeClick?: () => void;
  onStartWorkout?: (exerciseId: string, duration: number) => void;
  selectedWorkout?: {exerciseId: string, duration: number} | null;
  onWorkoutStarted?: () => void;
}

const HomeTab = ({ onExerciseSelect, onTabChange, onUpgradeClick, onStartWorkout, selectedWorkout, onWorkoutStarted }: HomeTabProps) => {
  const { data: stats } = useSessionStats();
  const { user } = useAuth();
  const { userLevel, loading: levelLoading } = useLevelProgression();
  const rewardTiming = useRewardTiming();
  const { preferences, loading: preferencesLoading, updatePreferences } = useUserPreferences();
  const { username } = useUserProfile();
  const [communityExpanded, setCommunityExpanded] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const [initializedFromPreferences, setInitializedFromPreferences] = useState(false);
  const [showFirstTimeOverlay, setShowFirstTimeOverlay] = useState(false);
  const [isFirstTimeUser, setIsFirstTimeUser] = useState(false);
  const { toast } = useToast();

  // Get exercises for CountdownTimer (from new exercises table)
  const { data: exercises, isLoading: exercisesLoading } = useNewExercises();
  const selectedExerciseObj = exercises?.find(ex => ex.id === selectedExercise);
  
  // If no exercise selected yet, default to first available exercise when exercises load
  useEffect(() => {
    if (exercises && exercises.length > 0 && !selectedExercise) {
      const defaultExercise = exercises[0];
      setSelectedExercise(defaultExercise.id);
    }
  }, [exercises, selectedExercise]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleManageSubscription = () => {
    if (onTabChange) {
      onTabChange('profile');
    }
  };

  const handleUpgrade = () => {
    if (onUpgradeClick) {
      onUpgradeClick();
    } else if (onTabChange) {
      onTabChange('profile');
    }
  };

  // Use real data if available, otherwise show placeholder
  const displayStats = [
    { 
      icon: Calendar, 
      label: "This Week", 
      value: stats ? `${stats.thisWeekSessions}/${stats.weeklyGoal} days` : "0/7 days", 
      color: "text-blue-500" 
    },
    { 
      icon: Trophy, 
      label: "Best Time", 
      value: stats && stats.totalSessions > 0 ? formatDuration(stats.averageDuration) : "0:00", 
      color: "text-yellow-500" 
    }
  ];

  // Get the username from database or return empty string
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Use username from database if available
    if (username) {
      return `, ${username}`;
    }
    
    // No fallback - return empty string
    return '';
  };

  const handleStartWorkout = async (exerciseId: string, duration: number) => {
    setSelectedExercise(exerciseId);
    setSelectedDuration(duration);
    
    // Save preferences for next time
    if (exerciseId && duration) {
      await updatePreferences({
        last_exercise_id: exerciseId,
        last_duration: duration,
        last_workout_timestamp: new Date().toISOString()
      }, false);
    }
    
    // Notify parent that workout has been started (not just prepared)
    onWorkoutStarted?.();
  };

  const prepareWorkout = (exerciseId: string, duration: number) => {
    setSelectedExercise(exerciseId);
    setSelectedDuration(duration);
    // Don't start the timer - just prepare it
  };

  // Handle external workout selection from WorkoutTab (priority over preferences)
  useEffect(() => {
    if (selectedWorkout) {
      logger.debug('HomeTab: External workout selected', { selectedWorkout });
      prepareWorkout(selectedWorkout.exerciseId, selectedWorkout.duration);
      // Don't call onWorkoutStarted here - only call it when user actually starts the workout
    }
  }, [selectedWorkout, onWorkoutStarted]);

  // Check if this is the user's first time on home tab
  useEffect(() => {
    const checkFirstTimeUser = async () => {
      if (!user) return;

      // Check if overlay was already dismissed
      const dismissed = localStorage.getItem('first-time-home-dismissed');
      if (dismissed) return;

      try {
        // Check if user has any previous workout sessions
        const { data: sessions, error } = await supabase
          .from('user_sessions')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (error) throw error;

        // If no sessions found, this is a first-time user
        if (!sessions || sessions.length === 0) {
          setIsFirstTimeUser(true);
          setShowFirstTimeOverlay(true);
          // Set default duration to 30 seconds (exercise will be set from exercises load)
          setSelectedDuration(30);
        }
      } catch (error) {
        console.error('Error checking first-time user status:', error);
      }
    };

    checkFirstTimeUser();
  }, [user]);

  // Initialize from user preferences when component loads (priority: selectedWorkout > first-time defaults > existing state > preferences)
  useEffect(() => {
    // If we have an external workout selection, prioritize that and skip preferences
    if (selectedWorkout) {
      logger.debug('HomeTab: Skipping preference load - external workout selected');
      return;
    }

    // If this is a first-time user, don't load preferences (use first-time defaults)
    if (isFirstTimeUser) {
      logger.debug('HomeTab: Skipping preference load - first-time user');
      return;
    }

    // Only initialize once from preferences
    if (initializedFromPreferences) {
      return;
    }

    // Initialize from preferences if they're loaded
    if (!preferencesLoading && preferences) {
      logger.debug('HomeTab: Initializing from preferences', {
        last_exercise_id: preferences.last_exercise_id,
        last_duration: preferences.last_duration,
        currentExercise: selectedExercise,
        currentDuration: selectedDuration
      });
      
      // Set exercise from preferences
      if (preferences.last_exercise_id) {
        setSelectedExercise(preferences.last_exercise_id);
        logger.debug('HomeTab: Set exercise from preferences: ' + preferences.last_exercise_id);
      }
      
      // Set duration from preferences (default to 60 if no preference)
      const preferredDuration = preferences.last_duration || 60;
      setSelectedDuration(preferredDuration);
      logger.debug('HomeTab: Set duration from preferences: ' + preferredDuration);
      
      setInitializedFromPreferences(true);
    }
  }, [preferences, preferencesLoading, selectedWorkout, isFirstTimeUser, initializedFromPreferences]);

  const handleDurationChange = async (duration: number) => {
    setSelectedDuration(duration);
    
    // Only save to preferences when user manually changes duration (not during initialization)
    if (initializedFromPreferences && selectedExercise) {
      await updatePreferences({
        last_duration: duration,
        last_workout_timestamp: new Date().toISOString()
      }, false);
    }
  };

  const handleGoToWorkouts = () => {
    localStorage.setItem('first-time-home-dismissed', 'true');
    setShowFirstTimeOverlay(false);
    if (onTabChange) {
      onTabChange('workout');
    }
  };

  const handleDismissOverlay = () => {
    localStorage.setItem('first-time-home-dismissed', 'true');
    setShowFirstTimeOverlay(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 mb-6"
    >
      {/* XP Multiplier Notification */}
      <XPMultiplierNotification />

      {/* First Time User Overlay */}
      <FirstTimeOverlay
        visible={showFirstTimeOverlay}
        onGoToWorkouts={handleGoToWorkouts}
        onDismiss={handleDismissOverlay}
      />

      {/* Welcome Header removed - moved to timer card for desktop */}

      {/* Hero Section - Quick Start Timer */}
      {exercisesLoading ? (
        <Card className="p-6 bg-white/60 backdrop-blur-sm border-orange-100">
          <p className="text-center text-muted-foreground">Loading exercises...</p>
        </Card>
      ) : selectedExerciseObj ? (
        <CountdownTimer
          selectedExercise={selectedExerciseObj}
          onBack={() => {
            setSelectedExercise('');
          }}
          onExerciseChange={async (exercise) => {
            setSelectedExercise(exercise.id);
            // Save preference when exercise changes
            await updatePreferences({
              last_exercise_id: exercise.id,
              last_workout_timestamp: new Date().toISOString()
            }, false);
          }}
          quickStartDuration={selectedDuration}
        />
      ) : (
        <Card className="p-6 bg-white/60 backdrop-blur-sm border-orange-100">
          <p className="text-center text-muted-foreground">
            Select an exercise to get started
          </p>
        </Card>
      )}

      {/* Compact Progress Bar */}
      {!levelLoading && userLevel && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <CompactProgressBar userLevel={userLevel} />
        </motion.div>
      )}

      {/* Quick Stats Row - Condensed */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="grid grid-cols-2 gap-3"
      >
        {displayStats.map((stat, index) => (
          <Card key={stat.label} className="bg-white/60 backdrop-blur-sm border-orange-100">
            <CardContent className="p-3 text-center">
              <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
              <p className="text-sm font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>

      {/* Momentum Score Widget */}
      <MomentumScoreWidget />

      {/* Community Section - Collapsible */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <Collapsible open={communityExpanded} onOpenChange={setCommunityExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-between p-4 h-auto bg-white/40 hover:bg-white/60 border border-orange-100"
            >
              <div className="flex items-center space-x-3">
                <Users className="h-4 w-4 text-blue-500" />
                <div className="text-left">
                  <p className="font-medium text-foreground">Community Pulse</p>
                  <p className="text-sm text-muted-foreground">See rankings and stats</p>
                </div>
              </div>
              <motion.div
                animate={{ rotate: communityExpanded ? 90 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <CommunityStatsWidget />
              <UserRankingDisplay />
            </div>
          </CollapsibleContent>
        </Collapsible>
      </motion.div>

      {/* Progress Summary - Compact */}
      {stats && stats.totalSessions > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <Card className="bg-white/40 backdrop-blur-sm border-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="font-medium text-foreground">Progress</span>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-foreground">{stats.totalSessions}</p>
                    <p className="text-xs text-muted-foreground">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-foreground">{formatTime(stats.totalTimeSpent)}</p>
                    <p className="text-xs text-muted-foreground">Total Time</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default HomeTab;
