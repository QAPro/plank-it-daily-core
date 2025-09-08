import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hookModelAnalytics } from '@/services/hookModelAnalytics';

export interface HookCycleTracker {
  startHookCycle: (triggerType: string, triggerData?: Record<string, any>) => Promise<string>;
  completeHookCycle: (
    cycleId: string,
    actionTaken: boolean,
    actionType?: string,
    actionDuration?: number,
    rewardGiven?: string,
    rewardData?: Record<string, any>,
    investmentActions?: Record<string, any>
  ) => Promise<void>;
  logFrictionPoint: (
    location: string,
    frictionType: string,
    frictionData?: Record<string, any>,
    impactScore?: number
  ) => Promise<void>;
  logTriggerEffectiveness: (
    triggerType: string,
    triggerContent: string,
    userContext?: Record<string, any>
  ) => Promise<string>;
  updateTriggerResponse: (logId: string, responseAction: string) => Promise<void>;
}

export const useHookModelTracking = (): HookCycleTracker => {
  const { user } = useAuth();

  const startHookCycle = useCallback(async (
    triggerType: string,
    triggerData: Record<string, any> = {}
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const cycleId = await hookModelAnalytics.trackHookCycle(
        user.id,
        triggerType as any,
        triggerData
      );
      
      // Store cycle ID in session storage for later completion
      sessionStorage.setItem('currentHookCycle', cycleId);
      
      return cycleId;
    } catch (error) {
      console.error('Failed to start hook cycle:', error);
      throw error;
    }
  }, [user]);

  const completeHookCycle = useCallback(async (
    cycleId: string,
    actionTaken: boolean,
    actionType?: string,
    actionDuration?: number,
    rewardGiven?: string,
    rewardData: Record<string, any> = {},
    investmentActions: Record<string, any> = {}
  ): Promise<void> => {
    try {
      await hookModelAnalytics.completeHookCycle(
        cycleId,
        actionTaken,
        actionType,
        actionDuration,
        rewardGiven,
        rewardData,
        investmentActions
      );
      
      // Clear stored cycle ID
      sessionStorage.removeItem('currentHookCycle');
    } catch (error) {
      console.error('Failed to complete hook cycle:', error);
      throw error;
    }
  }, []);

  const logFrictionPoint = useCallback(async (
    location: string,
    frictionType: string,
    frictionData: Record<string, any> = {},
    impactScore: number = 1
  ): Promise<void> => {
    if (!user) return;

    try {
      const sessionId = sessionStorage.getItem('currentSessionId');
      await hookModelAnalytics.logFrictionPoint(
        user.id,
        sessionId,
        frictionType,
        location,
        frictionData,
        impactScore
      );
    } catch (error) {
      console.error('Failed to log friction point:', error);
    }
  }, [user]);

  const logTriggerEffectiveness = useCallback(async (
    triggerType: string,
    triggerContent: string,
    userContext: Record<string, any> = {}
  ): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    try {
      const logId = await hookModelAnalytics.logTriggerEffectiveness(
        user.id,
        null, // notification ID can be null for non-notification triggers
        triggerType,
        triggerContent,
        userContext
      );
      
      // Store log ID for later response tracking
      sessionStorage.setItem('currentTriggerLog', logId);
      
      return logId;
    } catch (error) {
      console.error('Failed to log trigger effectiveness:', error);
      throw error;
    }
  }, [user]);

  const updateTriggerResponse = useCallback(async (
    logId: string,
    responseAction: string
  ): Promise<void> => {
    try {
      await hookModelAnalytics.updateTriggerResponse(
        logId,
        responseAction,
        new Date()
      );
    } catch (error) {
      console.error('Failed to update trigger response:', error);
    }
  }, []);

  return {
    startHookCycle,
    completeHookCycle,
    logFrictionPoint,
    logTriggerEffectiveness,
    updateTriggerResponse
  };
};

/**
 * Auto-tracking hook that integrates with existing session management
 */
export const useAutoHookTracking = () => {
  const hookTracker = useHookModelTracking();
  const { user } = useAuth();

  // Auto-start hook cycle when user navigates to workout
  const autoStartWorkoutCycle = useCallback(async (exerciseId?: string) => {
    try {
      const cycleId = await hookTracker.startHookCycle('habit', {
        exercise_id: exerciseId,
        source: 'app_navigation',
        timestamp: new Date().toISOString()
      });
      
      return cycleId;
    } catch (error) {
      console.warn('Failed to auto-start hook cycle:', error);
      return null;
    }
  }, [hookTracker]);

  // Auto-complete hook cycle when workout finishes
  const autoCompleteWorkoutCycle = useCallback(async (
    sessionDuration: number,
    exerciseCompleted: boolean,
    xpEarned?: number,
    achievementsUnlocked?: string[]
  ) => {
    const cycleId = sessionStorage.getItem('currentHookCycle');
    if (!cycleId) return;

    try {
      await hookTracker.completeHookCycle(
        cycleId,
        exerciseCompleted,
        exerciseCompleted ? 'workout_completed' : 'workout_started',
        sessionDuration,
        xpEarned ? 'xp' : undefined,
        {
          xp_amount: xpEarned,
          achievements: achievementsUnlocked
        },
        {
          session_completion: exerciseCompleted,
          duration_seconds: sessionDuration
        }
      );
    } catch (error) {
      console.warn('Failed to auto-complete hook cycle:', error);
    }
  }, [hookTracker]);

  // Auto-log friction points during user interactions
  const autoLogFriction = useCallback(async (
    component: string,
    event: 'slow_load' | 'error' | 'confusion' | 'abandonment',
    details: Record<string, any> = {}
  ) => {
    const impactScores = {
      slow_load: 3,
      error: 8,
      confusion: 5,
      abandonment: 9
    };

    try {
      await hookTracker.logFrictionPoint(
        component,
        event,
        {
          ...details,
          timestamp: new Date().toISOString(),
          user_agent: navigator.userAgent
        },
        impactScores[event]
      );
    } catch (error) {
      console.warn('Failed to auto-log friction:', error);
    }
  }, [hookTracker]);

  return {
    autoStartWorkoutCycle,
    autoCompleteWorkoutCycle,
    autoLogFriction,
    hookTracker
  };
};