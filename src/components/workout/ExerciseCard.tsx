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
        className={`group bg-white rounded-2xl shadow-[0_4px_16px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] border-0 ${
          isLocked ? 'opacity-75' : 'hover:-translate-y-1 odd:rotate-[-0.5deg] even:rotate-[0.5deg] hover:rotate-0'
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-xl font-semibold text-[#2C3E50]">{exercise.name}</h3>
                {isLocked && <Lock className="h-4 w-4 text-[#7F8C8D]" />}
              </div>
              <div className="flex items-center gap-1 mb-3">
                {getDifficultyStars(exercise.difficulty_level)}
              </div>
              {exercise.description && (
                <p className="text-sm font-medium text-[#7F8C8D] line-clamp-2 mb-4">
                  {exercise.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              className={isLocked 
                ? "flex-1 h-10 text-sm font-semibold" 
                : "flex-1 h-10 text-sm font-semibold bg-gradient-to-br from-[#FF6B35] to-[#FDB961] text-white shadow-[0_4px_12px_rgba(255,107,53,0.3)] hover:shadow-[0_6px_16px_rgba(255,107,53,0.4)] border-0"
              }
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
              className="h-10 w-10 border-[#ECF0F1] hover:border-[#FF6B35] hover:text-[#FF6B35]"
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
