import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Lock, Star, Trophy, Crown } from 'lucide-react';
import { StatusTrack, TrackName, TRACK_METADATA } from '@/services/statusTrackService';
import { useStatusTracks } from '@/hooks/useStatusTracks';

interface StatusTrackCardProps {
  track: StatusTrack;
  onViewDetails?: () => void;
  showProgress?: boolean;
  compact?: boolean;
}

const StatusTrackCard = ({ 
  track, 
  onViewDetails, 
  showProgress = true,
  compact = false 
}: StatusTrackCardProps) => {
  const { getNextUnlockForTrack, getUnlockedFeaturesForTrack } = useStatusTracks();
  
  const metadata = TRACK_METADATA[track.track_name as TrackName];
  const nextUnlock = getNextUnlockForTrack(track.track_name as TrackName);
  const unlockedFeatures = getUnlockedFeaturesForTrack(track.track_name as TrackName);

  const getLevelBadgeColor = (level: number) => {
    if (level >= 10) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (level >= 7) return 'bg-gradient-to-r from-blue-500 to-purple-500';
    if (level >= 5) return 'bg-gradient-to-r from-green-500 to-blue-500';
    if (level >= 3) return 'bg-gradient-to-r from-yellow-500 to-green-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-4 h-4" />;
    if (level >= 7) return <Trophy className="w-4 h-4" />;
    if (level >= 3) return <Star className="w-4 h-4" />;
    return null;
  };

  if (compact) {
    return (
      <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={onViewDetails}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-2xl">{metadata?.icon}</div>
              <div>
                <div className="font-semibold text-sm">{metadata?.displayName}</div>
                <div className="text-xs text-muted-foreground">Level {track.track_level}</div>
              </div>
            </div>
            <Badge 
              className={`${getLevelBadgeColor(track.track_level)} text-white border-0 flex items-center gap-1`}
            >
              {getLevelIcon(track.track_level)}
              <span>Lv. {track.track_level}</span>
            </Badge>
          </div>
          {showProgress && track.track_level < 10 && (
            <div className="mt-3">
              <Progress value={track.level_progress} className="h-2" />
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl">{metadata?.icon}</div>
            <div>
              <CardTitle className="text-lg">{metadata?.displayName}</CardTitle>
              <CardDescription className="text-sm mt-1">
                {metadata?.description}
              </CardDescription>
            </div>
          </div>
          <Badge 
            className={`${getLevelBadgeColor(track.track_level)} text-white border-0 flex items-center gap-1`}
          >
            {getLevelIcon(track.track_level)}
            <span>Level {track.track_level}</span>
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        {showProgress && track.track_level < 10 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Level {track.track_level + 1}</span>
              <span>{Math.round(track.level_progress)}%</span>
            </div>
            <Progress value={track.level_progress} className="h-3" />
            {nextUnlock && (
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Lock className="w-3 h-3" />
                Next unlock: {nextUnlock.unlock_data.description}
              </div>
            )}
          </div>
        )}

        {track.track_level >= 10 && (
          <div className="text-center py-2">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm px-4 py-1">
              <Crown className="w-4 h-4 mr-1" />
              LEGEND STATUS ACHIEVED
            </Badge>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 text-center">
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {track.experience_points.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
          <div className="space-y-1">
            <div className="text-2xl font-bold text-primary">
              {unlockedFeatures.length}
            </div>
            <div className="text-xs text-muted-foreground">Features Unlocked</div>
          </div>
        </div>

        {/* Recent Unlocks */}
        {unlockedFeatures.length > 0 && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Recent Unlocks</div>
            <div className="space-y-1">
              {unlockedFeatures.slice(-2).map((unlock) => (
                <div key={unlock.id} className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="text-xs">
                    Level {unlock.level_required}
                  </Badge>
                  <span className="text-muted-foreground">
                    {unlock.unlock_data.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        {onViewDetails && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onViewDetails}
            className="w-full"
          >
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default StatusTrackCard;