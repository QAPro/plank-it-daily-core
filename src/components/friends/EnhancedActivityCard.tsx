import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Share2, Trophy, Flame, Zap, Target } from 'lucide-react';
import { EnhancedActivity } from '@/services/socialActivityService';
import { cheerService } from '@/services/cheerService';
import CheerButton from './CheerButton';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedActivityCardProps {
  activity: EnhancedActivity;
  currentUserId: string;
  onUpdate: () => void;
}

const EnhancedActivityCard = ({ activity, currentUserId, onUpdate }: EnhancedActivityCardProps) => {
  const [hasUserCheered, setHasUserCheered] = useState(false);
  const [cheerCount, setCheerCount] = useState(activity.cheer_count || 0);

  useEffect(() => {
    checkUserCheer();
  }, [activity.id, currentUserId]);

  const checkUserCheer = async () => {
    const cheered = await cheerService.hasUserCheered(currentUserId, activity.id);
    setHasUserCheered(cheered);
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${activity.users.full_name}'s Activity`,
          text: getActivityDescription(),
          url: window.location.href
        });
        toast.success('Activity shared!');
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share activity:', error);
    }
  };

  const getActivityIcon = () => {
    switch (activity.activity_type) {
      case 'workout':
        return <Zap className="h-5 w-5 text-primary" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-primary" />;
      case 'weekly_goal':
        return <Target className="h-5 w-5 text-primary" />;
      case 'level_up':
        return <Flame className="h-5 w-5 text-primary" />;
      default:
        return <Zap className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getActivityTitle = () => {
    switch (activity.activity_type) {
      case 'workout':
        return `${activity.users.full_name} completed a workout`;
      case 'achievement':
        return `${activity.users.full_name} earned an achievement`;
      case 'weekly_goal':
        return `${activity.users.full_name} hit their weekly goal`;
      case 'level_up':
        return `${activity.users.full_name} leveled up`;
      default:
        return `${activity.users.full_name} had an activity`;
    }
  };

  const getActivityDescription = () => {
    const data = activity.activity_data;
    switch (activity.activity_type) {
      case 'workout':
        return `${data.exercise_name || 'Exercise'} for ${data.duration || 0} seconds (Level ${data.difficulty_level || 1})`;
      case 'achievement':
        return `${data.achievement_name || 'Achievement'}: ${data.achievement_description || 'Great job!'}`;
      case 'weekly_goal':
        return `Completed ${data.workouts_completed || 0} workouts this week!`;
      case 'level_up':
        return `Advanced from Level ${data.old_level || 1} to Level ${data.new_level || 2}`;
      default:
        return 'Activity completed';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-start space-x-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={activity.users.avatar_url} />
            <AvatarFallback>
              {activity.users.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2">
              {getActivityIcon()}
              <div>
                <p className="font-semibold">{getActivityTitle()}</p>
                <p className="text-sm text-muted-foreground">{getActivityDescription()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>{formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}</span>
              {activity.activity_data.calories_burned && (
                <Badge variant="secondary">
                  {activity.activity_data.calories_burned} cal
                </Badge>
              )}
              {activity.activity_data.achievement_rarity && (
                <Badge variant="secondary">
                  {activity.activity_data.achievement_rarity}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between border-t pt-3">
          <CheerButton
            activityId={activity.id}
            toUserId={activity.user_id}
            currentUserId={currentUserId}
            hasUserCheered={hasUserCheered}
            cheerCount={cheerCount}
            onCheerUpdate={() => {
              onUpdate();
              checkUserCheer();
            }}
          />

          <Button
            variant="ghost"
            size="sm"
            onClick={handleShare}
            className="gap-2 hover:bg-primary/10 transition-colors"
          >
            <Share2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default EnhancedActivityCard;
