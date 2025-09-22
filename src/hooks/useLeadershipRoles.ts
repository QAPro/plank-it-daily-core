import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStatusTracks } from '@/hooks/useStatusTracks';
import { useReputation } from '@/hooks/useReputation';

export type LeadershipRole = 'moderator' | 'community_leader' | 'expert' | null;

interface LeadershipPerks {
  canModerate: boolean;
  exclusiveThemes: string[];
  postLimits: number;
  badgeColor: string;
  specialPrivileges: string[];
}

export const useLeadershipRoles = () => {
  const { user } = useAuth();
  const { statusTracks, getTrackByName } = useStatusTracks();
  const { getTotalKarma } = useReputation(user?.id);
  const [role, setRole] = useState<LeadershipRole>(null);
  const [perks, setPerks] = useState<LeadershipPerks | null>(null);

  useEffect(() => {
    if (!statusTracks.length) return;

    const highestLevel = Math.max(...statusTracks.map(t => t.track_level));
    const communityTrack = getTrackByName('community_leader')?.track_level || 0;
    const totalKarma = getTotalKarma();

    let currentRole: LeadershipRole = null;
    let currentPerks: LeadershipPerks = {
      canModerate: false,
      exclusiveThemes: [],
      postLimits: 10,
      badgeColor: 'gray',
      specialPrivileges: []
    };

    // Expert (highest tier)
    if (highestLevel >= 15 && totalKarma >= 1000) {
      currentRole = 'expert';
      currentPerks = {
        canModerate: true,
        exclusiveThemes: ['platinum', 'diamond', 'legendary'],
        postLimits: -1, // Unlimited
        badgeColor: 'platinum',
        specialPrivileges: [
          'Create exclusive challenges',
          'Access beta features',
          'Special expert badge',
          'Priority support',
          'Custom themes'
        ]
      };
    }
    // Community Leader (mid-high tier)
    else if (highestLevel >= 10 && totalKarma >= 500 && communityTrack >= 5) {
      currentRole = 'community_leader';
      currentPerks = {
        canModerate: true,
        exclusiveThemes: ['gold', 'emerald'],
        postLimits: 100,
        badgeColor: 'gold',
        specialPrivileges: [
          'Feature content',
          'Host community events',
          'Leader badge',
          'Advanced analytics'
        ]
      };
    }
    // Moderator (entry leadership tier)
    else if (highestLevel >= 7 && totalKarma >= 200 && communityTrack >= 3) {
      currentRole = 'moderator';
      currentPerks = {
        canModerate: true,
        exclusiveThemes: ['silver', 'bronze'],
        postLimits: 50,
        badgeColor: 'silver',
        specialPrivileges: [
          'Moderate discussions',
          'Help users',
          'Moderator badge'
        ]
      };
    }

    setRole(currentRole);
    setPerks(currentPerks);
  }, [statusTracks, getTotalKarma]);

  const hasRole = (requiredRole: LeadershipRole): boolean => {
    if (!requiredRole) return true;
    if (!role) return false;
    
    const roleHierarchy = { moderator: 1, community_leader: 2, expert: 3 };
    return roleHierarchy[role] >= roleHierarchy[requiredRole];
  };

  const getPostLimit = (): number => {
    return perks?.postLimits || 10;
  };

  const canModerate = (): boolean => {
    return perks?.canModerate || false;
  };

  const getExclusiveThemes = (): string[] => {
    return perks?.exclusiveThemes || [];
  };

  const getBadgeColor = (): string => {
    return perks?.badgeColor || 'gray';
  };

  const getSpecialPrivileges = (): string[] => {
    return perks?.specialPrivileges || [];
  };

  return {
    role,
    perks,
    hasRole,
    getPostLimit,
    canModerate,
    getExclusiveThemes,
    getBadgeColor,
    getSpecialPrivileges
  };
};