
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award } from 'lucide-react';
import { challengeService, type ChallengeParticipant } from '@/services/challengeService';

interface ChallengeLeaderboardProps {
  challengeId: string;
  challengeType: string;
}

const ChallengeLeaderboard = ({ challengeId, challengeType }: ChallengeLeaderboardProps) => {
  const [participants, setParticipants] = useState<ChallengeParticipant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true);
      try {
        const leaderboard = await challengeService.getChallengeLeaderboard(challengeId);
        setParticipants(leaderboard);
      } catch (error) {
        console.error('Error loading leaderboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [challengeId]);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return <span className="w-5 h-5 flex items-center justify-center text-sm font-medium">{index + 1}</span>;
    }
  };

  const formatProgress = (progressData: any) => {
    const progress = progressData?.current_progress || 0;
    if (challengeType === 'duration') {
      const minutes = Math.floor(progress / 60);
      return `${minutes} min`;
    }
    return `${progress}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <span>Loading leaderboard...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {participants.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No participants yet</p>
          ) : (
            participants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="flex-shrink-0">
                  {getRankIcon(index)}
                </div>
                
                <Avatar className="w-8 h-8">
                  <AvatarImage src={participant.users?.avatar_url} />
                  <AvatarFallback>
                    {participant.users?.full_name?.charAt(0) || 
                     participant.users?.username?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">
                    {participant.users?.full_name || participant.users?.username || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatProgress(participant.progress_data)}
                  </p>
                </div>
                
                {participant.completed && (
                  <Badge variant="default" className="flex-shrink-0">
                    Completed
                  </Badge>
                )}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ChallengeLeaderboard;
