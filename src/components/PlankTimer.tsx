
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, RotateCcw, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import SessionCompletionCelebration from "@/components/SessionCompletionCelebration";
import type { Tables } from '@/integrations/supabase/types';

type Exercise = Tables<'plank_exercises'>;

interface PlankTimerProps {
  exercise: Exercise;
  duration: number;
  onComplete: (timeElapsed: number) => void;
  onBack: () => void;
}

type TimerState = 'ready' | 'running' | 'paused' | 'completed';

const PlankTimer = ({ exercise, duration, onComplete, onBack }: PlankTimerProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [state, setState] = useState<TimerState>('ready');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const { toast } = useToast();
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const timeElapsed = duration - timeLeft;
  const progress = (timeElapsed / duration) * 100;

  useEffect(() => {
    if (state === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setState('completed');
            if (soundEnabled) {
              playCompletionSound();
            }
            // Show celebration instead of toast
            setShowCelebration(true);
            onComplete(duration);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [state, timeLeft, duration, soundEnabled, onComplete]);

  const playCompletionSound = () => {
    if (!soundEnabled) return;
    
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  };

  const handleStart = () => {
    setState('running');
  };

  const handlePause = () => {
    setState('paused');
  };

  const handleResume = () => {
    setState('running');
  };

  const handleStop = () => {
    setState('ready');
    setTimeLeft(duration);
    setShowCelebration(true);
    onComplete(timeElapsed);
  };

  const handleReset = () => {
    setState('ready');
    setTimeLeft(duration);
  };

  const handleCelebrationClose = () => {
    setShowCelebration(false);
  };

  const handleDoAgain = () => {
    setShowCelebration(false);
    handleReset();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getStateColor = () => {
    switch (state) {
      case 'running': return 'from-green-500 to-emerald-500';
      case 'paused': return 'from-yellow-500 to-amber-500';
      case 'completed': return 'from-purple-500 to-pink-500';
      default: return 'from-blue-500 to-cyan-500';
    }
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
        <Card className={`bg-gradient-to-br ${getStateColor()} text-white border-0 shadow-lg`}>
          <CardContent className="p-8 text-center">
            <motion.div
              key={timeLeft}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.2 }}
              className="text-6xl font-bold mb-4"
            >
              {formatTime(timeLeft)}
            </motion.div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/20 rounded-full h-3 mb-4">
              <motion.div
                className="bg-white rounded-full h-3"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            {/* State Indicator */}
            <div className="text-lg font-semibold">
              <AnimatePresence mode="wait">
                <motion.div
                  key={state}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {state === 'ready' && 'Ready to Start'}
                  {state === 'running' && 'Keep Going!'}
                  {state === 'paused' && 'Paused'}
                  {state === 'completed' && 'Completed!'}
                </motion.div>
              </AnimatePresence>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          {/* Primary Controls */}
          <div className="flex justify-center space-x-4">
            {state === 'ready' && (
              <Button
                onClick={handleStart}
                size="lg"
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8"
              >
                <Play className="w-5 h-5 mr-2" />
                Start
              </Button>
            )}

            {state === 'running' && (
              <Button
                onClick={handlePause}
                size="lg"
                className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-white px-8"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
            )}

            {state === 'paused' && (
              <>
                <Button
                  onClick={handleResume}
                  size="lg"
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Resume
                </Button>
                <Button
                  onClick={handleStop}
                  variant="outline"
                  size="lg"
                  className="px-6"
                >
                  <Square className="w-5 h-5 mr-2" />
                  Stop
                </Button>
              </>
            )}

            {state === 'completed' && (
              <Button
                onClick={handleReset}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-8"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Do Again
              </Button>
            )}
          </div>

          {/* Secondary Controls */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={onBack}
              className="px-6"
            >
              Back
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="px-3"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>

            {(state === 'running' || state === 'paused') && (
              <Button
                variant="outline"
                onClick={handleReset}
                className="px-6"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            )}
          </div>
        </div>

        {/* Tips */}
        {state === 'running' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 0.5 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center"
          >
            <p className="text-sm text-blue-800">
              💡 Keep your core tight and breathe steadily
            </p>
          </motion.div>
        )}
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
