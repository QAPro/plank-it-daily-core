
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
  const hasCompletedRef = useRef(false);

  useEffect(() => {
    if (state === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          const newTime = prev - 1;
          
          // Play countdown sounds at 10, 5, 3, 2, 1
          if (onPlayCountdownSound && [10, 5, 3, 2, 1].includes(newTime)) {
            onPlayCountdownSound(newTime);
          }
          
          if (newTime <= 0) {
            console.log('⏰ Timer reached 0, marking completion');
            hasCompletedRef.current = true;
            onPlayCompletionSound();
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
  }, [state, timeLeft, onPlayCompletionSound, onPlayCountdownSound]);

  // Separate effect to handle completion - runs AFTER timer cleanup
  useEffect(() => {
    if (timeLeft === 0 && state === 'running' && hasCompletedRef.current) {
      console.log('⏰ Timer completion effect triggered at', new Date().toISOString());
      hasCompletedRef.current = false; // Prevent double-firing
      onComplete(true);
      setState('completed');
    }
  }, [timeLeft, state, onComplete]);

  const setTimerDuration = useCallback((newDuration: number) => {
    
    setDuration(newDuration);
    setTimeLeft(newDuration);
    setState('ready');
  }, []);

  const handleStart = useCallback(() => {
    
    setState('running');
  }, []);

  const handlePause = useCallback(() => {
    
    setState('paused');
  }, []);

  const handleResume = useCallback(() => {
    
    setState('running');
  }, []);

  const handleStop = useCallback(() => {
    
    const timeElapsed = duration - timeLeft;
    setState('setup');
    setTimeLeft(duration);
    onComplete(false); // false means timer was stopped manually
  }, [duration, timeLeft, onComplete]);

  const handleReset = useCallback(() => {
    
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
