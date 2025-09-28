
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Clock, Volume2, VolumeX, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import CircularProgressTimer from "@/components/timer/CircularProgressTimer";
import { useCountdownTimer } from "@/hooks/useCountdownTimer";
import { useEnhancedTimerAudio } from "@/hooks/useEnhancedTimerAudio";
import { toast } from "sonner";
import FlagGuard from '@/components/access/FlagGuard';
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface TimerSetupProps {
  exercise: Exercise;
  onStart: (duration: number) => void;
  onBack: () => void;
  onComplete?: (duration: number) => void; // Add completion callback
}

const presetTimes = [
  { label: "30 sec", value: 30 },
  { label: "1 min", value: 60 },
  { label: "2 min", value: 120 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
];

const TimerSetup = ({ exercise, onStart, onBack, onComplete }: TimerSetupProps) => {
  const [selectedTime, setSelectedTime] = useState(60);

  const {
    soundEnabled,
    countdownSoundsEnabled,
    playCompletionSound,
    playCountdownSound,
    toggleSound,
    toggleCountdownSounds,
  } = useEnhancedTimerAudio();

  const {
    duration,
    timeLeft,
    state,
    progress,
    setTimerDuration,
    handleStart,
    handlePause,
    handleResume,
    handleReset,
  } = useCountdownTimer({
    initialDuration: selectedTime,
    onComplete: (wasCompleted: boolean) => {
      if (wasCompleted) {
        toast.success("Timer completed! Great workout!");
        // Notify parent CountdownTimer about completion
        onComplete?.(duration);
      }
    },
    onPlayCompletionSound: playCompletionSound,
    onPlayCountdownSound: countdownSoundsEnabled ? playCountdownSound : undefined,
  });

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePresetSelect = (time: number) => {
    setSelectedTime(time);
    setTimerDuration(time);
  };

  const handleStartTimer = () => {
    handleStart();
    toast.success('Timer started! You can do this!');
  };

  const handlePauseTimer = () => {
    handlePause();
    toast.info('Timer paused');
  };

  const handleResumeTimer = () => {
    handleResume();
    toast.success('Timer resumed');
  };

  const handleResetTimer = () => {
    handleReset();
    toast.info('Timer reset');
  };

  return (
    <FlagGuard featureName="timer_setup">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="p-6 space-y-6"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack} className="flex items-center">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Set Your Timer</h2>
            <p className="text-gray-600">Choose duration for {exercise.name}</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSound}
              className="p-2"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Exercise Info */}
        <Card className="bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-800">{exercise.name}</h3>
                <p className="text-sm text-gray-600">Level {exercise.difficulty_level}</p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-orange-600">
                  {formatTime(selectedTime)}
                </div>
                <p className="text-xs text-gray-500">Selected Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Circular Timer Display */}
        <div className="flex justify-center">
          <div className="w-80">
            <CircularProgressTimer
              timeLeft={timeLeft}
              duration={duration}
              state={state}
              progress={progress}
            />
          </div>
        </div>

        {/* Timer Controls */}
        <div className="flex justify-center space-x-4 mb-4">
          {state === 'ready' && (
            <Button
              onClick={handleStartTimer}
              size="lg"
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
            >
              <Play className="w-5 h-5 mr-2" />
              Start Timer
            </Button>
          )}

          {state === 'running' && (
            <Button
              onClick={handlePauseTimer}
              size="lg"
              className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-8"
            >
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </Button>
          )}

          {state === 'paused' && (
            <div className="flex space-x-3">
              <Button
                onClick={handleResumeTimer}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6"
              >
                <Play className="w-5 h-5 mr-2" />
                Resume
              </Button>
              <Button
                onClick={handleResetTimer}
                variant="outline"
                size="lg"
                className="px-6"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </Button>
            </div>
          )}

          {state === 'completed' && (
            <Button
              onClick={handleResetTimer}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Do Again
            </Button>
          )}
        </div>

        {/* Preset Times */}
        <div>
          <h3 className="font-semibold mb-3 text-center">Quick Select Duration</h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {presetTimes.map((preset) => (
              <Button
                key={preset.value}
                variant={selectedTime === preset.value ? "default" : "outline"}
                onClick={() => handlePresetSelect(preset.value)}
                className="h-10 text-sm max-w-none"
                disabled={state === 'running'}
              >
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Final Action Button */}
        {state === 'completed' && (
          <div className="text-center pt-4">
            <Button
              onClick={() => onStart(duration)}
              className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold px-8"
            >
              Complete Workout
            </Button>
          </div>
        )}
      </motion.div>
    </FlagGuard>
  );
};

export default TimerSetup;
