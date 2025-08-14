
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Heart, MessageCircle, Share2, Sparkles, Timer, Trophy, Flame, TrendingUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import { socialActivityManager, type EnhancedActivity } from '@/services/socialActivityService';

interface EnhancedActivityCardProps {
  activity: EnhancedActivity;
  currentUserId: string;
  onUpdate: () => void;
}

const reactionEmojis = {
  cheer: '🎉',
  fire: '🔥',
  strong: '💪',
  clap: '👏',
  heart: '❤️'
};

const EnhancedActivityCard = ({ activity, currentUserId, onUpdate }: EnhancedActivityCardProps) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isCommenting, setIsCommenting] = useState(false);
  const [reactingTo, setReactingTo] = useState<string | null>(null);

  const getActivityContent = () => {
    const data = activity.activity_data;
    const user = activity.users;
    
    switch (activity.activity_type) {
      case 'workout':
        return (
          <div className="workout-activity">
            <div className="flex items-center gap-2 mb-3">
              <Timer className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <p className="text-gray-800">
                  <span className="font-semibold">{user.full_name || user.username}</span>
                  <span className="ml-1">completed a {formatDuration(data.duration || 0)} {data.exercise_name}</span>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-1">
                <Timer className="w-4 h-4" />
                <span>{formatDuration(data.duration || 0)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>Level {data.difficulty_level}</span>
              </div>
              {data.calories_burned && (
                <div className="flex items-center gap-1">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <span>{data.calories_burned} cal</span>
                </div>
              )}
            </div>
          </div>
        );
        
      case 'achievement':
        return (
          <div className="achievement-activity">
            <div className="flex items-center gap-2 mb-3">
              <Trophy className="w-5 h-5 text-yellow-500" />
              <div className="flex-1">
                <p className="text-gray-800">
                  <span className="font-semibold">{user.full_name || user.username}</span>
                  <span className="ml-1">unlocked "{data.achievement_name}"</span>
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Badge 
                  variant="secondary" 
                  className={`${
                    data.achievement_rarity === 'legendary' ? 'bg-purple-100 text-purple-800' :
                    data.achievement_rarity === 'epic' ? 'bg-blue-100 text-blue-800' :
                    data.achievement_rarity === 'rare' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}
                >
                  {data.achievement_rarity?.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{data.achievement_description}</p>
            </div>
          </div>
        );
        
      case 'personal_best':
        return (
          <div className="personal-best-activity">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div className="flex-1">
                <p className="text-gray-800">
                  <span className="font-semibold">{user.full_name || user.username}</span>
                  <span className="ml-1">set a new personal best!</span>
                </p>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <div className="text-sm text-gray-600 mb-1">{data.exercise_name}</div>
              <div className="flex items-center gap-2 text-lg font-semibold">
                <span className="text-gray-500 line-through">{formatDuration(data.previous_best || 0)}</span>
                <span>→</span>
                <span className="text-green-600">{formatDuration(data.new_best || 0)}</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800 ml-2">
                  +{formatDuration(data.improvement || 0)}
                </Badge>
              </div>
            </div>
          </div>
        );
        
      case 'streak_milestone':
        return (
          <div className="streak-activity">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-5 h-5 text-orange-500" />
              <div className="flex-1">
                <p className="text-gray-800">
                  <span className="font-semibold">{user.full_name || user.username}</span>
                  <span className="ml-1">achieved a {data.streak_length}-day streak!</span>
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-3 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-1">{data.streak_length}</div>
              <div className="text-sm text-orange-700">days in a row</div>
            </div>
          </div>
        );

      case 'level_up':
        return (
          <div className="level-up-activity">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-purple-500" />
              <div className="flex-1">
                <p className="text-gray-800">
                  <span className="font-semibold">{user.full_name || user.username}</span>
                  <span className="ml-1">reached level {data.new_level}!</span>
                </p>
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-3">
              <div className="flex items-center justify-center gap-2 text-lg font-semibold">
                <span className="text-gray-500">Level {data.old_level}</span>
                <span>→</span>
                <span className="text-purple-600">Level {data.new_level}</span>
              </div>
              {data.new_title && (
                <div className="text-center text-sm text-purple-700 mt-1">{data.new_title}</div>
              )}
            </div>
          </div>
        );
        
      default:
        return (
          <div className="generic-activity">
            <p className="text-gray-800">
              <span className="font-semibold">{user.full_name || user.username}</span>
              <span className="ml-1">had some activity</span>
            </p>
          </div>
        );
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  };

  const handleReaction = async (reactionType: string) => {
    if (!currentUserId) return;

    setReactingTo(reactionType);

    try {
      const existingReaction = activity.friend_reactions.find(r => r.user_id === currentUserId);

      if (existingReaction?.reaction_type === reactionType) {
        await socialActivityManager.removeReaction(currentUserId, activity.id);
      } else {
        await socialActivityManager.addReaction(currentUserId, activity.id, reactionType);
      }

      onUpdate();
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast.error('Failed to update reaction');
    } finally {
      setReactingTo(null);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !currentUserId) return;

    setIsCommenting(true);

    try {
      await socialActivityManager.addComment(currentUserId, activity.id, newComment.trim());
      setNewComment('');
      onUpdate();
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setIsCommenting(false);
    }
  };

  const handleShare = async () => {
    try {
      const shareText = `Check out this activity from ${activity.users.full_name || activity.users.username} on PlankIt!`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'PlankIt Activity',
          text: shareText,
          url: window.location.href
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Activity copied to clipboard!');
      }

      await socialActivityManager.incrementShareCount(activity.id);
      onUpdate();
    } catch (error) {
      console.error('Error sharing activity:', error);
    }
  };

  const userReaction = activity.friend_reactions.find(r => r.user_id === currentUserId);
  const reactionCounts = activity.friend_reactions.reduce((acc, reaction) => {
    acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start space-x-4 mb-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={activity.users.avatar_url} alt={activity.users.full_name} />
            <AvatarFallback>
              {activity.users.full_name?.charAt(0) || activity.users.username?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>

        <div className="mb-4">
          {getActivityContent()}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-1">
            {Object.entries(reactionEmojis).map(([reactionType, emoji]) => {
              const count = reactionCounts[reactionType] || 0;
              const isActive = userReaction?.reaction_type === reactionType;
              
              return (
                <Button
                  key={reactionType}
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={`h-8 px-2 ${
                    isActive 
                      ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                      : 'hover:bg-orange-50'
                  }`}
                  onClick={() => handleReaction(reactionType)}
                  disabled={reactingTo === reactionType}
                >
                  <span className="mr-1">{emoji}</span>
                  {count > 0 && <span className="text-xs">{count}</span>}
                </Button>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments(!showComments)}
              className="text-gray-600 hover:text-gray-800"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              {activity.activity_comments.length}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-600 hover:text-gray-800"
            >
              <Share2 className="w-4 h-4 mr-1" />
              {activity.shares_count > 0 && activity.shares_count}
            </Button>
          </div>
        </div>

        {showComments && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="space-y-3 mb-4">
              {activity.activity_comments.map((comment) => (
                <div key={comment.id} className="flex items-start space-x-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={comment.users.avatar_url} alt={comment.users.username} />
                    <AvatarFallback>
                      {comment.users.full_name?.charAt(0) || comment.users.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-sm text-gray-800">
                          {comment.users.full_name || comment.users.username}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center space-x-2">
              <Input
                type="text"
                placeholder="Add an encouraging comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                className="flex-1"
              />
              <Button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isCommenting}
                size="sm"
              >
                {isCommenting ? 'Posting...' : 'Post'}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EnhancedActivityCard;
