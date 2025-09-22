import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import ExerciseListItem from "./ExerciseListItem";
import { useExercisesGroupedByFamily, ExerciseFamilyWithExercises } from "@/hooks/useExerciseFamilies";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface ExerciseFamilyListProps {
  onExerciseStart: (exercise: Exercise) => void;
  onExerciseDetails: (exercise: Exercise) => void;
}

const ExerciseFamilyList: React.FC<ExerciseFamilyListProps> = ({
  onExerciseStart,
  onExerciseDetails
}) => {
  const { data: familiesWithExercises, isLoading } = useExercisesGroupedByFamily();
  const [openFamilies, setOpenFamilies] = useState<Set<string>>(new Set(['basic_planking']));

  const toggleFamily = (familyKey: string) => {
    setOpenFamilies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(familyKey)) {
        newSet.delete(familyKey);
      } else {
        newSet.add(familyKey);
      }
      return newSet;
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-16 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (!familiesWithExercises || familiesWithExercises.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No exercise families found
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {familiesWithExercises.map((family, index) => (
        <ExerciseFamilyItem
          key={family.family_key}
          family={family}
          isOpen={openFamilies.has(family.family_key)}
          onToggle={() => toggleFamily(family.family_key)}
          onExerciseStart={onExerciseStart}
          onExerciseDetails={onExerciseDetails}
          animationDelay={index * 0.1}
        />
      ))}
    </div>
  );
};

interface ExerciseFamilyItemProps {
  family: ExerciseFamilyWithExercises;
  isOpen: boolean;
  onToggle: () => void;
  onExerciseStart: (exercise: Exercise) => void;
  onExerciseDetails: (exercise: Exercise) => void;
  animationDelay: number;
}

const ExerciseFamilyItem: React.FC<ExerciseFamilyItemProps> = ({
  family,
  isOpen,
  onToggle,
  onExerciseStart,
  onExerciseDetails,
  animationDelay
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, type: "spring", stiffness: 500, damping: 30 }}
    >
      <Collapsible open={isOpen} onOpenChange={onToggle}>
        <CollapsibleTrigger className="w-full">
          <div className="flex items-center justify-between w-full p-4 bg-card border border-border rounded-lg hover:bg-accent/50 transition-colors">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-md">
                {/* We'll use a simple icon for now */}
                <div className="w-5 h-5 bg-primary rounded-sm" />
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-foreground">{family.family_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {family.exercises.length} exercise{family.exercises.length !== 1 ? 's' : ''}
                  {family.description && ` • ${family.description}`}
                </p>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="mt-2 ml-4 space-y-2"
              >
                {family.exercises.map((exercise, exerciseIndex) => (
                  <ExerciseListItem
                    key={exercise.id}
                    exercise={exercise}
                    onStart={() => onExerciseStart(exercise)}
                    onViewDetails={() => onExerciseDetails(exercise)}
                    animationDelay={exerciseIndex * 0.05}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default ExerciseFamilyList;