
import { useState, useEffect, useRef, useCallback } from "react";

type CountdownTimerState = 'setup' | 'ready' | 'running' | 'paused' | 'completed';

interface UseCountdownTimerProps {
  initialDuration?: number;
  onComplete: (wasCompleted: boolean) => void;
  onPlayCompletionSound: () => void;
  onPlayCountdownSound?: (secondsLeft: number) => void;
}

export const useCountdownTimer = ({ 
  initialDuration = 60,
  onComplete, 
  onPlayCompletionSound,
  onPlayCountdownSound
}: UseCountdownTimerProps) => {
  const [duration, setDuration] = useState(initialDuration);
  const [timeLeft, setTimeLeft] = useState(initialDuration);
  const [state, setState] = useState<CountdownTimerState>('setup');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('useCountdownTimer: useEffect triggered, state:', state, 'timeLeft:', timeLeft);
    if (state === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Play countdown sounds at 10, 5, 3, 2, 1
          if (onPlayCountdownSound && [10, 5, 3, 2, 1].includes(newTime)) {
            onPlayCountdownSound(newTime);
          }
          
          if (newTime <= 0) {
            console.log('useCountdownTimer: Timer reached zero, setting state to completed');
            setState('completed');
            onPlayCompletionSound();
            console.log('useCountdownTimer: About to call onComplete(true)');
            onComplete(true); // true means timer completed naturally
            return 0;
          }
          
          return newTime;
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
  }, [state, timeLeft, onComplete, onPlayCompletionSound, onPlayCountdownSound]);

  const setTimerDuration = useCallback((newDuration: number) => {
    console.log('useCountdownTimer: setTimerDuration called with:', newDuration);
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setState('ready');
  }, []);

  const handleStart = useCallback(() => {
    console.log('useCountdownTimer: handleStart called');
    setState('running');
  }, []);

  const handlePause = useCallback(() => {
    console.log('useCountdownTimer: handlePause called');
    setState('paused');
  }, []);

  const handleResume = useCallback(() => {
    console.log('useCountdownTimer: handleResume called');
    setState('running');
  }, []);

  const handleStop = useCallback(() => {
    console.log('useCountdownTimer: handleStop called');
    const timeElapsed = duration - timeLeft;
    setState('setup');
    setTimeLeft(duration);
    onComplete(false); // false means timer was stopped manually
  }, [duration, timeLeft, onComplete]);

  const handleReset = useCallback(() => {
    console.log('useCountdownTimer: handleReset called');
    setState('ready');
    setTimeLeft(duration);
  }, [duration]);

  const progress = duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0;

  return {
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
  };
};
