import React from "react";
import { motion } from "framer-motion";
import { Play, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface ExerciseListItemProps {
  exercise: Exercise;
  onStart: (exercise: Exercise) => void;
  onViewDetails: (exercise: Exercise) => void;
}

const ExerciseListItem: React.FC<ExerciseListItemProps> = ({
  exercise,
  onStart,
  onViewDetails,
}) => {
  const getDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-3 w-3 ${
          i < level
            ? "fill-yellow-400 text-yellow-400"
            : "text-muted-foreground/30"
        }`}
      />
    ));
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
      className="p-3 rounded-lg border border-border/50 hover:border-primary/20 hover:bg-muted/30 transition-all group"
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="font-medium text-foreground truncate group-hover:text-primary transition-colors">
              {exercise.name}
            </h4>
            <div className="flex items-center space-x-0.5 flex-shrink-0">
              {getDifficultyStars(exercise.difficulty_level)}
            </div>
          </div>
          {exercise.description && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {exercise.description}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-3 flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onViewDetails(exercise)}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={() => onStart(exercise)}
            className="h-8 px-3 text-xs"
          >
            <Play className="h-3 w-3 mr-1" />
            Start
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ExerciseListItem;