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
      className="px-4 sm:px-0"
    >
      {/* Mobile Layout - Stacked */}
      <div className="space-y-6 sm:hidden">
        {/* Timer with Corner Badges */}
        <div className="relative mx-auto w-fit">
          {/* Corner Badges - Further from circle */}
          <div className="absolute -top-2 -left-2 z-10">
            <UserLevelBadge />
          </div>
          <div className="absolute -top-2 -right-2 z-10">
            <CompactStreakBadge />
          </div>
          <div className="absolute -bottom-2 -left-2 z-10">
            <PersonalBestBadge exerciseId={selectedExerciseId} />
          </div>
          <div className="absolute -bottom-2 -right-2 z-10">
            <TrendBadge exerciseId={selectedExerciseId} />
          </div>

          <CircularProgressTimer
            timeLeft={currentDuration}
            duration={currentDuration}
            state="setup"
            progress={0}
          />
        </div>

        {/* Duration Controls */}
        <div className="flex justify-center">
          <DurationIncrementControls
            duration={currentDuration}
            onDurationChange={handleDurationChange}
          />
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

        {/* Start Button - Centered and smaller */}
        <div className="flex justify-center">
          <Button
            onClick={handleStartWorkout}
            size="lg"
            className="w-[200px]"
          >
            <Play className="mr-2 h-4 w-4" />
            Start
          </Button>
        </div>
      </div>

      {/* Desktop Layout - Three Columns */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-3 gap-8 items-start max-w-6xl mx-auto">
          {/* Left Column - Exercise Selection */}
          <div className="space-y-4 pt-20">
            <h3 className="text-lg font-semibold mb-4">Exercise</h3>
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
          </div>

          {/* Center Column - Timer */}
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              {/* Corner Badges - Further from circle */}
              <div className="absolute -top-4 -left-4 z-10">
                <UserLevelBadge />
              </div>
              <div className="absolute -top-4 -right-4 z-10">
                <CompactStreakBadge />
              </div>
              <div className="absolute -bottom-4 -left-4 z-10">
                <PersonalBestBadge exerciseId={selectedExerciseId} />
              </div>
              <div className="absolute -bottom-4 -right-4 z-10">
                <TrendBadge exerciseId={selectedExerciseId} />
              </div>

              <CircularProgressTimer
                timeLeft={currentDuration}
                duration={currentDuration}
                state="setup"
                progress={0}
              />
            </div>

            {/* Start Button - Centered under timer */}
            <Button
              onClick={handleStartWorkout}
              size="lg"
              className="w-[320px]"
            >
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          </div>

          {/* Right Column - Duration Controls */}
          <div className="space-y-4 pt-20">
            <h3 className="text-lg font-semibold mb-4">Duration</h3>
            <DurationIncrementControls
              duration={currentDuration}
              onDurationChange={handleDurationChange}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickStartTimerCard;