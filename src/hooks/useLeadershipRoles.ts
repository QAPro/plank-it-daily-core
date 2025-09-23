import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoles } from '@/hooks/useRoles';

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
  const { hasRole } = useRoles();
  const [role, setRole] = useState<LeadershipRole>(null);
  const [perks, setPerks] = useState<LeadershipPerks | null>(null);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setPerks(null);
      return;
    }

    // Only check assigned roles from user_roles table
    // No automatic role assignment based on achievements
    let currentRole: LeadershipRole = null;
    let currentPerks: LeadershipPerks = {
      canModerate: false,
      exclusiveThemes: [],
      postLimits: 10,
      badgeColor: 'gray',
      specialPrivileges: []
    };

    // Check assigned roles only
    if (hasRole('admin')) {
      // Admins get expert-level perks
      currentRole = 'expert';
      currentPerks = {
        canModerate: true,
        exclusiveThemes: ['platinum', 'diamond', 'legendary'],
        postLimits: -1, // Unlimited
        badgeColor: 'platinum',
        specialPrivileges: [
          'Admin privileges',
          'Create exclusive challenges',
          'Access beta features',
          'Special expert badge',
          'Priority support',
          'Custom themes'
        ]
      };
    } else if (hasRole('moderator')) {
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
    // Note: community_leader role would go here if added to app_role enum

    setRole(currentRole);
    setPerks(currentPerks);
  }, [user, hasRole]);

  const hasLeadershipRole = (requiredRole: LeadershipRole): boolean => {
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
    hasRole: hasLeadershipRole,
    getPostLimit,
    canModerate,
    getExclusiveThemes,
    getBadgeColor,
    getSpecialPrivileges
  };
};