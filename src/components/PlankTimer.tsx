import { useState } from "react";
import { motion } from "framer-motion";
import SessionCompletionCelebration from "@/components/SessionCompletionCelebration";
import TimerDisplay from "@/components/timer/TimerDisplay";
import TimerControls from "@/components/timer/TimerControls";
import TimerTips from "@/components/timer/TimerTips";
import { useTimerState } from "@/hooks/useTimerState";
import { useTimerAudio } from "@/hooks/useTimerAudio";
import { useEnhancedSessionTracking } from "@/hooks/useEnhancedSessionTracking";
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
  const [sessionResult, setSessionResult] = useState<any>(null);
  const { soundEnabled, playCompletionSound, toggleSound } = useTimerAudio();
  const { personalBests } = useEnhancedSessionTracking();

  const handleComplete = async (timeElapsed: number) => {
    setShowCelebration(true);
    
    // Calculate enhanced session data
    const previousBest = personalBests[exercise.id];
    const isPersonalBest = !previousBest || timeElapsed > previousBest;
    const caloriesEstimate = Math.round(2.5 * (1 + (exercise.difficulty_level - 1) * 0.2) * (timeElapsed / 60));
    
    setSessionResult({
      isPersonalBest,
      previousBest,
      caloriesEstimate,
      completionPercentage: Math.min((timeElapsed / duration) * 100, 100)
    });
    
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
    setSessionResult(null);
  };

  const handleDoAgain = () => {
    setShowCelebration(false);
    setSessionResult(null);
    handleReset();
  };

  const handleStopWithCelebration = () => {
    handleStop();
    setShowCelebration(true);
    
    // Calculate session data for partial completion
    const previousBest = personalBests[exercise.id];
    const caloriesEstimate = Math.round(2.5 * (1 + (exercise.difficulty_level - 1) * 0.2) * (timeElapsed / 60));
    
    setSessionResult({
      isPersonalBest: false,
      previousBest,
      caloriesEstimate,
      completionPercentage: Math.min((timeElapsed / duration) * 100, 100)
    });
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

      {/* Enhanced Session Completion Celebration */}
      <SessionCompletionCelebration
        isVisible={showCelebration}
        exercise={exercise}
        duration={duration}
        timeElapsed={timeElapsed}
        onClose={handleCelebrationClose}
        onDoAgain={handleDoAgain}
        isPersonalBest={sessionResult?.isPersonalBest}
        previousBest={sessionResult?.previousBest}
        caloriesEstimate={sessionResult?.caloriesEstimate}
        // Note: newAchievements and milestoneEvent would be passed from parent
        // when integrated with the full session tracking system
      />
    </>
  );
};

export default PlankTimer;
