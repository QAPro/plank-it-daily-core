
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useExercises } from "@/hooks/useExercises";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useToast } from "@/hooks/use-toast";
import DurationIncrementControls from "./DurationIncrementControls";
import CircularProgressTimer from "../timer/CircularProgressTimer";
import UserLevelBadge from "./UserLevelBadge";
import CompactStreakBadge from "./CompactStreakBadge";
import TrendBadge from "./TrendBadge";
import WeeklyProgressBadge from "./WeeklyProgressBadge";
import type { Tables } from "@/integrations/supabase/types";
import { logger } from '@/utils/productionLogger';
import { useEffect } from 'react';

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
  selectedWorkout?: {exerciseId: string, duration: number} | null;
  selectedExercise?: string;
  userDisplayName?: string;
}

const QuickStartTimerCard = ({ 
  onStartWorkout, 
  timerState = 'ready', 
  timeLeft, 
  duration, 
  onDurationChange,
  onTimerControl,
  selectedWorkout,
  selectedExercise,
  userDisplayName 
}: QuickStartTimerCardProps) => {
  const { data: exercises, isLoading: exercisesLoading } = useExercises();
  const { preferences, updatePreferences } = useUserPreferences();
  const { toast } = useToast();

  // Robust exercise selection with proper fallbacks
  const getDefaultExercise = () => {
    if (!exercises || exercises.length === 0) return null;
    // Try to find Basic Plank first, then Gentle Marching in Place, then any exercise
    return exercises.find(ex => ex.name === 'Basic Plank') || 
           exercises.find(ex => ex.name === 'Gentle Marching in Place') || 
           exercises[0];
  };
  
  const defaultExercise = getDefaultExercise();
  
  // Use props as single source of truth, with proper fallback hierarchy
  const selectedExerciseId = selectedExercise || selectedWorkout?.exerciseId || preferences?.last_exercise_id || defaultExercise?.id || '';
  const selectedExerciseObj = exercises?.find(ex => ex.id === selectedExerciseId) || defaultExercise;
  // Default to user's last duration or 60 seconds (not 45)
  const currentDuration = duration || selectedWorkout?.duration || preferences?.last_duration || 60;

  // Force component to recognize selectedWorkout changes
  useEffect(() => {
    if (selectedWorkout?.exerciseId) {
        logger.debug('Selected workout changed', { selectedWorkout });
    }
  }, [selectedWorkout]);

  const handleDurationChange = (newDuration: number) => {
    // Let parent component handle duration change and preference saving
    onDurationChange?.(newDuration);
  };

  const handleStartWorkout = () => {
    if (!selectedExerciseObj) {
      toast({
        title: "No exercise selected",
        description: "Please select an exercise first.",
        variant: "destructive",
      });
      return;
    }

    onStartWorkout(selectedExerciseObj.id, currentDuration);
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
      {/* Mobile Layout - Side Badges (< 768px) */}
      <div className="md:hidden">
        {/* Welcome Header - Above timer */}
        {userDisplayName && (
          <div className="text-center mb-6">
            <h2 className="text-lg font-bold text-foreground">
              Hello{userDisplayName}!
            </h2>
          </div>
        )}

        {/* Timer with Side Badges using CSS Grid */}
        <div className="grid grid-cols-3 items-center gap-12 mx-auto w-fit">
          {/* Left Column - Badges */}
          <div className="flex flex-col gap-8 items-center">
            <div className="transform scale-90">
              <UserLevelBadge />
            </div>
            <div className="transform scale-90">
              <WeeklyProgressBadge />
            </div>
          </div>
          
          {/* Center Column - Timer */}
          <div className="flex justify-center">
            <CircularProgressTimer
              timeLeft={timeLeft || currentDuration}
              duration={duration || currentDuration}
              state={timerState}
              progress={duration ? ((duration - (timeLeft || 0)) / duration) * 100 : 0}
            />
          </div>
          
          {/* Right Column - Badges */}
          <div className="flex flex-col gap-8 items-center">
            <div className="transform scale-90">
              <CompactStreakBadge />
            </div>
            <div className="transform scale-90">
              <TrendBadge exerciseId={selectedExerciseId} />
            </div>
          </div>
        </div>

        {/* Timer Controls - With proper spacing */}
        <div className="flex justify-center gap-2 flex-wrap mt-6">
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
        <div className="flex justify-center mt-8">
          <DurationIncrementControls
            duration={currentDuration}
            onDurationChange={handleDurationChange}
          />
        </div>

        {/* Exercise Display */}
        <div className="text-center">
          <div className="text-base font-medium">
            {selectedExerciseObj?.name || 'Basic Plank'} 
            <span className="text-xs text-muted-foreground ml-2">
              Level {selectedExerciseObj?.difficulty_level || 1}
            </span>
          </div>
        </div>
      </div>

      {/* Tablet Layout - Side Badges (768px - 1024px) */}
      <div className="hidden md:block lg:hidden">
        <div className="max-w-4xl mx-auto">
          {/* Welcome Header - Above timer */}
          {userDisplayName && (
            <div className="text-center mb-8">
              <h2 className="text-xl font-bold text-foreground">
                Hello{userDisplayName}!
              </h2>
            </div>
          )}

          {/* Timer with Side Badges using CSS Grid */}
          <div className="grid grid-cols-3 items-center gap-18 mx-auto w-fit">
            {/* Left Column - Badges */}
            <div className="flex flex-col gap-12 items-center">
              <UserLevelBadge />
              <WeeklyProgressBadge />
            </div>
            
            {/* Center Column - Timer */}
            <div className="flex justify-center">
              <CircularProgressTimer
                timeLeft={timeLeft || currentDuration}
                duration={duration || currentDuration}
                state={timerState}
                progress={duration ? ((duration - (timeLeft || 0)) / duration) * 100 : 0}
              />
            </div>
            
            {/* Right Column - Badges */}
            <div className="flex flex-col gap-12 items-center">
              <CompactStreakBadge />
              <TrendBadge exerciseId={selectedExerciseId} />
            </div>
          </div>

          {/* Timer Controls - With proper spacing */}
          <div className="flex justify-center gap-3 flex-wrap mt-8">
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
          <div className="flex justify-center mt-10">
            <DurationIncrementControls
              duration={currentDuration}
              onDurationChange={handleDurationChange}
            />
          </div>

          {/* Exercise Display - Wider but contained */}
          <div className="max-w-md mx-auto text-center">
            <div className="text-lg font-medium">
              {selectedExerciseObj?.name || 'Basic Plank'} 
              <span className="text-sm text-muted-foreground ml-2">
                Level {selectedExerciseObj?.difficulty_level || 1}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Centered Vertical Layout (> 1024px) */}
      <div className="hidden lg:block">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Welcome Header - Centered above timer */}
          {userDisplayName && (
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground">
                Hello{userDisplayName}!
              </h2>
            </div>
          )}

          {/* Timer with Side Badges using CSS Grid */}
          <div className="grid grid-cols-3 items-center gap-24 mx-auto w-fit">
            {/* Left Column - Badges */}
            <div className="flex flex-col gap-16 items-center">
              <UserLevelBadge />
              <WeeklyProgressBadge />
            </div>
            
            {/* Center Column - Timer */}
            <div className="flex justify-center">
              <CircularProgressTimer
                timeLeft={timeLeft || currentDuration}
                duration={duration || currentDuration}
                state={timerState}
                progress={duration ? ((duration - (timeLeft || 0)) / duration) * 100 : 0}
              />
            </div>
            
            {/* Right Column - Badges */}
            <div className="flex flex-col gap-16 items-center">
              <CompactStreakBadge />
              <TrendBadge exerciseId={selectedExerciseId} />
            </div>
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

          {/* Duration Controls - Centered below start button */}
          <div className="flex justify-center">
            <DurationIncrementControls
              duration={currentDuration}
              onDurationChange={handleDurationChange}
            />
          </div>

          {/* Exercise Display - Centered below duration controls */}
          <div className="text-center">
            <div className="text-lg font-medium">
              {selectedExerciseObj?.name || 'Basic Plank'}
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              Level {selectedExerciseObj?.difficulty_level || 1}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuickStartTimerCard;