import React from 'react';
import { useStatusTracks } from '@/hooks/useStatusTracks';
import { useReputation } from '@/hooks/useReputation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lock, Trophy, Users, Star, Crown, Shield, Camera, Music, MessageSquare } from 'lucide-react';

interface CrossSystemRequirement {
  type: 'track_level' | 'social_activity' | 'analytics_tier' | 'reputation_score' | 'multi_track_combo' | 'photo_sharing' | 'playlist_sharing' | 'post_limits' | 'leadership_role';
  track?: string;
  level?: number;
  socialActions?: number;
  reputationThreshold?: number;
  requiredTracks?: Array<{ track: string; level: number }>;
  leadershipRole?: 'moderator' | 'community_leader' | 'expert';
  description: string;
}

export type { CrossSystemRequirement };

interface CrossSystemGuardProps {
  requirements: CrossSystemRequirement[];
  children: React.ReactNode;
  fallbackTitle: string;
  fallbackDescription: string;
  upgradeAction?: () => void;
}

const CrossSystemGuard: React.FC<CrossSystemGuardProps> = ({
  requirements,
  children,
  fallbackTitle,
  fallbackDescription,
  upgradeAction
}) => {
  const { user } = useAuth();
  const { statusTracks, getTrackByName } = useStatusTracks();
  const { getTotalKarma } = useReputation(user?.id);

  const checkRequirement = (requirement: CrossSystemRequirement): boolean => {
    switch (requirement.type) {
      case 'track_level':
        if (!requirement.track || !requirement.level) return false;
        const userTrack = getTrackByName(requirement.track as any);
        return userTrack ? userTrack.track_level >= requirement.level : false;

      case 'social_activity':
        // Check if user meets social activity requirements (based on karma as proxy)
        return getTotalKarma() >= (requirement.socialActions || 5);

      case 'analytics_tier':
        // Require Level 5+ in at least 2 different tracks for advanced analytics
        const level5OrHigherTracks = statusTracks.filter(t => t.track_level >= 5);
        return level5OrHigherTracks.length >= 2;

      case 'reputation_score':
        return getTotalKarma() >= (requirement.reputationThreshold || 100);

      case 'multi_track_combo':
        if (!requirement.requiredTracks) return false;
        return requirement.requiredTracks.every(({ track, level }) => {
          const userTrack = getTrackByName(track as any);
          return userTrack ? userTrack.track_level >= level : false;
        });

      case 'photo_sharing':
        // Require reputation threshold + consistency track level
        const consistencyTrack = getTrackByName('consistency_champion');
        return getTotalKarma() >= 50 && consistencyTrack && consistencyTrack.track_level >= 3;

      case 'playlist_sharing':
        // Require social activity + consistency levels
        const socialActivityMet = getTotalKarma() >= 25;
        const consistencyLevel = getTrackByName('consistency_champion')?.track_level || 0;
        return socialActivityMet && consistencyLevel >= 2;

      case 'post_limits':
        // Higher reputation = higher post limits
        const karma = getTotalKarma();
        if (karma >= 500) return true; // Unlimited for high reputation
        if (karma >= 100) return true; // High limits
        if (karma >= 25) return true;  // Medium limits
        return false; // Basic limits

      case 'leadership_role':
        // Check if user qualifies for leadership role based on track levels and reputation
        const highLevel = Math.max(...statusTracks.map(t => t.track_level));
        const communityTrack = getTrackByName('community_leader')?.track_level || 0;
        const totalKarma = getTotalKarma();
        
        switch (requirement.leadershipRole) {
          case 'moderator':
            return highLevel >= 7 && totalKarma >= 200 && communityTrack >= 3;
          case 'community_leader':
            return highLevel >= 10 && totalKarma >= 500 && communityTrack >= 5;
          case 'expert':
            return highLevel >= 15 && totalKarma >= 1000;
          default:
            return false;
        }

      default:
        return false;
    }
  };

  const hasAccess = requirements.every(checkRequirement);
  const failedRequirements = requirements.filter(req => !checkRequirement(req));

  if (hasAccess) {
    return <>{children}</>;
  }

  const getRequirementIcon = (type: CrossSystemRequirement['type']) => {
    switch (type) {
      case 'track_level':
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 'social_activity':
        return <Users className="w-5 h-5 text-blue-500" />;
      case 'analytics_tier':
        return <Star className="w-5 h-5 text-purple-500" />;
      case 'reputation_score':
        return <Crown className="w-5 h-5 text-gold-500" />;
      case 'multi_track_combo':
        return <Trophy className="w-5 h-5 text-rainbow-500" />;
      case 'photo_sharing':
        return <Camera className="w-5 h-5 text-pink-500" />;
      case 'playlist_sharing':
        return <Music className="w-5 h-5 text-green-500" />;
      case 'post_limits':
        return <MessageSquare className="w-5 h-5 text-indigo-500" />;
      case 'leadership_role':
        return <Shield className="w-5 h-5 text-red-500" />;
      default:
        return <Lock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTrackDisplayName = (track: string) => {
    const trackNames: Record<string, string> = {
      core_strength: 'Core Master',
      consistency: 'Consistency Champion',
      endurance: 'Endurance Expert', 
      form_technique: 'Form Perfectionist',
      community_leader: 'Community Leader'
    };
    return trackNames[track] || track;
  };

  return (
    <Card className="border-2 border-dashed border-muted-foreground/30">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-muted">
          <Lock className="w-8 h-8 text-muted-foreground" />
        </div>
        <CardTitle className="flex items-center justify-center gap-2">
          {fallbackTitle}
        </CardTitle>
        <CardDescription>{fallbackDescription}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <p className="font-medium mb-3 text-sm">Requirements to unlock:</p>
          <div className="space-y-2">
            {failedRequirements.map((requirement, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                {getRequirementIcon(requirement.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {requirement.track && (
                      <Badge variant="outline" className="text-xs">
                        {getTrackDisplayName(requirement.track)}
                      </Badge>
                    )}
                    {requirement.level && (
                      <Badge variant="secondary" className="text-xs">
                        Level {requirement.level}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {requirement.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Trophy className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  Investment Web System
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                  Features are interconnected across tracks, social activity, and achievements. 
                  Progress in one area unlocks advanced capabilities in others.
                </p>
                {upgradeAction && (
                  <Button size="sm" onClick={upgradeAction}>
                    Start Building Progress
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CrossSystemGuard;