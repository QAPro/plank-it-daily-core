import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Play, Info, Clock, Lock } from "lucide-react";
import type { ExerciseWithCategory } from "@/hooks/useNewExercises";

interface ExerciseCardProps {
  exercise: ExerciseWithCategory;
  onStart: () => void;
  onViewDetails: () => void;
  index: number;
  isLocked?: boolean;
}

const difficultyColors: Record<number, string> = {
  1: "bg-green-100 text-green-800",
  2: "bg-blue-100 text-blue-800",
  3: "bg-yellow-100 text-yellow-800",
  4: "bg-orange-100 text-orange-800",
  5: "bg-red-100 text-red-800",
};

const difficultyLabels: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Moderate",
  4: "Challenging",
  5: "Advanced",
};

export const ExerciseCard = ({ exercise, onStart, onViewDetails, index, isLocked }: ExerciseCardProps) => {
  const difficultyColor = difficultyColors[exercise.difficulty_level] || difficultyColors[3];
  const difficultyLabel = difficultyLabels[exercise.difficulty_level] || "Moderate";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 * index, duration: 0.3 }}
    >
      <Card className={`group hover:shadow-lg transition-all duration-300 ${isLocked ? 'opacity-75' : 'hover:-translate-y-1'}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-lg font-semibold">{exercise.name}</h3>
                {isLocked && <Lock className="h-4 w-4 text-muted-foreground" />}
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge className={difficultyColor}>
                  {difficultyLabel}
                </Badge>
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {Math.floor(exercise.duration_seconds / 60)}:{(exercise.duration_seconds % 60).toString().padStart(2, '0')}
                </Badge>
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
              onClick={onStart}
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
              onClick={onViewDetails}
            >
              <Info className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
