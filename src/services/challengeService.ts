
import { supabase } from '@/integrations/supabase/client';
import type { CommunityChallenge } from '@/types/socialSharing';

export interface ChallengeParticipant {
  id: string;
  user_id: string;
  challenge_id: string;
  joined_at: string;
  progress_data: any;
  completed: boolean;
  completed_at?: string;
  users?: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

export interface ChallengeWithParticipants extends CommunityChallenge {
  challenge_participants: ChallengeParticipant[];
  user_participation?: ChallengeParticipant;
}

export interface ChallengeProgress {
  current_value: number;
  target_value: number;
  percentage: number;
  is_completed: boolean;
}

export class ChallengeService {
  async getAvailableChallenges(userId?: string): Promise<ChallengeWithParticipants[]> {
    try {
      // First get all public challenges
      const { data: challenges, error } = await supabase
        .from('community_challenges')
        .select('*')
        .eq('is_public', true)
        .gte('end_date', new Date().toISOString().split('T')[0])
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching challenges:', error);
        return [];
      }

      if (!challenges) return [];

      // For each challenge, get participants with user info
      const challengesWithParticipants = await Promise.all(
        challenges.map(async (challenge) => {
          // Get participants for this challenge
          const { data: participants } = await supabase
            .from('challenge_participants')
            .select(`
              id,
              user_id,
              challenge_id,
              joined_at,
              progress_data,
              completed,
              completed_at
            `)
            .eq('challenge_id', challenge.id);

          // Get user info for participants
          const participantsWithUsers = participants ? await Promise.all(
            participants.map(async (participant) => {
              const { data: user } = await supabase
                .from('users')
                .select('id, username, full_name, avatar_url')
                .eq('id', participant.user_id)
                .maybeSingle();

              return {
                ...participant,
                users: user
              };
            })
          ) : [];

          // Get user participation if userId provided
          let userParticipation = null;
          if (userId) {
            const { data: participation } = await supabase
              .from('challenge_participants')
              .select('*')
              .eq('challenge_id', challenge.id)
              .eq('user_id', userId)
              .maybeSingle();
            
            userParticipation = participation;
          }

          return {
            ...challenge,
            challenge_participants: participantsWithUsers,
            user_participation: userParticipation
          };
        })
      );

      return challengesWithParticipants;
    } catch (error) {
      console.error('Error in getAvailableChallenges:', error);
      return [];
    }
  }

  async getUserChallenges(userId: string): Promise<ChallengeWithParticipants[]> {
    try {
      const { data: participations, error } = await supabase
        .from('challenge_participants')
        .select('*')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user challenges:', error);
        return [];
      }

      if (!participations) return [];

      const challenges = await Promise.all(
        participations.map(async (participation) => {
          const { data: challenge } = await supabase
            .from('community_challenges')
            .select('*')
            .eq('id', participation.challenge_id)
            .single();

          if (!challenge) return null;

          return {
            ...challenge,
            challenge_participants: [participation],
            user_participation: participation
          };
        })
      );

      return challenges.filter((c): c is ChallengeWithParticipants => c !== null);
    } catch (error) {
      console.error('Error in getUserChallenges:', error);
      return [];
    }
  }

  async joinChallenge(userId: string, challengeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .insert({
          user_id: userId,
          challenge_id: challengeId,
          progress_data: { current_progress: 0 }
        });

      if (!error) {
        // Increment participant count
        await supabase.rpc('increment_challenge_participants', {
          challenge_id: challengeId
        });
      }

      return !error;
    } catch (error) {
      console.error('Error joining challenge:', error);
      return false;
    }
  }

  async leaveChallenge(userId: string, challengeId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('challenge_participants')
        .delete()
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);

      if (!error) {
        // Decrement participant count
        const { error: updateError } = await supabase
          .from('community_challenges')
          .update({ 
            participant_count: supabase.raw('participant_count - 1')
          })
          .eq('id', challengeId);
      }

      return !error;
    } catch (error) {
      console.error('Error leaving challenge:', error);
      return false;
    }
  }

  async updateChallengeProgress(
    userId: string, 
    challengeId: string, 
    sessionData: any
  ): Promise<void> {
    try {
      const { data: participation } = await supabase
        .from('challenge_participants')
        .select('progress_data')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .single();

      if (!participation) return;

      const { data: challenge } = await supabase
        .from('community_challenges')
        .select('challenge_type, target_data')
        .eq('id', challengeId)
        .single();

      if (!challenge) return;

      const progressData = participation.progress_data as any;
      const currentProgress = progressData?.current_progress || 0;
      const newProgress = this.calculateProgressIncrement(
        challenge.challenge_type,
        challenge.target_data,
        sessionData,
        currentProgress
      );

      const isCompleted = this.checkChallengeCompletion(
        challenge.challenge_type,
        challenge.target_data,
        newProgress
      );

      await supabase
        .from('challenge_participants')
        .update({
          progress_data: { current_progress: newProgress },
          completed: isCompleted,
          completed_at: isCompleted ? new Date().toISOString() : null
        })
        .eq('user_id', userId)
        .eq('challenge_id', challengeId);

    } catch (error) {
      console.error('Error updating challenge progress:', error);
    }
  }

  async getChallengeLeaderboard(challengeId: string): Promise<ChallengeParticipant[]> {
    try {
      const { data: participants, error } = await supabase
        .from('challenge_participants')
        .select(`
          id,
          user_id,
          challenge_id,
          joined_at,
          progress_data,
          completed,
          completed_at
        `)
        .eq('challenge_id', challengeId)
        .order('completed', { ascending: false });

      if (error) {
        console.error('Error fetching leaderboard:', error);
        return [];
      }

      if (!participants) return [];

      // Get user info and sort by progress
      const participantsWithUsers = await Promise.all(
        participants.map(async (participant) => {
          const { data: user } = await supabase
            .from('users')
            .select('id, username, full_name, avatar_url')
            .eq('id', participant.user_id)
            .maybeSingle();

          const progressData = participant.progress_data as any;
          const currentProgress = progressData?.current_progress || 0;

          return {
            ...participant,
            users: user,
            current_progress: currentProgress
          };
        })
      );

      // Sort by progress (highest first)
      return participantsWithUsers.sort((a, b) => b.current_progress - a.current_progress);
    } catch (error) {
      console.error('Error in getChallengeLeaderboard:', error);
      return [];
    }
  }

  private calculateProgressIncrement(
    challengeType: string,
    targetData: any,
    sessionData: any,
    currentProgress: number
  ): number {
    switch (challengeType) {
      case 'duration':
        return currentProgress + (sessionData.duration_seconds || 0);
      case 'sessions':
        return currentProgress + 1;
      case 'streak':
        // Streak progress is handled differently - would need streak data
        return currentProgress;
      default:
        return currentProgress + (sessionData.duration_seconds || 0);
    }
  }

  private checkChallengeCompletion(
    challengeType: string,
    targetData: any,
    currentProgress: number
  ): boolean {
    const target = targetData?.target_value || 0;
    return currentProgress >= target;
  }

  calculateChallengeProgress(
    challengeType: string,
    targetData: any,
    progressData: any
  ): ChallengeProgress {
    const currentValue = progressData?.current_progress || 0;
    const targetValue = targetData?.target_value || 1;
    const percentage = Math.min((currentValue / targetValue) * 100, 100);
    const isCompleted = currentValue >= targetValue;

    return {
      current_value: currentValue,
      target_value: targetValue,
      percentage,
      is_completed: isCompleted
    };
  }
}

export const challengeService = new ChallengeService();
