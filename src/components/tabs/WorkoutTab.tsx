import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useExercises } from "@/hooks/useExercises";
import { useSessionTracking } from "@/hooks/useSessionTracking";
import { useEnhancedSessionTracking } from "@/hooks/useEnhancedSessionTracking";
import ExerciseCard from "@/components/ExerciseCard";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import TimerSetup from "@/components/TimerSetup";
import PlankTimer from "@/components/PlankTimer";
import StreakMilestone from "@/components/StreakMilestone";
import AchievementNotification from "@/components/AchievementNotification";
import type { Tables } from '@/integrations/supabase/types';
import type { UserAchievement } from "@/hooks/useUserAchievements";

type Exercise = Tables<'plank_exercises'>;
type WorkoutState = 'selection' | 'setup' | 'timer';

interface MilestoneEvent {
  milestone: {
    days: number;
    title: string;
    description: string;
  };
  isNewMilestone: boolean;
}

const WorkoutTab = () => {
  const [workoutState, setWorkoutState] = useState<WorkoutState>('selection');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [timerDuration, setTimerDuration] = useState<number>(0);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsExercise, setDetailsExercise] = useState<Exercise | null>(null);
  
  // Notification states
  const [milestoneToShow, setMilestoneToShow] = useState<MilestoneEvent | null>(null);
  const [achievementQueue, setAchievementQueue] = useState<UserAchievement[]>([]);
  const [currentAchievement, setCurrentAchievement] = useState<UserAchievement | null>(null);

  const { data: exercises, isLoading, error } = useExercises();
  const { saveEnhancedSession } = useEnhancedSessionTracking();

  const handleStartExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setWorkoutState('setup');
  };

  const handleViewDetails = (exercise: Exercise) => {
    setDetailsExercise(exercise);
    setDetailsModalOpen(true);
  };

  const handleStartTimer = (duration: number) => {
    setTimerDuration(duration);
    setWorkoutState('timer');
  };

  const handleTimerComplete = async (timeElapsed: number) => {
    if (selectedExercise) {
      const result = await saveEnhancedSession({
        exercise: selectedExercise,
        durationSeconds: timeElapsed,
        notes: `Completed ${selectedExercise.name} workout`
      });
      
      // Handle milestone notification
      if (result.milestoneEvent) {
        setMilestoneToShow(result.milestoneEvent);
      }
      
      // Handle achievement notifications
      if (result.newAchievements.length > 0) {
        setAchievementQueue(result.newAchievements);
        setCurrentAchievement(result.newAchievements[0]);
      }
    }
    
    // Return to selection after a short delay
    setTimeout(() => {
      setWorkoutState('selection');
      setSelectedExercise(null);
      setTimerDuration(0);
    }, 3000);
  };

  const handleMilestoneClose = () => {
    setMilestoneToShow(null);
    // Show first achievement if any
    if (achievementQueue.length > 0 && !currentAchievement) {
      setCurrentAchievement(achievementQueue[0]);
    }
  };

  const handleAchievementClose = () => {
    const remaining = achievementQueue.slice(1);
    setAchievementQueue(remaining);
    
    if (remaining.length > 0) {
      setCurrentAchievement(remaining[0]);
    } else {
      setCurrentAchievement(null);
    }
  };

  const handleBack = () => {
    if (workoutState === 'timer') {
      setWorkoutState('setup');
    } else if (workoutState === 'setup') {
      setWorkoutState('selection');
      setSelectedExercise(null);
    }
  };

  const handleQuickStart = () => {
    // Quick start with forearm plank for 60 seconds
    const forearmPlank = exercises?.find(ex => ex.name.toLowerCase().includes('forearm'));
    if (forearmPlank) {
      setSelectedExercise(forearmPlank);
      setTimerDuration(60);
      setWorkoutState('timer');
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-orange-600 text-lg">Loading exercises...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-red-600 text-lg">Error loading exercises. Please try again.</div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      <AnimatePresence mode="wait">
        {workoutState === 'selection' && (
          <motion.div
            key="selection"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="p-6 space-y-6"
          >
            {/* Header */}
            <div className="text-center pt-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Workout</h2>
              <p className="text-gray-600">Select a plank exercise to get started</p>
            </div>

            {/* Exercise Cards */}
            <div className="space-y-4">
              {exercises?.map((exercise, index) => (
                <ExerciseCard
                  key={exercise.id}
                  exercise={exercise}
                  index={index}
                  onStart={handleStartExercise}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Quick Start */}
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Card className="bg-gradient-to-br from-gray-800 to-gray-900 text-white border-0">
                <CardContent className="p-6 text-center">
                  <h3 className="text-lg font-bold mb-2">Quick 1-Minute Session</h3>
                  <p className="text-gray-300 mb-4">Not sure what to choose? Start with our recommended daily routine</p>
                  <Button 
                    onClick={handleQuickStart}
                    className="bg-white text-gray-800 hover:bg-gray-100 font-semibold py-2 px-6 rounded-lg"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Quick Start
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {workoutState === 'setup' && selectedExercise && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TimerSetup
              exercise={selectedExercise}
              onStart={handleStartTimer}
              onBack={handleBack}
            />
          </motion.div>
        )}

        {workoutState === 'timer' && selectedExercise && (
          <motion.div
            key="timer"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <PlankTimer
              exercise={selectedExercise}
              duration={timerDuration}
              onComplete={handleTimerComplete}
              onBack={handleBack}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exercise Details Modal */}
      <ExerciseDetailsModal
        exercise={detailsExercise}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onStart={(exercise) => {
          setDetailsModalOpen(false);
          handleStartExercise(exercise);
        }}
      />

      {/* Milestone Notification */}
      <StreakMilestone
        milestone={milestoneToShow?.milestone || { days: 0, title: '', description: '' }}
        onClose={handleMilestoneClose}
        isVisible={!!milestoneToShow}
      />

      {/* Achievement Notification */}
      {currentAchievement && (
        <AchievementNotification
          achievement={currentAchievement}
          onClose={handleAchievementClose}
          isVisible={!!currentAchievement}
        />
      )}
    </div>
  );
};

export default WorkoutTab;
