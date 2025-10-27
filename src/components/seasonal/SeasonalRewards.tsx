import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Clock, Gift, Star, Trophy, Calendar } from 'lucide-react';
import { useStatusTracks } from '@/hooks/useStatusTracks';
import { useReputation } from '@/hooks/useReputation';
import { useAuth } from '@/contexts/AuthContext';

interface SeasonalReward {
  id: string;
  title: string;
  description: string;
  type: 'theme' | 'badge' | 'privilege' | 'feature';
  requirement: {
    tracks?: Array<{ track: string; level: number }>;
    reputation?: number;
    timeLimit?: Date;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  expiresAt: Date;
  isActive: boolean;
}

const SeasonalRewards: React.FC = () => {
  const { user } = useAuth();
  const { statusTracks, getTrackByName, loading: statusTracksLoading } = useStatusTracks();
  const { getTotalKarma, loading: reputationLoading } = useReputation();
  const [currentSeason, setCurrentSeason] = useState<string>('Winter Challenge 2024');
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  // Early return if user is not authenticated or data is still loading
  if (!user || statusTracksLoading || reputationLoading) {
    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mb-4" />
            <p className="text-muted-foreground">Loading seasonal rewards...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Mock seasonal rewards - in production, these would come from the database
  const seasonalRewards: SeasonalReward[] = [
    {
      id: '1',
      title: 'Frost Master Theme',
      description: 'Exclusive winter-themed UI with snowfall effects',
      type: 'theme',
      requirement: {
        tracks: [
          { track: 'consistency', level: 8 },
          { track: 'endurance', level: 6 }
        ]
      },
      rarity: 'epic',
      expiresAt: new Date('2024-12-31'),
      isActive: true
    },
    {
      id: '2',
      title: 'Winter Warrior Badge',
      description: 'Show your dedication through the cold months',
      type: 'badge',
      requirement: {
        reputation: 300,
        tracks: [{ track: 'consistency', level: 5 }]
      },
      rarity: 'rare',
      expiresAt: new Date('2024-12-31'),
      isActive: true
    },
    {
      id: '3',
      title: 'Season Champion Privileges',
      description: 'Special moderation powers and exclusive features',
      type: 'privilege',
      requirement: {
        tracks: [
          { track: 'community_leader', level: 7 },
          { track: 'consistency', level: 10 }
        ],
        reputation: 500
      },
      rarity: 'legendary',
      expiresAt: new Date('2024-12-31'),
      isActive: true
    }
  ];

  useEffect(() => {
    const updateTimeRemaining = () => {
      const now = new Date();
      const seasonEnd = new Date('2024-12-31');
      const diff = seasonEnd.getTime() - now.getTime();
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeRemaining(`${days}d ${hours}h remaining`);
      } else {
        setTimeRemaining('Season ended');
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkRewardEligibility = (reward: SeasonalReward): boolean => {
    const { requirement } = reward;
    
    // Check track requirements
    if (requirement.tracks) {
      const tracksMet = requirement.tracks.every(({ track, level }) => {
        const userTrack = getTrackByName(track as any);
        return userTrack && userTrack.track_level >= level;
      });
      if (!tracksMet) return false;
    }
    
    // Check reputation requirement
    if (requirement.reputation && getTotalKarma() < requirement.reputation) {
      return false;
    }
    
    return true;
  };

  const calculateProgress = (reward: SeasonalReward): number => {
    const { requirement } = reward;
    let totalProgress = 0;
    let totalRequirements = 0;
    
    // Track progress
    if (requirement.tracks) {
      requirement.tracks.forEach(({ track, level }) => {
        const userTrack = getTrackByName(track as any);
        const currentLevel = userTrack?.track_level || 0;
        totalProgress += Math.min(currentLevel / level, 1);
        totalRequirements++;
      });
    }
    
    // Reputation progress
    if (requirement.reputation) {
      const currentReputation = getTotalKarma();
      totalProgress += Math.min(currentReputation / requirement.reputation, 1);
      totalRequirements++;
    }
    
    return totalRequirements > 0 ? (totalProgress / totalRequirements) * 100 : 0;
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white';
      case 'epic':
        return 'bg-gradient-to-r from-purple-400 to-pink-500 text-white';
      case 'rare':
        return 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getRewardIcon = (type: string) => {
    switch (type) {
      case 'theme':
        return <Star className="w-5 h-5" />;
      case 'badge':
        return <Trophy className="w-5 h-5" />;
      case 'privilege':
        return <Gift className="w-5 h-5" />;
      default:
        return <Gift className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Season Header */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Calendar className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-blue-900 dark:text-blue-100">
                  {currentSeason}
                </CardTitle>
                <CardDescription className="text-blue-700 dark:text-blue-300">
                  Limited-time rewards that disappear when the season ends
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
              <Clock className="w-3 h-3" />
              {timeRemaining}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Rewards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {seasonalRewards.map((reward) => {
          const isEligible = checkRewardEligibility(reward);
          const progress = calculateProgress(reward);
          
          return (
            <Card key={reward.id} className={`relative ${isEligible ? 'ring-2 ring-green-500' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {getRewardIcon(reward.type)}
                    <CardTitle className="text-sm">{reward.title}</CardTitle>
                  </div>
                </div>
                <CardDescription className="text-xs">
                  {reward.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
                
                {/* Requirements */}
                <div className="space-y-2">
                  <div className="text-xs font-medium">Requirements:</div>
                  {reward.requirement.tracks?.map(({ track, level }, index) => {
                    const userTrack = getTrackByName(track as any);
                    const currentLevel = userTrack?.track_level || 0;
                    const isMet = currentLevel >= level;
                    
                    return (
                      <div key={index} className={`text-xs flex justify-between ${isMet ? 'text-green-600' : 'text-muted-foreground'}`}>
                        <span>{track.replace('_', ' ')} Level {level}</span>
                        <span>{isMet ? '✓' : `${currentLevel}/${level}`}</span>
                      </div>
                    );
                  })}
                  
                  {reward.requirement.reputation && (
                    <div className={`text-xs flex justify-between ${getTotalKarma() >= reward.requirement.reputation ? 'text-green-600' : 'text-muted-foreground'}`}>
                      <span>Reputation {reward.requirement.reputation}</span>
                      <span>{getTotalKarma() >= reward.requirement.reputation ? '✓' : `${getTotalKarma()}/${reward.requirement.reputation}`}</span>
                    </div>
                  )}
                </div>
                
                {/* Action Button */}
                <Button 
                  size="sm" 
                  className="w-full" 
                  disabled={!isEligible}
                  variant={isEligible ? "default" : "outline"}
                >
                  {isEligible ? 'Claim Reward' : 'Keep Building'}
                </Button>
              </CardContent>
              
              {/* Expiry Warning */}
              {reward.isActive && (
                <div className="absolute top-2 right-2">
                  <Badge variant="destructive" className="text-xs">
                    Limited Time
                  </Badge>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      
      {/* Helpful tip about seasonal rewards */}
      <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30 dark:border-blue-800">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-1">
                Seasonal Progress
              </h4>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Seasonal rewards celebrate your fitness journey and progress. 
                Each challenge is time-limited to match the season, creating special moments 
                to look back on and remember your achievements.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SeasonalRewards;