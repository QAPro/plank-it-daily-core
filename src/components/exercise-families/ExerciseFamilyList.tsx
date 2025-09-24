import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useExerciseFamilies } from "@/hooks/useExerciseFamilies";
import { useExercisesByFamily } from "@/hooks/useExercisesByFamily";
import ExerciseListItem from "./ExerciseListItem";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface ExerciseFamilyListProps {
  onExerciseStart: (exercise: Exercise) => void;
  onExerciseDetails: (exercise: Exercise) => void;
  onExerciseSelect?: (exercise: Exercise) => void;
  selectedExerciseId?: string | null;
}

const ExerciseFamilyList: React.FC<ExerciseFamilyListProps> = ({
  onExerciseStart,
  onExerciseDetails,
  onExerciseSelect,
  selectedExerciseId,
}) => {
  const { data: families, isLoading: familiesLoading } = useExerciseFamilies();
  const { data: exercisesByFamily, isLoading: exercisesLoading } = useExercisesByFamily();
  const [expandedFamilies, setExpandedFamilies] = useState<Set<string>>(new Set());

  // Auto-expand families that contain the selected exercise
  React.useEffect(() => {
    if (selectedExerciseId && exercisesByFamily && families) {
      const newExpanded = new Set(expandedFamilies);
      let found = false;
      
      families.forEach(family => {
        const exercises = exercisesByFamily[family.family_key] || [];
        if (exercises.some(ex => ex.id === selectedExerciseId)) {
          newExpanded.add(family.family_key);
          found = true;
        }
      });
      
      if (found && newExpanded.size !== expandedFamilies.size) {
        setExpandedFamilies(newExpanded);
      }
    }
  }, [selectedExerciseId, exercisesByFamily, families]);

  const toggleFamily = (familyKey: string) => {
    const newExpanded = new Set(expandedFamilies);
    if (newExpanded.has(familyKey)) {
      newExpanded.delete(familyKey);
    } else {
      newExpanded.add(familyKey);
    }
    setExpandedFamilies(newExpanded);
  };

  const isLoading = familiesLoading || exercisesLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!families || !exercisesByFamily) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No exercise families found
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-2"
    >
      {families.map((family, index) => {
        const exercises = exercisesByFamily[family.family_key] || [];
        const isExpanded = expandedFamilies.has(family.family_key);
        
        return (
          <motion.div
            key={family.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border rounded-lg bg-card"
          >
            {/* Family Header */}
            <button
              onClick={() => toggleFamily(family.family_key)}
              className="w-full p-4 text-left hover:bg-muted/50 transition-colors rounded-lg flex items-center justify-between group"
            >
              <div className="flex items-center space-x-3 flex-1">
                <div className="flex-shrink-0">
                  {isExpanded ? (
                    <ChevronDown className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  ) : (
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {family.family_name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {family.description}
                  </p>
                </div>
                <div className="flex-shrink-0 text-sm text-muted-foreground bg-muted px-2 py-1 rounded-full">
                  {exercises.length} exercises
                </div>
              </div>
            </button>

            {/* Expandable Exercise List */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-border">
                    {exercises.length > 0 ? (
                      <div className="p-2 space-y-1">
                        {exercises.map((exercise) => (
                          <ExerciseListItem
                            key={exercise.id}
                            exercise={exercise}
                            onStart={onExerciseStart}
                            onViewDetails={onExerciseDetails}
                            onSelect={onExerciseSelect}
                            isSelected={selectedExerciseId === exercise.id}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-muted-foreground">
                        No exercises in this family
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </motion.div>
  );
};

export default ExerciseFamilyList;