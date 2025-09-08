import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ReputationService, UserReputation, UserStatusTrack } from '@/services/reputationService';

export const useReputation = (targetUserId?: string) => {
  const { user } = useAuth();
  const userId = targetUserId || user?.id;
  
  const [reputation, setReputation] = useState<UserReputation[]>([]);
  const [statusTracks, setStatusTracks] = useState<UserStatusTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReputation = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const [reputationData, tracksData] = await Promise.all([
        ReputationService.getUserReputation(userId),
        ReputationService.getUserStatusTracks(userId)
      ]);
      
      setReputation(reputationData);
      setStatusTracks(tracksData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch reputation');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReputation();
  }, [userId]);

  const awardKudos = async (targetUserId: string, domain = 'general', note?: string) => {
    if (!user || user.id === targetUserId) return;

    try {
      await ReputationService.awardReputation({
        user_id: targetUserId,
        actor_id: user.id,
        event_type: 'kudos',
        domain,
        points: 5,
        note
      });
      
      // Refresh if we're viewing the target user's reputation
      if (targetUserId === userId) {
        await fetchReputation();
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Failed to award kudos');
    }
  };

  const getTotalKarma = () => {
    return reputation.reduce((total, rep) => total + rep.karma_score, 0);
  };

  const getHighestReputation = () => {
    return reputation.length > 0 ? reputation[0] : null;
  };

  const getReputationLevel = () => {
    const totalKarma = getTotalKarma();
    return ReputationService.getReputationLevel(totalKarma);
  };

  return {
    reputation,
    statusTracks,
    loading,
    error,
    awardKudos,
    getTotalKarma,
    getHighestReputation,
    getReputationLevel,
    refetch: fetchReputation
  };
};