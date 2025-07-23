
import { useState } from "react";
import { motion } from "framer-motion";
import SessionCompletionCelebration from "@/components/SessionCompletionCelebration";
import TimerDisplay from "@/components/timer/TimerDisplay";
import TimerControls from "@/components/timer/TimerControls";
import TimerTips from "@/components/timer/TimerTips";
import { useTimerState } from "@/hooks/useTimerState";
import { useTimerAudio } from "@/hooks/useTimerAudio";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface PlankTimerProps {
  exercise: Exercise;
  duration: number;
  onComplete: (timeElapsed: number) => void;
  onBack: () => void;
}

const PlankTimer = ({ exercise, duration, onComplete, onBack }: PlankTimerProps) => {
  const [showCelebration, setShowCelebration] = useState(false);
  const { soundEnabled, playCompletionSound, toggleSound } = useTimerAudio();

  const handleComplete = (timeElapsed: number) => {
    setShowCelebration(true);
    onComplete(timeElapsed);
  };

  const {
    timeLeft,
    state,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleReset,
  } = useTimerState({
    duration,
    onComplete: handleComplete,
    onPlayCompletionSound: playCompletionSound,
  });

  const timeElapsed = duration - timeLeft;

  const handleCelebrationClose = () => {
    setShowCelebration(false);
  };

  const handleDoAgain = () => {
    setShowCelebration(false);
    handleReset();
  };

  const handleStopWithCelebration = () => {
    handleStop();
    setShowCelebration(true);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 space-y-6 max-w-md mx-auto"
      >
        {/* Exercise Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-1">{exercise.name}</h2>
          <p className="text-gray-600">Level {exercise.difficulty_level}</p>
        </div>

        {/* Timer Display */}
        <TimerDisplay timeLeft={timeLeft} duration={duration} state={state} />

        {/* Controls */}
        <TimerControls
          state={state}
          soundEnabled={soundEnabled}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onStop={handleStopWithCelebration}
          onReset={handleReset}
          onBack={onBack}
          onToggleSound={toggleSound}
        />

        {/* Tips */}
        <TimerTips state={state} />
      </motion.div>

      {/* Session Completion Celebration */}
      <SessionCompletionCelebration
        isVisible={showCelebration}
        exercise={exercise}
        duration={duration}
        timeElapsed={timeElapsed}
        onClose={handleCelebrationClose}
        onDoAgain={handleDoAgain}
      />
    </>
  );
};

export default PlankTimer;
