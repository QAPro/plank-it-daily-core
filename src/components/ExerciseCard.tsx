
import { motion } from "framer-motion";
import { Play, Clock, Target, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface ExerciseCardProps {
  exercise: Exercise;
  index: number;
  onStart: (exercise: Exercise) => void;
  onViewDetails: (exercise: Exercise) => void;
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
      className={`w-4 h-4 ${
        i < level ? "text-yellow-400 fill-current" : "text-gray-300"
      }`}
    />
  ));
};

const ExerciseCard = ({ exercise, index, onStart, onViewDetails }: ExerciseCardProps) => {
  const colorClass = difficultyColors[exercise.difficulty_level as keyof typeof difficultyColors] || "from-gray-400 to-gray-500";

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
    >
      <Card className="bg-white/80 backdrop-blur-sm border-orange-100 overflow-hidden">
        <CardContent className="p-0">
          <div className={`bg-gradient-to-r ${colorClass} p-4 text-white`}>
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xl font-bold">{exercise.name}</h3>
              <div className="flex space-x-1">
                {getDifficultyStars(exercise.difficulty_level)}
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Customizable
              </div>
              <div className="flex items-center">
                <Target className="w-4 h-4 mr-1" />
                Level {exercise.difficulty_level}
              </div>
            </div>
          </div>
          <div className="p-4">
            <p className="text-gray-600 mb-4 line-clamp-2">{exercise.description}</p>
            <div className="flex gap-2">
              <Button
                onClick={() => onStart(exercise)}
                className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-2 rounded-lg"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Exercise
              </Button>
              <Button
                variant="outline"
                onClick={() => onViewDetails(exercise)}
                className="px-3"
              >
                Details
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExerciseCard;
