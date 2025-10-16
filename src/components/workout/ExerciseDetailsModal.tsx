import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, AlertTriangle, CheckCircle, Lightbulb } from "lucide-react";
import type { ExerciseWithCategory } from "@/hooks/useNewExercises";

interface ExerciseDetailsModalProps {
  exercise: ExerciseWithCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: (exercise: ExerciseWithCategory) => void;
}

const difficultyLabels: Record<number, string> = {
  1: "Beginner",
  2: "Easy",
  3: "Moderate",
  4: "Challenging",
  5: "Advanced",
};

export const ExerciseDetailsModal = ({ exercise, isOpen, onClose, onStart }: ExerciseDetailsModalProps) => {
  if (!exercise) return null;

  const difficultyLabel = difficultyLabels[exercise.difficulty_level] || "Moderate";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{exercise.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {difficultyLabel}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {Math.floor(exercise.duration_seconds / 60)}:{(exercise.duration_seconds % 60).toString().padStart(2, '0')}
            </Badge>
            {exercise.exercise_categories && (
              <Badge variant="secondary">
                {exercise.exercise_categories.name}
              </Badge>
            )}
          </div>

          {/* Description */}
          {exercise.description && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{exercise.description}</p>
            </div>
          )}

          {/* Instructions */}
          {exercise.instructions && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Instructions
              </h3>
              <p className="text-muted-foreground whitespace-pre-line">{exercise.instructions}</p>
            </div>
          )}

          {/* Benefits */}
          {exercise.benefits && exercise.benefits.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Benefits
              </h3>
              <ul className="space-y-1">
                {exercise.benefits.map((benefit, index) => (
                  <li key={index} className="text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modifications */}
          {exercise.modifications && exercise.modifications.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2">Modifications</h3>
              <ul className="space-y-1">
                {exercise.modifications.map((modification, index) => (
                  <li key={index} className="text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{modification}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Cautions */}
          {exercise.cautions && exercise.cautions.length > 0 && (
            <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2 text-orange-800 dark:text-orange-400">
                <AlertTriangle className="h-5 w-5" />
                Cautions
              </h3>
              <ul className="space-y-1">
                {exercise.cautions.map((caution, index) => (
                  <li key={index} className="text-orange-700 dark:text-orange-300 flex items-start gap-2 text-sm">
                    <span className="mt-1">•</span>
                    <span>{caution}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              className="flex-1" 
              onClick={() => onStart(exercise)}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Exercise
            </Button>
            <Button 
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
