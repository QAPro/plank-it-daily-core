import { motion } from "framer-motion";
import { Play, Info, Star, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Tables } from "@/integrations/supabase/types";

type Exercise = Tables<'plank_exercises'>;

interface CompactExerciseCardProps {
  exercise: Exercise;
  index: number;
  onStart: (exercise: Exercise) => void;
  onViewDetails: (exercise: Exercise) => void;
  onToggleFavorite?: (exercise: Exercise) => void;
  recommendationType?: string;
  confidenceScore?: number;
  isFavorite?: boolean;
}

const difficultyColors = {
  1: "from-green-400 to-emerald-500",
  2: "from-blue-400 to-cyan-500", 
  3: "from-yellow-400 to-orange-500",
  4: "from-orange-400 to-red-500",
  5: "from-red-400 to-pink-500",
};

const getDifficultyStars = (level: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-3 h-3 ${
        i < level 
          ? "fill-amber-400 text-amber-400" 
          : "fill-muted text-muted-foreground/30"
      }`}
    />
  ));
};

export const CompactExerciseCard = ({
  exercise,
  index,
  onStart,
  onViewDetails,
  onToggleFavorite,
  recommendationType,
  confidenceScore,
  isFavorite = false,
}: CompactExerciseCardProps) => {
  const gradientClass = difficultyColors[exercise.difficulty_level as keyof typeof difficultyColors] || difficultyColors[3];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileHover={{ y: -2 }}
    >
      <Card className="group hover:shadow-md transition-all duration-200 border-border/50 hover:border-border">
        <CardContent className="p-4">
          {/* Header with difficulty indicator */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-sm text-card-foreground truncate">
                  {exercise.name}
                </h3>
                {recommendationType && confidenceScore && (
                  <Badge variant="secondary" className="text-xs">
                    {Math.round(confidenceScore * 100)}%
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  {getDifficultyStars(exercise.difficulty_level)}
                </div>
                <span className="text-xs text-muted-foreground">
                  Level {exercise.difficulty_level}
                </span>
              </div>
            </div>
            
            {/* Favorite toggle */}
            {onToggleFavorite && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(exercise);
                }}
              >
                <Heart 
                  className={`w-4 h-4 ${
                    isFavorite 
                      ? "fill-red-500 text-red-500" 
                      : "text-muted-foreground hover:text-red-500"
                  }`} 
                />
              </Button>
            )}
          </div>

          {/* Category and tags */}
          <div className="flex items-center gap-2 mb-3">
            {exercise.category && (
              <Badge variant="outline" className="text-xs">
                {exercise.category}
              </Badge>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => onStart(exercise)}
              size="sm"
              className="flex-1 h-8 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-primary-foreground"
            >
              <Play className="w-3 h-3 mr-1" />
              Start
            </Button>
            <Button
              onClick={() => onViewDetails(exercise)}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <Info className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};