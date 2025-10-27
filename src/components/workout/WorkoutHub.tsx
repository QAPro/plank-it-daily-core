import { useState } from "react";
import { motion } from "framer-motion";
import { CategoryCard } from "./CategoryCard";
import { CategoryView } from "./CategoryView";
import { useExerciseCategories } from "@/hooks/useExerciseCategories";
import { useNewExercises, type ExerciseWithCategory } from "@/hooks/useNewExercises";
import type { Tables } from "@/integrations/supabase/types";

type ExerciseCategory = Tables<'exercise_categories'>;

interface WorkoutHubProps {
  onStartExercise: (exercise: ExerciseWithCategory) => void;
}

export const WorkoutHub = ({ onStartExercise }: WorkoutHubProps) => {
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  
  const { data: categories, isLoading: categoriesLoading } = useExerciseCategories();
  const { data: allExercises } = useNewExercises();

  if (categoriesLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading workout categories...</p>
        </div>
      </div>
    );
  }

  if (selectedCategory) {
    return (
      <CategoryView
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
        onStartExercise={onStartExercise}
      />
    );
  }

  return (
    <div className="p-6 pb-32 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-2xl font-bold mb-2">Workout Hub</h2>
        <p className="text-muted-foreground">
          Choose a category to explore exercises and start your workout
        </p>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6">
          {categories?.map((category, index) => {
            const exerciseCount = allExercises?.filter(
              ex => ex.category_id === category.id
            ).length || 0;

            const rotation = index % 3 === 0 ? '-2deg' : index % 3 === 1 ? '2deg' : '-1deg';
            const verticalOffset = index % 2 === 0 ? 'md:-mt-4' : 'md:mt-4';
            const lgVerticalOffset = index % 3 === 0 ? 'lg:-mt-6' : index % 3 === 1 ? 'lg:mt-6' : 'lg:mt-0';

            return (
              <div 
                key={category.id}
                className={`${verticalOffset} ${lgVerticalOffset}`}
                style={{ transform: `rotate(${rotation})` }}
              >
                <CategoryCard
                  category={category}
                  exerciseCount={exerciseCount}
                  onClick={() => setSelectedCategory(category)}
                  index={index}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
