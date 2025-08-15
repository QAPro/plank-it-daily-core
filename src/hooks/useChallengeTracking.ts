
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { challengeService } from '@/services/challengeService';
import { useToast } from '@/hooks/use-toast';

export const useChallengeTracking = () => {
  const { user } = useAuth();
  const { toast } = useToast();

  const updateChallengeProgress = useCallback(async (sessionData: any) => {
    if (!user) return;

    try {
      // Get user's active challenges
      const userChallenges = await challengeService.getUserChallenges(user.id);
      
      // Update progress for each active challenge
      const updatePromises = userChallenges
        .filter(challenge => !challenge.user_participation?.completed)
        .map(challenge => 
          challengeService.updateChallengeProgress(
            user.id, 
            challenge.id, 
            sessionData
          )
        );

      await Promise.all(updatePromises);

      // Check for any newly completed challenges
      const updatedChallenges = await challengeService.getUserChallenges(user.id);
      const newlyCompleted = updatedChallenges.filter(challenge => 
        challenge.user_participation?.completed &&
        !userChallenges.find(orig => 
          orig.id === challenge.id && orig.user_participation?.completed
        )
      );

      // Show completion notifications
      newlyCompleted.forEach(challenge => {
        toast({
          title: "Challenge Completed! 🏆",
          description: `Congratulations! You've completed "${challenge.title}"`,
        });
      });

    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }, [user, toast]);

  return {
    updateChallengeProgress
  };
};
