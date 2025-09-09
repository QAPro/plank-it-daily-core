import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useExercises } from "@/hooks/useExercises";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import DurationIncrementControls from "./DurationIncrementControls";
import CircularProgressTimer from "../timer/CircularProgressTimer";
import UserLevelBadge from "./UserLevelBadge";
import CompactStreakBadge from "./CompactStreakBadge";
import PersonalBestBadge from "./PersonalBestBadge";
import TrendBadge from "./TrendBadge";
import type { Tables } from "@/integrations/supabase/types";

type Exercise = Tables<'plank_exercises'>;

interface QuickStartTimerCardProps {
  onStartWorkout: (exerciseId: string, duration: number) => void;
}

const QuickStartTimerCard = ({ onStartWorkout }: QuickStartTimerCardProps) => {
  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const { preferences, updatePreferences } = useUserPreferences();
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


  if (exercisesLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-64 bg-muted rounded-lg"></div>
        <div className="h-10 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-4 px-4 sm:px-0"
    >
      {/* Timer with Corner Badges */}
      <div className="relative mx-2 sm:mx-0">
        {/* Corner Badges */}
        <div className="absolute top-3 left-3 z-10">
          <UserLevelBadge />
        </div>
        <div className="absolute top-3 right-3 z-10">
          <CompactStreakBadge />
        </div>
        {/* Side badges positioned at middle for mobile */}
        <div className="absolute top-1/2 -translate-y-1/2 left-1 z-10">
          <PersonalBestBadge exerciseId={selectedExerciseId} />
        </div>
        <div className="absolute top-1/2 -translate-y-1/2 right-1 z-10">
          <TrendBadge exerciseId={selectedExerciseId} />
        </div>

        <CircularProgressTimer
          timeLeft={currentDuration}
          duration={currentDuration}
          state="setup"
          progress={0}
        />
        
        {/* Duration Controls overlay at bottom center of timer */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-20 bg-background/90 backdrop-blur-sm rounded-lg p-2 sm:p-3 shadow-lg max-w-[85%] sm:max-w-[90%]">
          <DurationIncrementControls
            duration={currentDuration}
            onDurationChange={handleDurationChange}
          />
        </div>
      </div>

      {/* Exercise Selection */}
      <Select value={selectedExerciseId} onValueChange={handleExerciseChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select exercise" />
        </SelectTrigger>
        <SelectContent>
          {exercises?.map((exercise) => (
            <SelectItem key={exercise.id} value={exercise.id}>
              <div className="flex items-center justify-between w-full">
                <span>{exercise.name}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  Level {exercise.difficulty_level}
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Start Button */}
      <Button
        onClick={handleStartWorkout}
        size="lg"
        className="w-full"
      >
        <Play className="mr-2 h-4 w-4" />
        Start
      </Button>
    </motion.div>
  );
};

export default QuickStartTimerCard;