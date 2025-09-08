import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, Crown } from 'lucide-react';
import { useStatusTracks } from '@/hooks/useStatusTracks';
import { TRACK_METADATA } from '@/services/statusTrackService';

// Compact component to show in dashboard or other locations
const StatusTrackPreview = () => {
  const { statusTracks, loading, getHighestLevelTrack, getTotalExperience } = useStatusTracks();

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardContent className="p-4">
          <div className="h-20 bg-muted rounded"></div>
        </CardContent>
      </Card>
    );
  }

  if (statusTracks.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Complete workouts to start earning status!</p>
        </CardContent>
      </Card>
    );
  }

  const highestTrack = getHighestLevelTrack();
  const totalXP = getTotalExperience();
  const topTracks = statusTracks.slice(0, 3);

  const getLevelIcon = (level: number) => {
    if (level >= 10) return <Crown className="w-3 h-3" />;
    if (level >= 5) return <Trophy className="w-3 h-3" />;
    return <Star className="w-3 h-3" />;
  };

  const getLevelBadgeColor = (level: number) => {
    if (level >= 10) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (level >= 7) return 'bg-gradient-to-r from-blue-500 to-purple-500';
    if (level >= 5) return 'bg-gradient-to-r from-green-500 to-blue-500';
    if (level >= 3) return 'bg-gradient-to-r from-yellow-500 to-green-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4 space-y-4">
        {/* Header Stats */}
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-bold">{totalXP.toLocaleString()}</div>
            <div className="text-xs text-muted-foreground">Total XP</div>
          </div>
          {highestTrack && (
            <Badge className={`${getLevelBadgeColor(highestTrack.track_level)} text-white border-0 flex items-center gap-1`}>
              {getLevelIcon(highestTrack.track_level)}
              <span>Level {highestTrack.track_level}</span>
            </Badge>
          )}
        </div>

        {/* Top Tracks */}
        <div className="space-y-2">
          {topTracks.map((track) => {
            const metadata = TRACK_METADATA[track.track_name as keyof typeof TRACK_METADATA];
            return (
              <div key={track.id} className="flex items-center gap-3">
                <div className="text-lg">{metadata?.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium truncate">
                      {metadata?.displayName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Lv. {track.track_level}
                    </div>
                  </div>
                  {track.track_level < 10 && (
                    <Progress 
                      value={track.level_progress} 
                      className="h-1.5 mt-1" 
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="text-center pt-2">
          <div className="text-xs text-primary hover:underline cursor-pointer">
            View All Tracks →
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatusTrackPreview;