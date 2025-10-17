import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Info, Lock, Star } from "lucide-react";
import type { ExerciseWithCategory } from "@/hooks/useNewExercises";

interface ExerciseCardProps {
  exercise: ExerciseWithCategory;
  onStart: () => void;
  onViewDetails: () => void;
  index: number;
  isLocked?: boolean;
}

const getDifficultyStars = (level: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${
        i < level ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"
      }`}
    />
  ));
};

export const ExerciseCard = ({ exercise, onStart, onViewDetails, index, isLocked }: ExerciseCardProps) => {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
    >
      <Card 
        onClick={onViewDetails}
        className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${isLocked ? 'opacity-75' : 'hover:-translate-y-1'}`}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{exercise.name}</h3>
                {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex items-center gap-1 mb-3">
                {getDifficultyStars(exercise.difficulty_level)}
              </div>
              {exercise.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                  {exercise.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              onClick={(e) => {
                e.stopPropagation();
                onStart();
              }}
              disabled={isLocked}
            >
              {isLocked ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Premium
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start
                </>
              )}
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails();
              }}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
