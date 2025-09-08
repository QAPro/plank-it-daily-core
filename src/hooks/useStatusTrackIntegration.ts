import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStatusTracks } from '@/hooks/useStatusTracks';
import { TrackName } from '@/services/statusTrackService';

// Hook to automatically award XP based on user activities
export const useStatusTrackIntegration = () => {
  const { user } = useAuth();
  const { awardExperience } = useStatusTracks();

  // Award XP for workout completion
  const awardWorkoutXP = (
    duration: number,
    exerciseType: string = 'plank',
    sessionData?: any
  ) => {
    if (!user) return;

    const baseXP = Math.min(duration / 10, 100); // 1 XP per 10 seconds, max 100

    // Award to multiple tracks based on workout characteristics
    const trackAwards: Array<{ track: TrackName; activity: string; xp: number }> = [];

    // Core Master Track - for plank/core exercises
    if (exerciseType.includes('plank') || exerciseType.includes('core')) {
      trackAwards.push({
        track: 'core_master',
        activity: 'plank_session',
        xp: baseXP
      });
    }

    // Consistency Champion - always award for completing any session
    trackAwards.push({
      track: 'consistency_champion',
      activity: 'session_complete',
      xp: Math.floor(baseXP * 0.5) // Half XP for consistency
    });

    // Endurance Expert - for longer sessions
    if (duration >= 300) { // 5+ minutes
      trackAwards.push({
        track: 'endurance_expert',
        activity: 'long_session',
        xp: Math.floor(baseXP * 1.5)
      });
    }

    // Award XP to all relevant tracks
    trackAwards.forEach(({ track, activity, xp }) => {
      awardExperience(track, xp, activity);
    });

    console.log('Awarded XP for workout:', {
      duration,
      exerciseType,
      awards: trackAwards
    });
  };

  // Award XP for achieving streaks
  const awardStreakXP = (streakDays: number) => {
    if (!user) return;

    const streakXP = streakDays * 10; // 10 XP per streak day

    awardExperience('consistency_champion', streakXP, 'daily_streak');
    
    console.log('Awarded streak XP:', { streakDays, xp: streakXP });
  };

  // Award XP for social interactions
  const awardSocialXP = (interactionType: string, points: number = 5) => {
    if (!user) return;

    awardExperience('community_leader', points, 'social_interaction');
    
    console.log('Awarded social XP:', { interactionType, points });
  };

  // Award XP for form/technique improvements
  const awardFormXP = (improvementType: string, points: number = 15) => {
    if (!user) return;

    awardExperience('form_perfectionist', points, 'technique_improvement');
    
    console.log('Awarded form XP:', { improvementType, points });
  };

  return {
    awardWorkoutXP,
    awardStreakXP,
    awardSocialXP,
    awardFormXP
  };
};

// Example usage in workout completion:
/*
const { awardWorkoutXP } = useStatusTrackIntegration();

// In workout completion handler:
const handleWorkoutComplete = (duration: number, exerciseId: string) => {
  // ... existing workout completion logic
  
  // Award XP for status tracks
  awardWorkoutXP(duration, 'plank', { exerciseId });
};
*/
