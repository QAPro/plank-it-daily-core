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
import { useSessionTracking } from '@/contexts/SessionTrackingContext';
import { useSessionStats } from "@/hooks/useSessionHistory";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useMomentumScore } from "@/hooks/useMomentumScore";
import { useValidatedStreak } from "@/hooks/useValidatedStreak";
import { useNotificationPrompt } from "@/hooks/useNotificationPrompt";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import CircularProgressTimer from '@/components/timer/CircularProgressTimer';
import TimePickerModal from '@/components/timer/TimePickerModal';
import SimpleCompletionOverlay from '@/components/timer/SimpleCompletionOverlay';
import QuickStatsCards from '@/components/stats/QuickStatsCards';
import EnhancedConfetti from '@/components/celebration/EnhancedConfetti';
import { NotificationPermissionDialog } from '@/components/notifications/NotificationPermissionDialog';

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
  const { preferences, loading: preferencesLoading, updatePreferences } = useUserPreferences();
  const { username, firstName } = useUserProfile();
  const { data: stats } = useSessionStats();
  const { data: momentumData } = useMomentumScore();
  const { currentStreak: streakValue } = useValidatedStreak();
  
  // Notification prompt
  const {
    shouldShowPrompt,
    triggerAfterWorkout,
    handleEnable,
    handleLater,
    handleClose
  } = useNotificationPrompt();
  const { subscribe } = usePushNotifications();
  
  // State
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>('');
  const [duration, setDuration] = useState<number>(30); // Default 30 seconds
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showSimpleCompletion, setShowSimpleCompletion] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Audio and session tracking
  const { playCompletionSound } = useEnhancedTimerAudio();
  const { completeSession, selectExercise } = useSessionTracking();

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
        // Show confetti for natural completion
        setShowConfetti(true);
        
        // After 3 seconds, hide confetti, show toast, then overlay
        setTimeout(() => {
          setShowConfetti(false);
          
          // Show celebration toast
          toast({
            title: "Workout Complete! 🔥",
            description: "You've started your streak! Keep the fire going tomorrow.",
            duration: 5000,
          });
          
          setShowSimpleCompletion(true);
        }, 3000);
      }
    },
    onPlayCompletionSound: playCompletionSound,
  });

  // Get selected exercise object
  const selectedExercise = exercises?.find(ex => ex.id === selectedExerciseId);
  
  // Keep session tracking hook in sync with selected exercise
  useEffect(() => {
    if (selectedExercise) {
      selectExercise(selectedExercise);
    }
  }, [selectedExercise, selectExercise]);

  // Initialize from preferences or defaults
  useEffect(() => {
    // Wait for both exercises and preferences to load
    if (!exercises || exercises.length === 0) return;
    if (preferencesLoading) return; // Wait for preferences to finish loading
    if (initialized) return; // Already initialized

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
  }, [exercises, preferences, preferencesLoading, initialized, updatePreferences, setTimerDuration]);

  // Handle incoming workout selection from Workout Hub
  useEffect(() => {
    if (selectedWorkout && selectedWorkout.exerciseId) {
      console.log('[HomeTab] Received selected workout:', selectedWorkout);
      
      // Update the selected exercise and duration
      setSelectedExerciseId(selectedWorkout.exerciseId);
      setDuration(selectedWorkout.duration);
      setTimerDuration(selectedWorkout.duration);
      
      // Save to preferences
      updatePreferences({
        last_exercise_id: selectedWorkout.exerciseId,
        last_duration: selectedWorkout.duration,
      }, false);
      
      // Notify parent that we've processed the workout
      if (onWorkoutStarted) {
        onWorkoutStarted();
      }
    }
  }, [selectedWorkout, exercises, setTimerDuration, updatePreferences, onWorkoutStarted, toast]);

  // Greeting logic
  const getGreeting = () => {
    const displayName = username || firstName || 'there';
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
  };

  // Timer control handlers
  const handleStartTimer = () => {
    handleStart();
    onWorkoutStarted?.();
  };

  const handlePauseTimer = () => {
    handlePause();
  };

  const handleResumeTimer = () => {
    handleResume();
  };

  const handleStopTimer = () => {
    const timeElapsed = duration - timeLeft;
    
    // Show completion overlay immediately (no confetti for stopped workouts)
    setShowSimpleCompletion(true);
  };

  const handleResetTimer = () => {
    handleReset();
  };

  const handleSkipWorkout = async () => {
    const timeElapsed = duration - timeLeft;
    
    // Save the session WITHOUT notes
    await completeSession(timeElapsed, '');
    
    // Trigger notification prompt after workout completion
    triggerAfterWorkout();
    
    // Close overlay and reset timer
    setShowSimpleCompletion(false);
    handleReset();
  };

  const handleSubmitWorkout = async (notes: string) => {
    const timeElapsed = duration - timeLeft;
    
    // Save the session with notes
    await completeSession(timeElapsed, notes);
    
    // Trigger notification prompt after workout completion
    triggerAfterWorkout();
    
    // Close overlay and reset timer
    setShowSimpleCompletion(false);
    handleReset();
  };

  // Quick adjust buttons are disabled when not in ready or setup state
  const quickAdjustDisabled = state !== 'ready' && state !== 'setup';

  // Stats for cards
  const currentStreak = streakValue;
  const weeklyWorkouts = stats?.thisWeekSessions || 0;
  const momentumScore = momentumData?.score || 0;
  const momentumGoal = 200;

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
      className="p-6 space-y-3 max-w-2xl mx-auto pb-4"
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
        onSkip={handleSkipWorkout}
        onSubmit={handleSubmitWorkout}
      />

      {/* Notification Permission Dialog */}
      <NotificationPermissionDialog
        isOpen={shouldShowPrompt}
        onEnable={async () => {
          handleEnable();
          await subscribe();
        }}
        onLater={handleLater}
        onClose={handleClose}
      />

      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-1 text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">{getGreeting()}</h1>
        <p className="text-sm text-muted-foreground">
          {getCurrentDate()}
        </p>
      </motion.div>

      {/* Hero Timer Display */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="py-2"
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
            className="h-12 px-6 bg-card border border-border rounded-lg shadow-soft hover:bg-background-tertiary hover:border-primary hover:text-primary hover:shadow-medium active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <Minus className="h-4 w-4" />
              <span className="text-base font-semibold">5s</span>
            </div>
          </Button>

          <Button
            variant="outline"
            onClick={() => handleQuickAdjust(5)}
            disabled={quickAdjustDisabled || duration >= 5999}
            className="h-12 px-6 bg-card border border-border rounded-lg shadow-soft hover:bg-background-tertiary hover:border-primary hover:text-primary hover:shadow-medium active:scale-95 transition-all duration-200 disabled:opacity-50 disabled:pointer-events-none"
          >
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="text-base font-semibold">5s</span>
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
        <h2 className="text-lg font-bold text-foreground">
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
                className="h-12 px-10 text-base font-semibold bg-gradient-primary text-white rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
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
                variant="secondary"
                className="h-12 px-10 text-base font-semibold bg-card text-foreground border border-border rounded-xl shadow-soft hover:bg-secondary hover:border-primary hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
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
                  className="flex-1 h-12 px-10 text-base font-semibold bg-gradient-primary text-white rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                >
                  Resume
                </Button>
                <Button
                  onClick={handleStopTimer}
                  variant="outline"
                  className="flex-1 h-12 text-base font-semibold bg-card text-foreground border border-border rounded-xl shadow-soft hover:bg-secondary hover:border-primary hover:text-primary hover:shadow-medium active:scale-[0.98] transition-all duration-200"
                >
                  Stop
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
                className="h-12 px-10 text-base font-semibold bg-gradient-primary text-white rounded-xl shadow-soft hover:shadow-medium hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
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
          currentStreak={currentStreak}
          weeklyWorkouts={weeklyWorkouts}
          momentumScore={momentumScore}
          momentumGoal={momentumGoal}
        />
      </motion.div>
    </motion.div>
  );
};

export default HomeTab;
