
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Users, Trophy, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { challengeService, type ChallengeWithParticipants } from '@/services/challengeService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface ChallengeCardProps {
  challenge: ChallengeWithParticipants;
  onUpdate?: () => void;
}

const ChallengeCard = ({ challenge, onUpdate }: ChallengeCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const isParticipating = !!challenge.user_participation;
  const progress = challenge.user_participation 
    ? challengeService.calculateChallengeProgress(
        challenge.challenge_type,
        challenge.target_data,
        challenge.user_participation.progress_data
      )
    : null;

  const handleJoinLeave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      let success = false;
      if (isParticipating) {
        success = await challengeService.leaveChallenge(user.id, challenge.id);
        if (success) {
          toast({
            title: "Left Challenge",
            description: `You've left ${challenge.title}`,
          });
        }
      } else {
        success = await challengeService.joinChallenge(user.id, challenge.id);
        if (success) {
          toast({
            title: "Joined Challenge!",
            description: `You've joined ${challenge.title}`,
          });
        }
      }

      if (success && onUpdate) {
        onUpdate();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getChallengeTypeIcon = () => {
    switch (challenge.challenge_type) {
      case 'duration':
        return <Clock className="w-4 h-4" />;
      case 'sessions':
        return <Trophy className="w-4 h-4" />;
      default:
        return <Trophy className="w-4 h-4" />;
    }
  };

  const formatChallengeGoal = () => {
    const targetValue = challenge.target_data?.target_value || 0;
    switch (challenge.challenge_type) {
      case 'duration':
        const minutes = Math.floor(targetValue / 60);
        return `${minutes} minutes total`;
      case 'sessions':
        return `${targetValue} sessions`;
      default:
        return `${targetValue} goal`;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{challenge.title}</CardTitle>
            <p className="text-sm text-gray-600 mb-2">{challenge.description}</p>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                {getChallengeTypeIcon()}
                <span>{formatChallengeGoal()}</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{challenge.participant_count}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Until {format(new Date(challenge.end_date), 'MMM d')}</span>
              </div>
            </div>
          </div>
          <Badge variant={challenge.challenge_type === 'duration' ? 'default' : 'secondary'}>
            {challenge.challenge_type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isParticipating && progress && (
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Your Progress</span>
              <span className="font-medium">
                {challenge.challenge_type === 'duration' 
                  ? `${Math.floor(progress.current_value / 60)}/${Math.floor(progress.target_value / 60)} min`
                  : `${progress.current_value}/${progress.target_value}`
                }
              </span>
            </div>
            <Progress value={progress.percentage} className="h-2" />
            {progress.is_completed && (
              <Badge className="mt-2" variant="default">
                <Trophy className="w-3 h-3 mr-1" />
                Completed!
              </Badge>
            )}
          </div>
        )}

        <Button
          onClick={handleJoinLeave}
          disabled={loading}
          variant={isParticipating ? 'outline' : 'default'}
          className="w-full"
        >
          {loading ? 'Loading...' : isParticipating ? 'Leave Challenge' : 'Join Challenge'}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ChallengeCard;
