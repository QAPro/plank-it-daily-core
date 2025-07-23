
import { useState, useEffect, useRef } from "react";

type TimerState = 'ready' | 'running' | 'paused' | 'completed';

interface UseTimerStateProps {
  duration: number;
  onComplete: (timeElapsed: number) => void;
  onPlayCompletionSound: () => void;
}

export const useTimerState = ({ duration, onComplete, onPlayCompletionSound }: UseTimerStateProps) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [state, setState] = useState<TimerState>('ready');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (state === 'running' && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setState('completed');
            onPlayCompletionSound();
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
  }, [state, timeLeft, duration, onComplete, onPlayCompletionSound]);

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
    const timeElapsed = duration - timeLeft;
    setState('ready');
    setTimeLeft(duration);
    onComplete(timeElapsed);
  };

  const handleReset = () => {
    setState('ready');
    setTimeLeft(duration);
  };

  return {
    timeLeft,
    state,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleReset,
  };
};
