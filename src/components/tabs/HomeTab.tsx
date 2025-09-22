
import React, { useState } from 'react';
import { motion } from "framer-motion";
import { Calendar, Trophy, Users, TrendingUp, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSessionStats } from "@/hooks/useSessionHistory";
import { useAuth } from "@/contexts/AuthContext";
import { useTimerState } from "@/hooks/useTimerState";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import QuickStartTimerCard from "@/components/quick-start/QuickStartTimerCard";
import CompactProgressBar from "@/components/quick-start/CompactProgressBar";
import GatedRecommendationsDashboard from "@/components/recommendations/GatedRecommendationsDashboard";
import CommunityStatsWidget from "@/components/social/CommunityStatsWidget";
import UserRankingDisplay from "@/components/social/UserRankingDisplay";
import XPMultiplierNotification from "@/components/xp/XPMultiplierNotification";
import { useLevelProgression } from "@/hooks/useLevelProgression";
import { useRewardTiming } from "@/hooks/useRewardTiming";
import { useUserPreferences } from "@/hooks/useUserPreferences";

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
  const [communityExpanded, setCommunityExpanded] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [selectedDuration, setSelectedDuration] = useState<number>(60);
  const { toast } = useToast();

  // Timer state management
  const timerState = useTimerState({
    duration: selectedDuration,
    onComplete: handleTimerComplete,
    onPlayCompletionSound: () => {
      // Play completion sound
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Fallback if audio fails
        console.log('Timer completed!');
      });
    }
  });

  async function handleTimerComplete(timeElapsed: number) {
    if (!user) return;
    
    try {
      // Save workout session
      await supabase.from('user_sessions').insert({
        user_id: user.id,
        duration_seconds: timeElapsed,
        exercise_id: selectedExercise,
        notes: 'Quick start workout from home',
        user_agent: navigator.userAgent,
        completed_at: new Date().toISOString(),
      });

      // Save preferences for next time
      if (selectedExercise && selectedDuration) {
        await updatePreferences({
          last_exercise_id: selectedExercise,
          last_duration: selectedDuration,
          last_workout_timestamp: new Date().toISOString()
        }, false);
      }

      toast({
        title: "Workout Complete!",
        description: `Great job! You completed ${Math.floor(timeElapsed / 60)}:${(timeElapsed % 60).toString().padStart(2, '0')} of exercise.`,
      });
    } catch (error) {
      console.error('Error saving workout session:', error);
      toast({
        title: "Workout Complete!",
        description: "Great job! Your workout has been completed.",
      });
    }
  }

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

  // Get the user's full name from user_metadata or email
  const getUserDisplayName = () => {
    if (!user) return '';
    
    // Try to get full_name from user_metadata
    const fullName = user.user_metadata?.full_name;
    if (fullName) {
      return `, ${fullName.split(' ')[0]}`;
    }
    
    // Fallback to email username
    if (user.email) {
      const emailUsername = user.email.split('@')[0];
      return `, ${emailUsername}`;
    }
    
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
    
    timerState.handleStart();
  };

  const prepareWorkout = (exerciseId: string, duration: number) => {
    setSelectedExercise(exerciseId);
    setSelectedDuration(duration);
    // Don't start the timer - just prepare it
  };

  // Initialize from user preferences when component loads
  React.useEffect(() => {
    if (!preferencesLoading && preferences && selectedExercise === '' && selectedDuration === 60) {
      if (preferences.last_exercise_id) {
        setSelectedExercise(preferences.last_exercise_id);
      }
      if (preferences.last_duration) {
        setSelectedDuration(preferences.last_duration);
      }
    }
  }, [preferences, preferencesLoading, selectedExercise, selectedDuration]);

  // Handle external workout selection from WorkoutTab
  React.useEffect(() => {
    if (selectedWorkout) {
      prepareWorkout(selectedWorkout.exerciseId, selectedWorkout.duration);
      onWorkoutStarted?.(); // Notify parent that workout has been processed
    }
  }, [selectedWorkout, onWorkoutStarted]);

  const handleDurationChange = (duration: number) => {
    setSelectedDuration(duration);
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

      {/* Welcome Header removed - moved to timer card for desktop */}

      {/* Hero Section - Quick Start Timer */}
      <QuickStartTimerCard 
        onStartWorkout={handleStartWorkout}
        timerState={timerState.state}
        timeLeft={timerState.timeLeft}
        duration={selectedDuration}
        onDurationChange={handleDurationChange}
        onTimerControl={{
          start: timerState.handleStart,
          pause: timerState.handlePause,
          resume: timerState.handleResume,
          stop: timerState.handleStop,
          reset: timerState.handleReset
        }}
        selectedWorkout={selectedWorkout}
        selectedExercise={selectedExercise}
        userDisplayName={getUserDisplayName()}
      />

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

      {/* Minimized Recommendations */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Button
          variant="ghost"
          onClick={() => onTabChange?.('workout')}
          className="w-full justify-between p-4 h-auto bg-white/40 hover:bg-white/60 border border-orange-100"
        >
          <div className="flex items-center space-x-3">
            <div className="text-lg">💡</div>
            <div className="text-left">
              <p className="font-medium text-foreground">Suggested Workouts</p>
              <p className="text-sm text-muted-foreground">Explore personalized recommendations</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </Button>
      </motion.div>

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
