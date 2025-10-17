import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { ExerciseCard } from "./ExerciseCard";
import { ExerciseDetailsModal } from "./ExerciseDetailsModal";
import { useNewExercises, type ExerciseWithCategory } from "@/hooks/useNewExercises";
import { useSubscription } from "@/hooks/useSubscription";
import type { Tables } from "@/integrations/supabase/types";

type ExerciseCategory = Tables<'exercise_categories'>;

interface CategoryViewProps {
  category: ExerciseCategory;
  onBack: () => void;
  onStartExercise: (exercise: ExerciseWithCategory) => void;
}

export const CategoryView = ({ category, onBack, onStartExercise }: CategoryViewProps) => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseWithCategory | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  const { data: exercises, isLoading } = useNewExercises(category.id);
  const { active } = useSubscription();

  const handleViewDetails = (exercise: ExerciseWithCategory) => {
    setSelectedExercise(exercise);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedExercise(null);
  };

  const handleStartFromDetails = (exercise: ExerciseWithCategory) => {
    setShowDetailsModal(false);
    onStartExercise(exercise);
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading exercises...</p>
        </div>
      </div>
    );
  }

  const isPremiumUser = active?.plan_name?.toLowerCase().includes('premium') || false;

  return (
    <div className="p-6 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          onClick={onBack}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Categories
        </Button>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{category.name}</h2>
          {category.description && (
            <p className="text-muted-foreground">{category.description}</p>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {exercises?.map((exercise, index) => {
          const isLocked = exercise.tier_required === 'premium' && !isPremiumUser;
          
          return (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              index={index}
              onStart={() => onStartExercise(exercise)}
              onViewDetails={() => handleViewDetails(exercise)}
              isLocked={isLocked}
            />
          );
        })}
      </div>

      <ExerciseDetailsModal
        exercise={selectedExercise}
        isOpen={showDetailsModal}
        onClose={handleCloseDetails}
        onStart={handleStartFromDetails}
        isLocked={selectedExercise ? selectedExercise.tier_required === 'premium' && !isPremiumUser : false}
      />
    </div>
  );
};
