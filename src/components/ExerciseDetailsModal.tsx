
import { motion } from "framer-motion";
import { Play, Clock, Target, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface ExerciseDetailsModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
  onStart: (exercise: Exercise) => void;
}

const difficultyColors = {
  1: "from-green-400 to-green-500",
  2: "from-blue-400 to-blue-500", 
  3: "from-purple-400 to-purple-500",
  4: "from-orange-400 to-orange-500",
  5: "from-red-400 to-red-500"
};

const getDifficultyStars = (level: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-5 h-5 ${
        i < level ? "text-yellow-400 fill-current" : "text-gray-300"
      }`}
    />
  ));
};

const ExerciseDetailsModal = ({ exercise, isOpen, onClose, onStart }: ExerciseDetailsModalProps) => {
  if (!exercise) return null;

  const colorClass = difficultyColors[exercise.difficulty_level as keyof typeof difficultyColors] || "from-gray-400 to-gray-500";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="sr-only">{exercise.name} Details</DialogTitle>
        </DialogHeader>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {/* Header */}
          <div className={`bg-gradient-to-r ${colorClass} p-6 text-white rounded-t-lg -mx-6 -mt-6 mb-6`}>
            <div className="flex justify-between items-start mb-3">
              <h2 className="text-2xl font-bold">{exercise.name}</h2>
              <div className="flex space-x-1">
                {getDifficultyStars(exercise.difficulty_level)}
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Target className="w-5 h-5 mr-2" />
                Difficulty Level {exercise.difficulty_level}
              </div>
              <div className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Custom Duration
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Description</h3>
            <p className="text-gray-700 leading-relaxed">{exercise.description}</p>
          </div>

          {/* Instructions */}
          {exercise.instructions && exercise.instructions.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Instructions</h3>
              <ol className="space-y-2">
                {exercise.instructions.map((instruction, index) => (
                  <li key={index} className="flex items-start">
                    <span className="flex-shrink-0 w-6 h-6 bg-orange-500 text-white text-xs rounded-full flex items-center justify-center mr-3 mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{instruction}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              onClick={() => onStart(exercise)}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-lg"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Exercise
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Close
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export default ExerciseDetailsModal;
