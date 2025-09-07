import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { QuickStartService, QuickStartData } from '@/services/quickStartService';
import { ProgressiveDifficultyService, ProgressionSuggestion } from '@/services/progressiveDifficultyService';

export const useQuickStart = () => {
  const { user } = useAuth();
  const [quickStartData, setQuickStartData] = useState<QuickStartData | null>(null);
  const [nextChallenge, setNextChallenge] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadQuickStartData();
  }, [user]);

  const loadQuickStartData = async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const lastWorkout = await QuickStartService.getLastWorkout(user.id);
      
      if (lastWorkout && QuickStartService.isRecent(lastWorkout.timestamp)) {
        setQuickStartData(lastWorkout);
        
        // Get next challenge message
        const challenge = await ProgressiveDifficultyService.getNextChallenge(
          user.id, 
          lastWorkout.exerciseId
        );
        setNextChallenge(challenge);
      }
    } catch (error) {
      console.error('Error loading quick start data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateLastWorkout = async (exerciseId: string, duration: number) => {
    if (!user) return;
    
    await QuickStartService.updateLastWorkout(user.id, exerciseId, duration);
    await loadQuickStartData(); // Refresh the data
  };

  const getProgressionSuggestion = async (exerciseId: string, currentDuration: number): Promise<ProgressionSuggestion | null> => {
    if (!user) return null;
    
    return await ProgressiveDifficultyService.generateSuggestion(user.id, exerciseId, currentDuration);
  };

  return {
    quickStartData,
    nextChallenge,
    isLoading,
    updateLastWorkout,
    getProgressionSuggestion,
    refresh: loadQuickStartData
  };
};