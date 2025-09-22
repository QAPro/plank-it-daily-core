import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { RewardTimingService, RewardTimingContext, RewardDecision } from '@/services/rewardTimingService';
import { useDebounce } from '@/hooks/useDebounce';

export interface RewardTimingState {
  isActive: boolean;
  lastCheckTime?: Date;
  pendingRewards: RewardDecision[];
  debugInfo?: {
    context?: RewardTimingContext;
    lastDecision?: RewardDecision;
  };
}

export const useRewardTiming = () => {
  const { user } = useAuth();
  const [state, setState] = useState<RewardTimingState>({
    isActive: false,
    pendingRewards: []
  });
  
  const intervalRef = useRef<NodeJS.Timeout>();
  const debouncedUserId = useDebounce(user?.id, 1000);

  // Check for reward opportunities every 10 minutes
  const checkRewardTiming = async () => {
    if (!user?.id) return;

    try {
      console.log('Checking reward timing for user:', user.id);

      // Gather current context
      const context = await RewardTimingService.gatherUserContext(user.id);
      
      // Request decision from Edge Function
      const decision = await RewardTimingService.requestRewardDecision(context);

      setState(prev => ({
        ...prev,
        lastCheckTime: new Date(),
        debugInfo: { context, lastDecision: decision }
      }));

      // Handle reward decision
      if (decision.shouldSendReward) {
        console.log('Reward decision received:', decision);

        // For surprise XP, trigger immediate in-app nudge
        if (decision.rewardType === 'surprise_xp') {
          await RewardTimingService.triggerInAppNudge(decision.rewardType, decision.xpAmount);
        }

        // Add to pending rewards for UI feedback
        setState(prev => ({
          ...prev,
          pendingRewards: [...prev.pendingRewards.slice(-4), decision] // Keep last 5
        }));
      }

    } catch (error) {
      console.error('Error in reward timing check:', error);
    }
  };

  // Start/stop reward timing system
  const startRewardTiming = () => {
    if (!user?.id) return;

    setState(prev => ({ ...prev, isActive: true }));
    
    // Initial check after 30 seconds (let user settle in)
    setTimeout(() => {
      checkRewardTiming();
    }, 30000);

    // Regular checks every 10 minutes
    intervalRef.current = setInterval(checkRewardTiming, 10 * 60 * 1000);
    
    console.log('Reward timing system started');
  };

  const stopRewardTiming = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setState(prev => ({ ...prev, isActive: false }));
    console.log('Reward timing system stopped');
  };

  // Auto-start when user is authenticated
  useEffect(() => {
    if (debouncedUserId) {
      startRewardTiming();
    } else {
      stopRewardTiming();
    }

    return () => stopRewardTiming();
  }, [debouncedUserId]);

  // Listen for custom reward animations
  useEffect(() => {
    const handleRewardAnimation = (event: CustomEvent) => {
      console.log('Reward animation triggered:', event.detail);
      // Could trigger additional UI effects here
    };

    window.addEventListener('rewardAnimation', handleRewardAnimation as EventListener);
    return () => {
      window.removeEventListener('rewardAnimation', handleRewardAnimation as EventListener);
    };
  }, []);

  // Manual reward check (for testing/debug)
  const triggerManualCheck = async () => {
    await checkRewardTiming();
  };

  // Clear pending rewards (when user acknowledges)
  const clearPendingRewards = () => {
    setState(prev => ({ ...prev, pendingRewards: [] }));
  };

  return {
    ...state,
    triggerManualCheck,
    clearPendingRewards,
    startRewardTiming,
    stopRewardTiming
  };
};