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
  timerState?: 'ready' | 'running' | 'paused' | 'completed';
  timeLeft?: number;
  duration?: number;
  onDurationChange?: (duration: number) => void;
  onTimerControl?: {
    start: () => void;
    pause: () => void;
    resume: () => void;
    stop: () => void;
    reset: () => void;
  };
}

const QuickStartTimerCard = ({ 
  onStartWorkout, 
  timerState = 'ready', 
  timeLeft, 
  duration, 
  onDurationChange,
  onTimerControl 
}: QuickStartTimerCardProps) => {
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
    
    // Notify parent component about duration change
    onDurationChange?.(newDuration);
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
      {/* Mobile Layout - Stacked (< 768px) */}
      <div className="space-y-6 md:hidden">
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
                timeLeft={timeLeft || currentDuration}
                duration={duration || currentDuration}
                state={timerState}
                progress={duration ? ((duration - (timeLeft || 0)) / duration) * 100 : 0}
              />
        </div>

        {/* Timer Controls - Directly under timer */}
        <div className="flex justify-center gap-2 flex-wrap">
          {timerState === 'ready' && (
            <Button
              onClick={handleStartWorkout}
              size="lg"
              className="w-[200px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
            >
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          )}
          
          {timerState === 'running' && onTimerControl && (
            <>
              <Button 
                onClick={onTimerControl.pause}
                size="lg"
                variant="outline"
                className="w-24"
              >
                Pause
              </Button>
              <Button 
                onClick={onTimerControl.stop}
                size="lg"
                variant="destructive"
                className="w-24"
              >
                Stop
              </Button>
            </>
          )}
          
          {timerState === 'paused' && onTimerControl && (
            <>
              <Button 
                onClick={onTimerControl.resume}
                size="lg"
                className="w-28 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                Resume
              </Button>
              <Button 
                onClick={onTimerControl.stop}
                size="lg"
                variant="destructive"
                className="w-24"
              >
                Stop
              </Button>
            </>
          )}
          
          {timerState === 'completed' && onTimerControl && (
            <Button 
              onClick={() => {
                onTimerControl.reset();
                handleStartWorkout();
              }}
              size="lg"
              className="w-[200px] bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
            >
              Do Again
            </Button>
          )}
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
      </div>

      {/* Tablet Layout - Stacked but wider (768px - 1024px) */}
      <div className="hidden md:block lg:hidden">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Timer with Corner Badges */}
          <div className="relative mx-auto w-fit">
            {/* Corner Badges - Further from circle */}
            <div className="absolute -top-3 -left-3 z-10">
              <UserLevelBadge />
            </div>
            <div className="absolute -top-3 -right-3 z-10">
              <CompactStreakBadge />
            </div>
            <div className="absolute -bottom-3 -left-3 z-10">
              <PersonalBestBadge exerciseId={selectedExerciseId} />
            </div>
            <div className="absolute -bottom-3 -right-3 z-10">
              <TrendBadge exerciseId={selectedExerciseId} />
            </div>

            <CircularProgressTimer
              timeLeft={timeLeft || currentDuration}
              duration={duration || currentDuration}
              state={timerState}
              progress={duration ? ((duration - (timeLeft || 0)) / duration) * 100 : 0}
            />
          </div>

          {/* Timer Controls - Directly under timer */}
          <div className="flex justify-center gap-3 flex-wrap">
            {timerState === 'ready' && (
              <Button
                onClick={handleStartWorkout}
                size="lg"
                className="w-[280px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
              >
                <Play className="mr-2 h-4 w-4" />
                Start
              </Button>
            )}
            
            {timerState === 'running' && onTimerControl && (
              <>
                <Button 
                  onClick={onTimerControl.pause}
                  size="lg"
                  variant="outline"
                  className="w-32"
                >
                  Pause
                </Button>
                <Button 
                  onClick={onTimerControl.stop}
                  size="lg"
                  variant="destructive"
                  className="w-32"
                >
                  Stop
                </Button>
              </>
            )}
            
            {timerState === 'paused' && onTimerControl && (
              <>
                <Button 
                  onClick={onTimerControl.resume}
                  size="lg"
                  className="w-36 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  Resume
                </Button>
                <Button 
                  onClick={onTimerControl.stop}
                  size="lg"
                  variant="destructive"
                  className="w-32"
                >
                  Stop
                </Button>
              </>
            )}
            
            {timerState === 'completed' && onTimerControl && (
              <Button 
                onClick={() => {
                  onTimerControl.reset();
                  handleStartWorkout();
                }}
                size="lg"
                className="w-[280px] bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
              >
                Do Again
              </Button>
            )}
          </div>

          {/* Duration Controls */}
          <div className="flex justify-center">
            <DurationIncrementControls
              duration={currentDuration}
              onDurationChange={handleDurationChange}
            />
          </div>

          {/* Exercise Selection - Wider but contained */}
          <div className="max-w-md mx-auto">
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
        </div>
      </div>

      {/* Desktop Layout - Three Columns Optimized (> 1024px) */}
      <div className="hidden lg:block">
        <div className="flex items-start justify-between gap-16 max-w-7xl mx-auto px-8">
          {/* Left Column - Exercise Selection (Narrower) */}
          <div className="w-64 flex-shrink-0 pt-20">
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

          {/* Center Column - Timer (Flexible) */}
          <div className="flex-1 flex flex-col items-center space-y-6 min-w-0">
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
                timeLeft={timeLeft || currentDuration}
                duration={duration || currentDuration}
                state={timerState}
                progress={duration ? ((duration - (timeLeft || 0)) / duration) * 100 : 0}
              />
            </div>

            {/* Timer Controls - Centered under timer */}
            <div className="flex justify-center gap-4 flex-wrap">
              {timerState === 'ready' && (
                <Button
                  onClick={handleStartWorkout}
                  size="lg"
                  className="w-[320px] bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                >
                  <Play className="mr-2 h-4 w-4" />
                  Start
                </Button>
              )}
              
              {timerState === 'running' && onTimerControl && (
                <>
                  <Button 
                    onClick={onTimerControl.pause}
                    size="lg"
                    variant="outline"
                    className="w-36"
                  >
                    Pause
                  </Button>
                  <Button 
                    onClick={onTimerControl.stop}
                    size="lg"
                    variant="destructive"
                    className="w-36"
                  >
                    Stop
                  </Button>
                </>
              )}
              
              {timerState === 'paused' && onTimerControl && (
                <>
                  <Button 
                    onClick={onTimerControl.resume}
                    size="lg"
                    className="w-40 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  >
                    Resume
                  </Button>
                  <Button 
                    onClick={onTimerControl.stop}
                    size="lg"
                    variant="destructive"
                    className="w-36"
                  >
                    Stop
                  </Button>
                </>
              )}
              
              {timerState === 'completed' && onTimerControl && (
                <Button 
                  onClick={() => {
                    onTimerControl.reset();
                    handleStartWorkout();
                  }}
                  size="lg"
                  className="w-[320px] bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white"
                >
                  Do Again
                </Button>
              )}
            </div>
          </div>

          {/* Right Column - Duration Controls (Compact) */}
          <div className="w-56 flex-shrink-0 pt-20">
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