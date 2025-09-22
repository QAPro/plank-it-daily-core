import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UseFirstWorkoutTimerProps {
  targetTime: number;
  onComplete: () => void;
}

export const useFirstWorkoutTimer = ({ targetTime, onComplete }: UseFirstWorkoutTimerProps) => {
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(0);
  const [hasCompleted, setHasCompleted] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive) {
      interval = setInterval(() => {
        setTime(time => {
          const newTime = time + 1;
          if (newTime >= targetTime && !hasCompleted) {
            setIsActive(false);
            setHasCompleted(true);
            onComplete();
          }
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, targetTime, hasCompleted, onComplete]);

  const startTimer = () => {
    setIsActive(true);
    setTime(0);
    setHasCompleted(false);
  };

  const stopTimer = async () => {
    setIsActive(false);
    if (time >= 10) { // Only count as completed if they held for at least 10 seconds
      setHasCompleted(true);
      onComplete();
      await saveWorkoutSession();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    setTime(0);
    setHasCompleted(false);
  };

  const saveWorkoutSession = async () => {
    if (!user) return;
    
    try {
      // Save the workout session with user agent and explicit timestamp
      await supabase.from('user_sessions').insert({
        user_id: user.id,
        duration_seconds: time,
        notes: 'First onboarding workout',
        user_agent: navigator.userAgent,
        completed_at: new Date().toISOString(),
      });

      // Update streak (this will be handled by the streak system)
      console.log('First workout completed:', time, 'seconds');
    } catch (error) {
      console.error('Error saving workout session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = Math.min((time / targetTime) * 100, 100);

  return {
    isActive,
    time,
    hasCompleted,
    progress,
    startTimer,
    stopTimer,
    resetTimer,
    formatTime,
  };
};
