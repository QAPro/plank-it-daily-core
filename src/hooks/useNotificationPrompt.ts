import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { usePushNotifications } from './usePushNotifications';

const STORAGE_KEY = 'notification_prompt_state';
const COOLDOWN_DAYS = 7; // Wait 7 days before asking again if user clicks "Later"

interface PromptState {
  hasBeenAsked: boolean;
  lastAskedDate: string | null;
  userDeclined: boolean;
  completedWorkouts: number;
}

export const useNotificationPrompt = () => {
  const { user } = useAuth();
  const { isSupported, isSubscribed } = usePushNotifications();
  const [shouldShowPrompt, setShouldShowPrompt] = useState(false);
  const [promptState, setPromptState] = useState<PromptState>({
    hasBeenAsked: false,
    lastAskedDate: null,
    userDeclined: false,
    completedWorkouts: 0
  });

  // Load state from localStorage
  useEffect(() => {
    if (!user) return;

    const stored = localStorage.getItem(`${STORAGE_KEY}_${user.id}`);
    if (stored) {
      try {
        const state = JSON.parse(stored);
        setPromptState(state);
      } catch (error) {
        console.error('[NotificationPrompt] Error loading state:', error);
      }
    }
  }, [user]);

  // Save state to localStorage
  const saveState = useCallback((state: PromptState) => {
    if (!user) return;
    
    localStorage.setItem(`${STORAGE_KEY}_${user.id}`, JSON.stringify(state));
    setPromptState(state);
  }, [user]);

  // Check if we should show the prompt
  const checkShouldShow = useCallback(() => {
    // Don't show if not supported or already subscribed
    if (!isSupported || isSubscribed) {
      return false;
    }

    // Don't show if user hasn't completed any workouts yet
    if (promptState.completedWorkouts === 0) {
      return false;
    }

    // Don't show if user has already been asked and hasn't waited cooldown period
    if (promptState.hasBeenAsked && promptState.lastAskedDate) {
      const lastAsked = new Date(promptState.lastAskedDate);
      const now = new Date();
      const daysSinceLastAsked = Math.floor((now.getTime() - lastAsked.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastAsked < COOLDOWN_DAYS) {
        return false;
      }
    }

    return true;
  }, [isSupported, isSubscribed, promptState]);

  // Trigger prompt after workout completion
  const triggerAfterWorkout = useCallback(() => {
    if (!user) return;

    console.log('[NotificationPrompt] Workout completed, checking if should show prompt');

    // Increment workout count
    const newCompletedWorkouts = promptState.completedWorkouts + 1;
    const newState = {
      ...promptState,
      completedWorkouts: newCompletedWorkouts
    };
    saveState(newState);

    console.log('[NotificationPrompt] Workout count:', newCompletedWorkouts);
    console.log('[NotificationPrompt] isSupported:', isSupported);
    console.log('[NotificationPrompt] isSubscribed:', isSubscribed);
    console.log('[NotificationPrompt] hasBeenAsked:', promptState.hasBeenAsked);

    // Don't show if not supported or already subscribed
    if (!isSupported) {
      console.log('[NotificationPrompt] Notifications not supported, skipping');
      return;
    }

    if (isSubscribed) {
      console.log('[NotificationPrompt] Already subscribed, skipping');
      return;
    }

    // Check cooldown period if user has been asked before
    if (promptState.hasBeenAsked && promptState.lastAskedDate) {
      const lastAsked = new Date(promptState.lastAskedDate);
      const now = new Date();
      const daysSinceLastAsked = Math.floor((now.getTime() - lastAsked.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastAsked < COOLDOWN_DAYS) {
        console.log('[NotificationPrompt] Still in cooldown period, skipping');
        return;
      }
    }

    // Show prompt after first workout
    if (newCompletedWorkouts === 1) {
      console.log('[NotificationPrompt] First workout completed, showing prompt!');
      setShouldShowPrompt(true);
    }
  }, [user, promptState, saveState, isSupported, isSubscribed]);

  // Trigger prompt at streak milestone
  const triggerAtStreakMilestone = useCallback((streakDays: number) => {
    if (!user) return;

    console.log('[NotificationPrompt] Streak milestone reached:', streakDays);

    // Show at 3-day streak if not already subscribed
    if (streakDays === 3 && checkShouldShow()) {
      console.log('[NotificationPrompt] 3-day streak milestone, showing prompt');
      setShouldShowPrompt(true);
    }
  }, [user, checkShouldShow]);

  // User clicked "Enable"
  const handleEnable = useCallback(() => {
    console.log('[NotificationPrompt] User clicked Enable');
    
    const newState = {
      ...promptState,
      hasBeenAsked: true,
      lastAskedDate: new Date().toISOString(),
      userDeclined: false
    };
    saveState(newState);
    setShouldShowPrompt(false);
    
    // The actual subscription will be handled by the component
    // that calls usePushNotifications().subscribe()
  }, [promptState, saveState]);

  // User clicked "Later"
  const handleLater = useCallback(() => {
    console.log('[NotificationPrompt] User clicked Later');
    
    const newState = {
      ...promptState,
      hasBeenAsked: true,
      lastAskedDate: new Date().toISOString(),
      userDeclined: true
    };
    saveState(newState);
    setShouldShowPrompt(false);
  }, [promptState, saveState]);

  // User closed the dialog
  const handleClose = useCallback(() => {
    console.log('[NotificationPrompt] User closed dialog');
    setShouldShowPrompt(false);
    // Don't update state - treat as same as "Later"
    handleLater();
  }, [handleLater]);

  // Reset state (for testing or if user manually enables in settings)
  const resetPromptState = useCallback(() => {
    if (!user) return;
    
    localStorage.removeItem(`${STORAGE_KEY}_${user.id}`);
    setPromptState({
      hasBeenAsked: false,
      lastAskedDate: null,
      userDeclined: false,
      completedWorkouts: 0
    });
  }, [user]);

  return {
    shouldShowPrompt,
    triggerAfterWorkout,
    triggerAtStreakMilestone,
    handleEnable,
    handleLater,
    handleClose,
    resetPromptState,
    promptState
  };
};
