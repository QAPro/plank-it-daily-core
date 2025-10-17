import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Lock, Crown } from "lucide-react";
import { motion } from "framer-motion";
import type { ExerciseWithCategory } from "@/hooks/useNewExercises";

interface ExerciseDetailsModalProps {
  exercise: ExerciseWithCategory | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: (exercise: ExerciseWithCategory) => void;
  isLocked?: boolean;
}


export const ExerciseDetailsModal = ({ exercise, isOpen, onClose, onStart, isLocked = false }: ExerciseDetailsModalProps) => {
  if (!exercise) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{exercise.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
              <h3 className="font-semibold mb-2">Instructions</h3>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                {(() => {
                  try {
                    const instructionsArray = typeof exercise.instructions === 'string' 
                      ? JSON.parse(exercise.instructions) 
                      : exercise.instructions;
                    
                    return instructionsArray.map((instruction: string, index: number) => (
                      <li key={index} className="leading-relaxed">{instruction}</li>
                    ));
                  } catch {
                    return <p className="text-muted-foreground">{exercise.instructions}</p>;
                  }
                })()}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button 
              className="flex-1" 
              onClick={() => onStart(exercise)}
              disabled={isLocked}
            >
              {isLocked ? (
                <>
                  <Lock className="h-4 w-4 mr-2" />
                  Upgrade to Premium
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Start Exercise
                </>
              )}
            </Button>
            <Button 
              variant="outline"
              onClick={onClose}
            >
              Close
            </Button>
          </div>

          {/* Premium Upgrade Message */}
          {isLocked && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg border border-amber-200"
            >
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-amber-900 mb-1">Premium Exercise</h4>
                  <p className="text-sm text-amber-800">
                    This advanced exercise is available with a Premium subscription. 
                    Upgrade to unlock all difficulty levels and achieve your fitness goals faster.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Exercise Disclaimer */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-muted-foreground text-center">
              Consult a physician before starting any exercise program. Stop if you feel pain.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
