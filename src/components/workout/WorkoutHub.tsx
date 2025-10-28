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
    <div className="p-6 pb-40 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center mb-8"
      >
        <h2 className="text-3xl md:text-4xl font-bold mb-3 text-[#2C3E50]">Workout Hub</h2>
        <p className="text-base md:text-lg text-[#7F8C8D]">
          Choose a category to explore exercises and start your workout
        </p>
      </motion.div>

      <div className="max-w-[280px] sm:max-w-sm md:max-w-md lg:max-w-lg mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 gap-4">
          {categories?.map((category, index) => {
            const exerciseCount = allExercises?.filter(
              ex => ex.category_id === category.id
            ).length || 0;

            // More dramatic rotation angles
            const rotation = index % 6 === 0 ? '-12deg' : 
                           index % 6 === 1 ? '10deg' : 
                           index % 6 === 2 ? '-11deg' : 
                           index % 6 === 3 ? '12deg' : 
                           index % 6 === 4 ? '-10deg' : '11deg';
            
            // Horizontal offset for zigzag effect
            const horizontalOffset = index % 2 === 0 ? '-12px' : '12px';
            
            // Minimal vertical overlap (corner only)
            const mobileOverlap = '-mb-1';
            const tabletOverlap = 'md:-mb-2';
            const desktopOverlap = 'lg:-mb-1';

            return (
              <div 
                key={category.id}
                className={`${mobileOverlap} ${tabletOverlap} ${desktopOverlap}`}
                style={{ 
                  transform: `rotate(${rotation}) translateX(${horizontalOffset})`,
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
