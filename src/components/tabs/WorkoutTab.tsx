import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WorkoutHub } from "@/components/workout/WorkoutHub";
import { BackgroundMusicPlayer } from '@/components/audio/BackgroundMusicPlayer';
import { useUserPreferences } from "@/hooks/useUserPreferences";
import type { ExerciseWithCategory } from "@/hooks/useNewExercises";

interface WorkoutTabProps {
  onStartWorkout?: (exerciseId: string, duration: number) => void;
}

const WorkoutTab = ({ onStartWorkout }: WorkoutTabProps) => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithCategory | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const { preferences } = useUserPreferences();

  const handleStartExercise = (exercise: ExerciseWithCategory) => {
    // Navigate to Home tab with selected exercise and duration
    if (onStartWorkout) {
      // Use last duration or default to exercise duration
      const duration = preferences?.last_duration || exercise.duration_seconds;
      // For now, pass the exercise ID - we'll need to update onStartWorkout signature later
      // to support both old and new exercise types during transition
      onStartWorkout(exercise.id, duration);
    } else {
      // Fallback to local timer if no onStartWorkout provided
      setSelectedExercise(exercise);
      setShowTimer(true);
    }
  };

  const handleBackToList = () => {
    setShowTimer(false);
    setSelectedExercise(null);
  };

  // Show timer when exercise is selected
  // Note: PlankTimer still expects old exercise type - will be updated in later phase
  if (showTimer && selectedExercise) {
    return (
      <div className="h-full">
        {/* Temporarily using exercise name as fallback until PlankTimer is updated */}
        <div className="p-6">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">{selectedExercise.name}</h2>
            <p className="text-muted-foreground">Timer integration coming soon...</p>
            <button 
              onClick={handleBackToList}
              className="px-4 py-2 bg-primary text-white rounded-lg"
            >
              Back to Exercises
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <AnimatePresence mode="wait">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Background Music Player */}
          {preferences?.background_music && (
            <div className="p-6 pb-0 flex justify-center">
              <BackgroundMusicPlayer 
                isWorkoutActive={showTimer}
                className="w-full max-w-md"
              />
            </div>
          )}

          {/* New Workout Hub */}
          <WorkoutHub onStartExercise={handleStartExercise} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default WorkoutTab;
