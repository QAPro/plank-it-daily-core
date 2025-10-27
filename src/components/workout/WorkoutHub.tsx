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

      <div className="max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-4">
          {categories?.map((category, index) => {
            const exerciseCount = allExercises?.filter(
              ex => ex.category_id === category.id
            ).length || 0;

            // Dramatic rotation angles for mobile, subtle on desktop
            const rotation = index % 6 === 0 ? '-8deg' : 
                           index % 6 === 1 ? '7deg' : 
                           index % 6 === 2 ? '-6deg' : 
                           index % 6 === 3 ? '8deg' : 
                           index % 6 === 4 ? '-7deg' : '6deg';
            
            // Progressive overlap: dramatic mobile, moderate tablet, minimal desktop
            const mobileOverlap = '-mb-6';
            const tabletOverlap = 'md:-mb-8';
            const desktopOverlap = 'lg:-mb-4';

            return (
              <div 
                key={category.id}
                className={`${mobileOverlap} ${tabletOverlap} ${desktopOverlap}`}
                style={{ 
                  transform: `rotate(${rotation})`,
                  zIndex: categories.length - index
                }}
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
