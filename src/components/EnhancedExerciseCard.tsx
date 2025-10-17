
import { motion } from "framer-motion";
import { Play, Clock, Target, Star, TrendingUp, Heart, Trophy, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import FlagGuard from '@/components/access/FlagGuard';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'exercises'>;
type ExercisePerformance = Tables<'user_exercise_performance'>;

interface EnhancedExerciseCardProps {
  exercise: Exercise;
  index: number;
  onStart: (exercise: Exercise) => void;
  onViewDetails: (exercise: Exercise) => void;
  performance?: ExercisePerformance;
  recommendationType?: string;
  confidenceScore?: number;
  isFavorite?: boolean;
  onToggleFavorite?: (exerciseId: string) => void;
}

const difficultyColors = {
  1: "from-green-400 to-green-500",
  2: "from-blue-400 to-blue-500", 
  3: "from-purple-400 to-purple-500",
  4: "from-orange-400 to-orange-500",
  5: "from-red-400 to-red-500"
};

const recommendationConfig = {
  beginner_friendly: { icon: Star, color: 'bg-green-100 text-green-800', label: 'Beginner Friendly' },
  progressive_challenge: { icon: TrendingUp, color: 'bg-blue-100 text-blue-800', label: 'Progressive Challenge' },
  variety_boost: { icon: Zap, color: 'bg-purple-100 text-purple-800', label: 'Variety Boost' },
  skill_building: { icon: Target, color: 'bg-orange-100 text-orange-800', label: 'Skill Building' },
  recovery: { icon: Heart, color: 'bg-pink-100 text-pink-800', label: 'Recovery' },
};

const getDifficultyStars = (level: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`w-4 h-4 ${
        i < level ? "text-yellow-400 fill-current" : "text-gray-300"
      }`}
    />
  ));
};

const formatDuration = (seconds: number) => {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  return `${seconds}s`;
};

const EnhancedExerciseCard = ({ 
  exercise, 
  index, 
  onStart, 
  onViewDetails, 
  performance,
  recommendationType,
  confidenceScore,
  isFavorite,
  onToggleFavorite
}: EnhancedExerciseCardProps) => {
  const colorClass = difficultyColors[exercise.difficulty_level as keyof typeof difficultyColors] || "from-gray-400 to-gray-500";
  
  const recommendationInfo = recommendationType ? recommendationConfig[recommendationType as keyof typeof recommendationConfig] : null;

  return (
    <FlagGuard featureName="enhanced_exercise_cards">
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
      >
        <Card 
          className="bg-white/80 backdrop-blur-sm border-orange-100 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
          onClick={() => onViewDetails(exercise)}
        >
          <CardContent className="p-0">
            <div className={`bg-gradient-to-r ${colorClass} p-4 text-white relative`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold">{exercise.name}</h3>
                    {onToggleFavorite && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(exercise.id);
                        }}
                        className="p-1 h-auto hover:bg-white/20"
                      >
                        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current text-red-200' : 'text-white/60'}`} />
                      </Button>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex space-x-1">
                    {getDifficultyStars(exercise.difficulty_level)}
                  </div>
                  {performance && (
                    <div className="text-xs bg-white/20 px-2 py-1 rounded flex items-center gap-1">
                      <Trophy className="w-3 h-3" />
                      {formatDuration(performance.best_duration_seconds)}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm">
                {performance && (
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatDuration(performance.average_duration_seconds)} avg
                  </div>
                )}
                <div className="flex items-center">
                  <Target className="w-4 h-4 mr-1" />
                  Level {exercise.difficulty_level}
                </div>
                {performance && (
                  <div className="flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {performance.total_sessions} sessions
                  </div>
                )}
              </div>
            </div>

            <div className="p-4">
              {/* Recommendation Badge */}
              {recommendationInfo && (
                <div className="mb-3">
                  <Badge className={`${recommendationInfo.color} flex items-center gap-1 w-fit`}>
                    <recommendationInfo.icon className="w-3 h-3" />
                    {recommendationInfo.label}
                    {confidenceScore && confidenceScore > 0.8 && (
                      <span className="ml-1">🔥</span>
                    )}
                  </Badge>
                </div>
              )}

              <p className="text-gray-600 mb-4 line-clamp-2">{exercise.description}</p>
              


              <div className="flex gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    onStart(exercise);
                  }}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2 rounded-lg"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Exercise
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(exercise);
                  }}
                  className="px-3"
                >
                  Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </FlagGuard>
  );
};

export default EnhancedExerciseCard;
