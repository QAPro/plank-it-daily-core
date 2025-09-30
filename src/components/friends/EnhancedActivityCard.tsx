
import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Heart, MessageCircle, Share2, Trophy, Flame, Zap, Clock, Target } from 'lucide-react';
import { EnhancedActivity } from '@/services/socialActivityService';
import { socialActivityManager } from '@/services/socialActivityService';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface EnhancedActivityCardProps {
  activity: EnhancedActivity;
  currentUserId: string;
  onUpdate: () => void;
}

const EnhancedActivityCard = ({ activity, currentUserId, onUpdate }: EnhancedActivityCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);

  const userReaction = activity.friend_reactions?.find(r => r.user_id === currentUserId);
  const reactionCounts = activity.friend_reactions?.reduce((acc, reaction) => {
    acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const handleReaction = async (reactionType: string) => {
    try {
      if (userReaction?.reaction_type === reactionType) {
        await socialActivityManager.removeReaction(currentUserId, activity.id);
        toast.success('Reaction removed');
      } else {
        await socialActivityManager.addReaction(currentUserId, activity.id, reactionType);
        toast.success('Reaction added');
      }
      onUpdate();
    } catch (error) {
      toast.error('Failed to update reaction');
    }
  };

  const handleComment = async () => {
    if (!newComment.trim()) return;
    
    setIsCommenting(true);
    try {
      await socialActivityManager.addComment(currentUserId, activity.id, newComment.trim());
      setNewComment('');
      toast.success('Comment added');
      onUpdate();
    } catch (error) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = async () => {
    try {
      await socialActivityManager.incrementShareCount(activity.id);
      toast.success('Activity shared!');
      onUpdate();
    } catch (error) {
      toast.error('Failed to share activity');
    }
  };

  const getActivityIcon = () => {
    switch (activity.activity_type) {
      case 'workout':
        return <Zap className="h-5 w-5 text-blue-500" />;
      case 'achievement':
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'streak_milestone':
        return <Flame className="h-5 w-5 text-orange-500" />;
      case 'level_up':
        return <Target className="h-5 w-5 text-green-500" />;
      case 'personal_best':
        return <Trophy className="h-5 w-5 text-purple-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityTitle = () => {
    switch (activity.activity_type) {
      case 'workout':
        return `${activity.users.full_name} completed a workout`;
      case 'achievement':
        return `${activity.users.full_name} earned an achievement`;
      case 'streak_milestone':
        return `${activity.users.full_name} hit a streak milestone`;
      case 'level_up':
        return `${activity.users.full_name} leveled up`;
      case 'personal_best':
        return `${activity.users.full_name} set a personal best`;
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
      case 'streak_milestone':
        return `${data.streak_length || 0} day ${data.streak_type || 'daily'} streak!`;
      case 'level_up':
        return `Advanced from Level ${data.old_level || 1} to Level ${data.new_level || 2}`;
      case 'personal_best':
        return `New best: ${data.new_best || 0}s (improved by ${data.improvement || 0}s)`;
      default:
        return 'Activity completed';
    }
  };

  const reactions = [
    { type: 'cheer', emoji: '👏', label: 'Cheer' },
    { type: 'fire', emoji: '🔥', label: 'Fire' },
    { type: 'strong', emoji: '💪', label: 'Strong' },
    { type: 'heart', emoji: '❤️', label: 'Love' },
    { type: 'clap', emoji: '🎉', label: 'Celebrate' }
  ];

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
                <p className="font-semibold text-gray-900">{getActivityTitle()}</p>
                <p className="text-sm text-gray-600">{getActivityDescription()}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>{formatDistanceToNow(new Date(activity.created_at))} ago</span>
              {activity.activity_data.calories_burned && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {activity.activity_data.calories_burned} cal
                </Badge>
              )}
              {activity.activity_data.achievement_rarity && (
                <Badge variant="secondary" className={
                  activity.activity_data.achievement_rarity === 'rare' ? 'bg-purple-100 text-purple-800' :
                  activity.activity_data.achievement_rarity === 'epic' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }>
                  {activity.activity_data.achievement_rarity}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between border-t border-gray-100 pt-3">
          <div className="flex items-center space-x-1">
            {reactions.map((reaction) => (
              <Button
                key={reaction.type}
                variant={userReaction?.reaction_type === reaction.type ? "default" : "ghost"}
                size="sm"
                className="h-8 px-2 text-xs"
                onClick={() => handleReaction(reaction.type)}
              >
                <span className="mr-1">{reaction.emoji}</span>
                {reactionCounts[reaction.type] || 0}
              </Button>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="h-8 px-2 text-xs"
            >
              <MessageCircle className="h-4 w-4 mr-1" />
              {activity.activity_comments?.length || 0}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="h-8 px-2 text-xs"
            >
              <Share2 className="h-4 w-4 mr-1" />
              {activity.shares_count || 0}
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 space-y-3 border-t border-gray-100 pt-3">
            {activity.activity_comments?.map((comment) => (
              <div key={comment.id} className="flex space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={comment.users.avatar_url} />
                  <AvatarFallback>
                    {comment.users.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg px-3 py-2">
                    <p className="font-semibold text-sm text-gray-900">
                      {comment.users.username}
                    </p>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(comment.created_at))} ago
                  </p>
                </div>
              </div>
            ))}

            <div className="flex space-x-2">
              <Textarea
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 min-h-[60px] resize-none"
                disabled={isCommenting}
              />
              <Button
                onClick={handleComment}
                disabled={!newComment.trim() || isCommenting}
                size="sm"
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedActivityCard;
