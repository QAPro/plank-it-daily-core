
import React, { useState } from "react";
import { motion } from "framer-motion";
import ExerciseDetailsModal from "@/components/ExerciseDetailsModal";
import ExerciseFamilyList from "@/components/exercise-families/ExerciseFamilyList";
import CustomWorkoutsCard from "@/components/CustomWorkoutsCard";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface EnhancedWorkoutTabProps {
  onStartWorkout: (exerciseId: string, duration: number) => void;
  selectedWorkout?: {exerciseId: string, duration: number} | null;
}

const EnhancedWorkoutTab = ({ onStartWorkout, selectedWorkout }: EnhancedWorkoutTabProps) => {
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [detailsExercise, setDetailsExercise] = useState<Exercise | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(
    selectedWorkout?.exerciseId || null
  );

  // Update selected exercise when selectedWorkout prop changes
  React.useEffect(() => {
    if (selectedWorkout?.exerciseId) {
      setSelectedExerciseId(selectedWorkout.exerciseId);
    }
  }, [selectedWorkout]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const handleExerciseStart = (exercise: Exercise) => {
    // Start workout with 1 minute default duration
    setSelectedExerciseId(exercise.id);
    onStartWorkout(exercise.id, 60);
  };

  const handleExerciseSelect = (exercise: Exercise) => {
    setSelectedExerciseId(exercise.id);
    // Update home screen immediately
    onStartWorkout(exercise.id, 60);
  };

  const handleExerciseDetails = (exercise: Exercise) => {
    setDetailsExercise(exercise);
    setDetailsModalOpen(true);
  };

  const handleDetailsModalStart = (exercise: Exercise) => {
    setDetailsModalOpen(false);
    handleExerciseStart(exercise);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header with Custom Workouts Card */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <motion.h2 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-foreground mb-2"
          >
            Workout Hub
          </motion.h2>
          <motion.p 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-muted-foreground"
          >
            Train, track, and transform your fitness
          </motion.p>
        </div>
        
        <div className="w-48">
          <CustomWorkoutsCard />
        </div>
      </div>

      {/* Exercise List */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="mt-8"
      >
        <ExerciseFamilyList
          onExerciseStart={handleExerciseStart}
          onExerciseDetails={handleExerciseDetails}
          onExerciseSelect={handleExerciseSelect}
          selectedExerciseId={selectedExerciseId}
        />
      </motion.div>

      {/* Exercise Details Modal */}
      <ExerciseDetailsModal
        exercise={detailsExercise}
        isOpen={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        onStart={handleDetailsModalStart}
      />
    </motion.div>
  );
};

export default EnhancedWorkoutTab;
