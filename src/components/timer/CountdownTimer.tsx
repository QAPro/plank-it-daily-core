
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';
import { toast } from 'sonner';
import TimerSetup from '@/components/TimerSetup';
import CircularProgressTimer from './CircularProgressTimer';
import EnhancedConfetti from '@/components/celebration/EnhancedConfetti';
import { useCountdownTimer } from '@/hooks/useCountdownTimer';
import { useEnhancedTimerAudio } from '@/hooks/useEnhancedTimerAudio';
import { useEnhancedSessionTracking } from '@/hooks/useEnhancedSessionTracking';
import SessionCompletionCelebration from '@/components/SessionCompletionCelebration';

interface CountdownTimerProps {
  selectedExercise: any;
  onBack: () => void;
  onExerciseChange: (exercise: any) => void;
}

const CountdownTimer = ({ selectedExercise, onBack, onExerciseChange }: CountdownTimerProps) => {
  const [showSetup, setShowSetup] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  
  const {
    soundEnabled,
    countdownSoundsEnabled,
    playCompletionSound,
    playCountdownSound,
    toggleSound,
    toggleCountdownSounds,
  } = useEnhancedTimerAudio();

  const {
    completeSession,
    completedSession,
    sessionNotes,
    setSessionNotes,
    isCompleting
  } = useEnhancedSessionTracking();

  const {
    duration,
    timeLeft,
    state,
    progress,
    setTimerDuration,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleReset,
  } = useCountdownTimer({
    initialDuration: 60,
    onComplete: async (wasCompleted: boolean) => {
      if (wasCompleted) {
        setShowConfetti(true);
        setTimeout(() => {
          setShowCelebration(true);
        }, 1000);
        await completeSession(duration, sessionNotes);
      }
    },
    onPlayCompletionSound: playCompletionSound,
    onPlayCountdownSound: countdownSoundsEnabled ? playCountdownSound : undefined,
  });

  useEffect(() => {
    if (completedSession) {
      setShowCelebration(true);
    }
  }, [completedSession]);

  const handleSetDuration = (newDuration: number) => {
    setTimerDuration(newDuration);
    setShowSetup(false);
    toast.success(`Timer set for ${Math.floor(newDuration / 60)}:${(newDuration % 60).toString().padStart(2, '0')}`);
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

  const handleStopTimer = () => {
    handleStop();
    toast.info('Timer stopped');
  };

  const handleResetTimer = () => {
    handleReset();
    setShowConfetti(false);
    setShowCelebration(false);
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    setShowConfetti(false);
    handleResetTimer();
  };

  if (showSetup) {
    return (
      <TimerSetup
        exercise={selectedExercise}
        onStart={handleSetDuration}
        onBack={onBack}
      />
    );
  }

  return (
    <>
      <div className="w-full max-w-md mx-auto space-y-6 relative">
        {/* Enhanced Confetti */}
        <EnhancedConfetti 
          isActive={showConfetti} 
          intensity="epic"
          duration={3000}
        />

        {/* Exercise Header */}
        <Card>
          <CardHeader className="text-center pb-2">
            <CardTitle className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={onBack}>
                ← Back
              </Button>
              <span className="text-lg">{selectedExercise?.name}</span>
              <div className="flex space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSound}
                  className="p-2"
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleCountdownSounds}
                  className="p-2"
                  disabled={!soundEnabled}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </CardTitle>
            {selectedExercise && (
              <p className="text-sm text-gray-600">
                Level {selectedExercise.difficulty_level} • {selectedExercise.primary_muscles?.join(', ')}
              </p>
            )}
          </CardHeader>
        </Card>

        {/* Circular Progress Timer */}
        <CircularProgressTimer
          timeLeft={timeLeft}
          duration={duration}
          state={state}
          progress={progress}
        />

        {/* Timer Controls */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center space-x-3 mb-4">
              <AnimatePresence mode="wait">
                {state === 'ready' && (
                  <motion.div
                    key="start"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={handleStartTimer}
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Start Timer
                    </Button>
                  </motion.div>
                )}

                {state === 'running' && (
                  <motion.div
                    key="pause"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={handlePauseTimer}
                      size="lg"
                      className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-8"
                    >
                      <Pause className="w-5 h-5 mr-2" />
                      Pause
                    </Button>
                  </motion.div>
                )}

                {state === 'paused' && (
                  <motion.div
                    key="resume"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="flex space-x-3"
                  >
                    <Button
                      onClick={handleResumeTimer}
                      size="lg"
                      className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
                    >
                      <Play className="w-5 h-5 mr-2" />
                      Resume
                    </Button>
                    <Button
                      onClick={handleStopTimer}
                      variant="outline"
                      size="lg"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop
                    </Button>
                  </motion.div>
                )}

                {state === 'completed' && (
                  <motion.div
                    key="completed"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    <Button
                      onClick={handleResetTimer}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8"
                    >
                      <RotateCcw className="w-5 h-5 mr-2" />
                      Do Again
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Reset Button (always available when timer is set up) */}
            {state !== 'completed' && (
              <div className="text-center">
                <Button
                  onClick={handleResetTimer}
                  variant="ghost"
                  size="sm"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset Timer
                </Button>
              </div>
            )}

            {/* Session Notes */}
            {(state === 'paused' || state === 'completed') && (
              <div className="mt-4 space-y-2">
                <label className="text-sm font-medium">Session Notes (Optional):</label>
                <textarea
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="How is this workout feeling? Any observations?"
                  rows={3}
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Session Completion Celebration */}
      {showCelebration && completedSession && (
        <SessionCompletionCelebration
          isVisible={showCelebration}
          duration={completedSession.duration}
          timeElapsed={completedSession.duration}
          exercise={completedSession.exercise}
          newAchievements={completedSession.achievements}
          onClose={handleCloseCelebration}
        />
      )}
    </>
  );
};

export default CountdownTimer;
