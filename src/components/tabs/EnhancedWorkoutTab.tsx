
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dumbbell, Plus, Clock, Target } from "lucide-react";
import PlankTimer from "@/components/PlankTimer";
import ExerciseCard from "@/components/ExerciseCard";
import { useExercises } from "@/hooks/useExercises";
import GatedCustomWorkoutManager from "@/components/custom-workouts/GatedCustomWorkoutManager";
import EnhancedFeatureGuard from "@/components/access/EnhancedFeatureGuard";

const EnhancedWorkoutTab = () => {
  const [workoutTab, setWorkoutTab] = useState("timer");
  const { data: exercises, isLoading } = useExercises();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 30
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6"
    >
      {/* Header */}
      <div className="text-center pt-4">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-gray-800 mb-2"
        >
          Workout Hub
        </motion.h2>
        <motion.p 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600"
        >
          Train, track, and transform your fitness
        </motion.p>
      </div>

      {/* Workout Tabs */}
      <Tabs value={workoutTab} onValueChange={setWorkoutTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Timer
          </TabsTrigger>
          <TabsTrigger value="exercises" className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Exercises
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <PlankTimer />
          </motion.div>
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {isLoading ? (
              // Loading skeletons
              Array.from({ length: 6 }).map((_, i) => (
                <motion.div
                  key={i}
                  variants={itemVariants}
                  className="h-48 bg-gray-100 animate-pulse rounded-lg"
                />
              ))
            ) : (
              exercises?.map((exercise) => (
                <motion.div key={exercise.id} variants={itemVariants}>
                  <ExerciseCard exercise={exercise} />
                </motion.div>
              ))
            )}
          </motion.div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <EnhancedFeatureGuard
            feature="custom_workouts"
            mode="preview"
            previewHeight={300}
            loadingSkeleton={
              <div className="space-y-4">
                <div className="h-8 bg-gray-100 animate-pulse rounded" />
                <div className="h-4 bg-gray-100 animate-pulse rounded w-2/3" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-32 bg-gray-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              </div>
            }
          >
            <GatedCustomWorkoutManager />
          </EnhancedFeatureGuard>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default EnhancedWorkoutTab;
