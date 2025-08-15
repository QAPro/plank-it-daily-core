
import { supabase } from '@/integrations/supabase/client';
import type { CommunityChallenge } from '@/types/socialSharing';

export interface ChallengeParticipant {
  id: string;
  user_id: string;
  challenge_id: string;
  joined_at: string | null;
  progress_data: any | null;
  completed: boolean | null;
  completed_at: string | null;
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
  private mapParticipant(p: any): ChallengeParticipant {
    return {
      id: p.id,
      user_id: p.user_id,
      challenge_id: p.challenge_id,
      joined_at: p.joined_at ?? null,
      progress_data: p.progress_data ?? null,
      completed: p.completed ?? false,
      completed_at: p.completed_at ?? null,
    };
  }

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

      // For each challenge, get participants (no user profile fetch due to RLS)
      const challengesWithParticipants = await Promise.all(
        challenges.map(async (challenge) => {
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

          const participantsMapped: ChallengeParticipant[] = (participants || []).map((p) =>
            this.mapParticipant(p)
          );

          // Get user participation if userId provided
          let userParticipation: ChallengeParticipant | undefined = undefined;
          if (userId) {
            const { data: participation } = await supabase
              .from('challenge_participants')
              .select('*')
              .eq('challenge_id', challenge.id)
              .eq('user_id', userId)
              .maybeSingle();

            if (participation) {
              userParticipation = this.mapParticipant(participation);
            }
          }

          return {
            ...challenge,
            challenge_participants: participantsMapped,
            user_participation: userParticipation,
          } as ChallengeWithParticipants;
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
            .maybeSingle();

          if (!challenge) return null;

          const mappedParticipation = this.mapParticipant(participation);

          return {
            ...challenge,
            challenge_participants: [mappedParticipation],
            user_participation: mappedParticipation,
          } as ChallengeWithParticipants | null;
        })
      );

      // Avoid type predicate to prevent TS2677 mismatch; cast after filtering
      return challenges.filter((c) => c !== null) as ChallengeWithParticipants[];
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
          progress_data: { current_progress: 0 },
        });

      if (!error) {
        // Increment participant count via existing RPC
        await supabase.rpc('increment_challenge_participants', {
          challenge_id: challengeId,
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
        // Recompute participant_count safely (no supabase.raw available)
        const { count } = await supabase
          .from('challenge_participants')
          .select('id', { count: 'exact', head: true })
          .eq('challenge_id', challengeId);

        await supabase
          .from('community_challenges')
          .update({ participant_count: count || 0 })
          .eq('id', challengeId);
      }

      return !error;
    } catch (error) {
      console.error('Error leaving challenge:', error);
      return false;
    }
  }

  async updateChallengeProgress(userId: string, challengeId: string, sessionData: any): Promise<void> {
    try {
      const { data: participation } = await supabase
        .from('challenge_participants')
        .select('progress_data')
        .eq('user_id', userId)
        .eq('challenge_id', challengeId)
        .maybeSingle();

      if (!participation) return;

      const { data: challenge } = await supabase
        .from('community_challenges')
        .select('challenge_type, target_data')
        .eq('id', challengeId)
        .maybeSingle();

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
          completed_at: isCompleted ? new Date().toISOString() : null,
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

      const mapped: ChallengeParticipant[] = (participants || []).map((p) => this.mapParticipant(p));

      // Sort by progress (highest first) without attaching extra fields
      const sorted = mapped.sort((a, b) => {
        const aProg = (a.progress_data as any)?.current_progress || 0;
        const bProg = (b.progress_data as any)?.current_progress || 0;
        return bProg - aProg;
      });

      return sorted;
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

  private checkChallengeCompletion(challengeType: string, targetData: any, currentProgress: number): boolean {
    const target = targetData?.target_value || 0;
    return currentProgress >= target;
  }

  calculateChallengeProgress(challengeType: string, targetData: any, progressData: any): ChallengeProgress {
    const currentValue = progressData?.current_progress || 0;
    const targetValue = targetData?.target_value || 1;
    const percentage = Math.min((currentValue / targetValue) * 100, 100);
    const isCompleted = currentValue >= targetValue;

    return {
      current_value: currentValue,
      target_value: targetValue,
      percentage,
      is_completed: isCompleted,
    };
  }
}

export const challengeService = new ChallengeService();
