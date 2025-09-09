import { motion } from "framer-motion";
import { Play, ChevronDown, Settings } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExercises } from "@/hooks/useExercises";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useQuickStart } from "@/hooks/useQuickStart";
import { useToast } from "@/hooks/use-toast";
import DurationIncrementControls from "./DurationIncrementControls";
import CompactStreakBadge from "./CompactStreakBadge";
import type { Tables } from "@/integrations/supabase/types";

type Exercise = Tables<'plank_exercises'>;

interface QuickStartTimerCardProps {
  onStartWorkout: (exerciseId: string, duration: number) => void;
}

const QuickStartTimerCard = ({ onStartWorkout }: QuickStartTimerCardProps) => {
  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const { preferences, updatePreferences } = useUserPreferences();
  const { quickStartData, isLoading: quickStartLoading } = useQuickStart();
  const { toast } = useToast();

  // Default to Basic Plank if no history
  const defaultExercise = exercises?.find(ex => ex.name === 'Basic Plank') || exercises?.[0];
  
  // Use last workout data or defaults
  const selectedExerciseId = preferences?.last_exercise_id || defaultExercise?.id || '';
  const selectedExercise = exercises?.find(ex => ex.id === selectedExerciseId) || defaultExercise;
  const currentDuration = preferences?.last_duration || 60; // Default 1 minute

  const handleDurationChange = async (newDuration: number) => {
    if (!preferences) return;
    
    await updatePreferences({
      last_duration: newDuration,
      last_workout_timestamp: new Date().toISOString()
    });
  };

  const handleExerciseChange = async (exerciseId: string) => {
    if (!preferences) return;
    
    await updatePreferences({
      last_exercise_id: exerciseId,
      last_workout_timestamp: new Date().toISOString()
    });
  };

  const handleStartWorkout = () => {
    if (!selectedExercise) {
      toast({
        title: "No exercise selected",
        description: "Please select an exercise first.",
        variant: "destructive",
      });
      return;
    }

    onStartWorkout(selectedExercise.id, currentDuration);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    if (minutes > 0) {
      return remainingSeconds > 0 ? `${minutes}:${remainingSeconds.toString().padStart(2, '0')}` : `${minutes}:00`;
    }
    return `${seconds}s`;
  };

  const getExerciseIcon = (exercise: Exercise) => {
    // Default icons based on exercise name or category
    const name = exercise.name.toLowerCase();
    if (name.includes('side')) return '🔄';
    if (name.includes('reverse')) return '🔄';
    if (name.includes('dynamic')) return '⚡';
    if (name.includes('advanced')) return '🔥';
    return '🏋️'; // Default plank icon
  };

  if (exercisesLoading || quickStartLoading) {
    return (
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-orange-200 rounded"></div>
            <div className="h-16 bg-orange-200 rounded"></div>
            <div className="h-10 bg-orange-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg">
        <CardContent className="p-6">
          {/* Header with Streak */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-muted-foreground">
                Ready to start
              </span>
            </div>
            <CompactStreakBadge />
          </div>

          {/* Timer Display */}
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-primary mb-2">
              {formatTime(currentDuration)}
            </div>
            <p className="text-muted-foreground">
              Last workout: {quickStartData ? formatTime(quickStartData.duration) : formatTime(currentDuration)}
            </p>
          </div>

          {/* Duration Controls */}
          <div className="flex justify-center mb-6">
            <DurationIncrementControls
              duration={currentDuration}
              onDurationChange={handleDurationChange}
            />
          </div>

          {/* Exercise Selection */}
          <div className="mb-6">
            <Select value={selectedExerciseId} onValueChange={handleExerciseChange}>
              <SelectTrigger className="w-full bg-white/80 border-orange-200">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{selectedExercise ? getExerciseIcon(selectedExercise) : '🏋️'}</span>
                  <SelectValue placeholder="Select exercise" />
                </div>
              </SelectTrigger>
              <SelectContent>
                {exercises?.map((exercise) => (
                  <SelectItem key={exercise.id} value={exercise.id}>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getExerciseIcon(exercise)}</span>
                      <span>{exercise.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        Level {exercise.difficulty_level}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Start Button */}
          <Button
            onClick={handleStartWorkout}
            size="lg"
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-4 text-lg shadow-lg"
          >
            <Play className="mr-2 h-5 w-5" />
            Start {formatTime(currentDuration)} {selectedExercise?.name || 'Workout'}
          </Button>

          {/* Quick Challenge Hint */}
          {quickStartData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-center"
            >
              <p className="text-sm text-muted-foreground">
                💪 Try beating your last {formatTime(quickStartData.duration)} session!
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuickStartTimerCard;