import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus } from "lucide-react";
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";

import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNewExercises } from "@/hooks/useNewExercises";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { useEnhancedTimerAudio } from '@/hooks/useEnhancedTimerAudio';
import { useEnhancedSessionTracking } from '@/hooks/useEnhancedSessionTracking';
import { useSessionStats } from "@/hooks/useSessionHistory";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMomentumScore } from "@/hooks/useMomentumScore";
import CircularProgressTimer from '@/components/timer/CircularProgressTimer';
import TimePickerModal from '@/components/timer/TimePickerModal';
import SimpleCompletionOverlay from '@/components/timer/SimpleCompletionOverlay';
import QuickStatsCards from '@/components/stats/QuickStatsCards';
import EnhancedConfetti from '@/components/celebration/EnhancedConfetti';

interface HomeTabProps {
  onExerciseSelect?: (exerciseId: string) => void;
  onTabChange?: (tab: string) => void;
  onUpgradeClick?: () => void;
  onStartWorkout?: (exerciseId: string, duration: number) => void;
  selectedWorkout?: {exerciseId: string, duration: number} | null;
  onWorkoutStarted?: () => void;
}

const HomeTab = ({ onExerciseSelect, onTabChange, onUpgradeClick, onStartWorkout, selectedWorkout, onWorkoutStarted }: HomeTabProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: exercises, isLoading: exercisesLoading } = useNewExercises();
  const { preferences, updatePreferences } = useUserPreferences();
  const { username, firstName } = useUserProfile();
  const { data: stats } = useSessionStats();
  const { data: momentumData } = useMomentumScore();
  
  // State
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [duration, setDuration] = useState<number>(30); // Default 30 seconds
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSimpleCompletion, setShowSimpleCompletion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Audio and session tracking
  const { playCompletionSound } = useEnhancedTimerAudio();
  const { completeSession } = useEnhancedSessionTracking();

  // Timer hook
  const {
    timeLeft,
    state,
    progress,
    setTimerDuration,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleReset,
  } = useCountdownTimer({
    initialDuration: duration,
    onComplete: async (wasCompleted: boolean) => {
      if (wasCompleted) {
        // Show confetti first
        setShowConfetti(true);
        
        // Complete the session
        await completeSession(duration, '');
        
        // After 3 seconds, hide confetti and show simple overlay
        setTimeout(() => {
          setShowConfetti(false);
          setShowSimpleCompletion(true);
        }, 3000);
      }
    },
    onPlayCompletionSound: playCompletionSound,
  });

  // Get selected exercise object
  const selectedExercise = exercises?.find(ex => ex.id === selectedExerciseId);

  // Initialize from preferences or defaults
  useEffect(() => {
    if (initialized || !exercises || exercises.length === 0) return;

    // Check if user has preferences
    const hasPreferences = preferences?.last_exercise_id && preferences?.last_duration;

    if (hasPreferences) {
      // Use saved preferences
      setSelectedExerciseId(preferences.last_exercise_id);
      const savedDuration = preferences.last_duration;
      setDuration(savedDuration);
      setTimerDuration(savedDuration); // Transition to 'ready' state
    } else {
      // First-time user: Find "Forearm Plank" or use first exercise
      const forearmPlank = exercises.find(ex => 
        ex.name.toLowerCase().includes('forearm') && ex.name.toLowerCase().includes('plank')
      );
      const defaultExercise = forearmPlank || exercises[0];
      
      setSelectedExerciseId(defaultExercise.id);
      setDuration(30); // 30 seconds for first-time users
      setTimerDuration(30); // Transition to 'ready' state
      
      // Save as preference
      updatePreferences({
        last_exercise_id: defaultExercise.id,
        last_duration: 30,
      }, false);
    }

    setInitialized(true);
  }, [exercises, preferences, initialized, updatePreferences, setTimerDuration]);

  // Greeting logic
  const getGreeting = () => {
    const displayName = firstName || username || 'there';
    return `Hello, ${displayName}!`;
  };

  // Get current date
  const getCurrentDate = () => {
    return format(new Date(), 'EEEE, MMMM d');
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Quick adjust functions
  const handleQuickAdjust = (adjustment: number) => {
    const newDuration = Math.max(0, Math.min(duration + adjustment, 5999)); // Max 99:59
    setDuration(newDuration);
    setTimerDuration(newDuration); // Update timer hook state
    
    // Save to preferences
    updatePreferences({
      last_duration: newDuration,
    }, false);
  };

  // Time picker handlers
  const handleTimeClick = () => {
    if (state === 'ready' || state === 'setup') {
      setShowTimePicker(true);
    }
  };

  const handleTimeSave = (minutes: number, seconds: number) => {
    const newDuration = minutes * 60 + seconds;
    setDuration(newDuration);
    setTimerDuration(newDuration); // Update timer hook state
    
    // Save to preferences
    updatePreferences({
      last_duration: newDuration,
    }, false);
    
    toast({
      title: "Timer Updated",
      description: `Duration set to ${minutes}:${seconds.toString().padStart(2, '0')}`,
    });
  };

  // Timer control handlers
  const handleStartTimer = () => {
    handleStart();
    toast({
      title: "Timer Started",
      description: "Stay focused! You've got this!",
    });
    onWorkoutStarted?.();
  };

  const handlePauseTimer = () => {
    handlePause();
    toast({
      title: "Timer Paused",
      description: "Take a breath",
    });
  };

  const handleResumeTimer = () => {
    handleResume();
    toast({
      title: "Timer Resumed",
      description: "Keep going!",
    });
  };

  const handleSubmitTimer = async () => {
    const timeElapsed = duration - timeLeft;
    
    // Show confetti
    setShowConfetti(true);
    
    // Complete session
    await completeSession(timeElapsed, '');
    
    // Reset timer
    handleReset();
    
    // After 3 seconds, hide confetti and show simple overlay
    setTimeout(() => {
      setShowConfetti(false);
      setShowSimpleCompletion(true);
    }, 3000);
    
    toast({
      title: "Workout Submitted!",
      description: `Great work on ${formatTime(timeElapsed)}!`,
    });
  };

  const handleResetTimer = () => {
    handleReset();
    toast({
      title: "Timer Reset",
    });
  };

  const handleCloseCompletion = () => {
    setShowSimpleCompletion(false);
    handleReset();
  };

  // Quick adjust buttons are disabled when not in ready or setup state
  const quickAdjustDisabled = state !== 'ready' && state !== 'setup';

  // Stats for cards
  const weeklyWorkouts = stats?.thisWeekSessions || 0;
  const totalMinutes = stats?.totalTimeSpent ? Math.round(stats.totalTimeSpent / 60) : 0;
  const momentumScore = momentumData?.score || 0;

  if (exercisesLoading || !selectedExercise) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 mb-6 max-w-2xl mx-auto"
    >
      {/* Confetti */}
      <EnhancedConfetti 
        isActive={showConfetti} 
        intensity="high"
        duration={3000}
      />

      {/* Time Picker Modal */}
      <TimePickerModal
        isOpen={showTimePicker}
        currentMinutes={Math.floor(duration / 60)}
        currentSeconds={duration % 60}
        onSave={handleTimeSave}
        onClose={() => setShowTimePicker(false)}
      />

      {/* Simple Completion Overlay */}
      <SimpleCompletionOverlay
        isOpen={showSimpleCompletion}
        exerciseName={selectedExercise.name}
        duration={duration - timeLeft}
        onClose={handleCloseCompletion}
      />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2 text-center"
      >
        <h1 className="text-3xl font-bold text-foreground">{getGreeting()}</h1>
        <p className="text-sm text-muted-foreground">
          {getCurrentDate()}
        </p>
      </motion.div>

      {/* Hero Timer Display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="py-4"
      >
        <CircularProgressTimer
          timeLeft={timeLeft}
          duration={duration}
          state={state}
          progress={progress}
          onClick={handleTimeClick}
        />
      </motion.div>

      {/* Quick Adjust Controls - Visible when ready or setup */}
      {(state === 'ready' || state === 'setup') && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center gap-4"
        >
          <Button
            variant="outline"
            onClick={() => handleQuickAdjust(-5)}
            disabled={quickAdjustDisabled || duration <= 0}
            className="h-12 px-4"
          >
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4" />
              <span className="text-sm font-medium">5s</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleQuickAdjust(5)}
            disabled={quickAdjustDisabled || duration >= 5999}
            className="h-12 px-4"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="text-sm font-medium">5s</span>
            </div>
          </Button>
        </motion.div>
      )}

      {/* Exercise Info Section - Below Quick Adjust Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-center space-y-1"
      >
        <h2 className="text-xl font-bold text-foreground">
          {selectedExercise.name}
        </h2>
        <p className="text-sm text-muted-foreground">
          Level {selectedExercise.difficulty_level} {'⭐'.repeat(selectedExercise.difficulty_level)}
        </p>
      </motion.div>

      {/* Primary Action Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <AnimatePresence mode="wait">
          {(state === 'ready' || state === 'setup') && (
            <motion.div
              key="start"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleStartTimer}
                size="lg"
                className="max-w-md text-lg"
              >
                Start Workout
              </Button>
            </motion.div>
          )}

          {state === 'running' && (
            <motion.div
              key="pause"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-center"
            >
              <Button
                onClick={handlePauseTimer}
                size="lg"
                variant="secondary"
                className="max-w-md text-lg"
              >
                Pause
              </Button>
            </motion.div>
          )}

          {state === 'paused' && (
            <motion.div
              key="paused"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-center"
            >
              <div className="flex gap-3 max-w-xs w-full">
                <Button
                  onClick={handleResumeTimer}
                  size="lg"
                  className="flex-1 text-lg"
                >
                  Resume
                </Button>
                <Button
                  onClick={handleSubmitTimer}
                  size="lg"
                  variant="outline"
                  className="flex-1 text-lg"
                >
                  Submit
                </Button>
              </div>
            </motion.div>
          )}

          {state === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleResetTimer}
                size="lg"
                className="max-w-md text-lg"
              >
                Start New Workout
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Stats Cards */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex justify-center"
      >
        <QuickStatsCards
          weeklyWorkouts={weeklyWorkouts}
          totalMinutes={totalMinutes}
          momentumScore={momentumScore}
        />
      </motion.div>
    </motion.div>
  );
};

export default HomeTab;
