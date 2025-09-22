import React from "react";
import { motion } from "framer-motion";
import { Play, Info, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface ExerciseListItemProps {
  exercise: Exercise;
  onStart: () => void;
  onViewDetails: () => void;
  animationDelay?: number;
}

const ExerciseListItem: React.FC<ExerciseListItemProps> = ({
  exercise,
  onStart,
  onViewDetails,
  animationDelay = 0
}) => {
  const renderDifficultyStars = (level: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <Star
        key={index}
        className={`w-3 h-3 ${
          index < level
            ? "fill-yellow-400 text-yellow-400"
            : "fill-muted text-muted-foreground"
        }`}
      />
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: animationDelay, type: "spring", stiffness: 500, damping: 30 }}
      className="flex items-center justify-between p-3 bg-card/50 border border-border/50 rounded-md hover:bg-accent/30 transition-colors group"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2 mb-1">
          <h4 className="font-medium text-foreground truncate">{exercise.name}</h4>
          <div className="flex items-center space-x-1 shrink-0">
            {renderDifficultyStars(exercise.difficulty_level)}
          </div>
        </div>
        {exercise.description && (
          <p className="text-xs text-muted-foreground line-clamp-2">
            {exercise.description}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-1 ml-3 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={onViewDetails}
          className="opacity-70 group-hover:opacity-100 transition-opacity"
        >
          <Info className="w-4 h-4" />
        </Button>
        <Button
          variant="default"
          size="sm"
          onClick={onStart}
          className="bg-primary hover:bg-primary/90"
        >
          <Play className="w-4 h-4 mr-1" />
          Start
        </Button>
      </div>
    </motion.div>
  );
};

export default ExerciseListItem;