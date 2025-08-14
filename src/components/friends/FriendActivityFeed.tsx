
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendSystemManager, type FriendActivity } from '@/services/friendSystemService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const reactionEmojis = {
  cheer: '🎉',
  fire: '🔥',
  strong: '💪',
  clap: '👏'
};

const FriendActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<FriendActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [reactingTo, setReactingTo] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadActivities();
      subscribeToActivityUpdates();
    }
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;
    
    try {
      const friendActivities = await friendSystemManager.getFriendActivities(user.id);
      setActivities(friendActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Failed to load friend activities');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToActivityUpdates = () => {
    if (!user) return;

    const channel = supabase
      .channel('friend-activities')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'friend_activities'
        },
        () => {
          loadActivities();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'friend_reactions'
        },
        () => {
          loadActivities();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleReaction = async (activityId: string, reactionType: string) => {
    if (!user) return;

    setReactingTo(prev => new Set(prev).add(activityId));

    try {
      const activity = activities.find(a => a.id === activityId);
      const existingReaction = activity?.friend_reactions.find(r => r.user_id === user.id);

      if (existingReaction?.reaction_type === reactionType) {
        // Remove reaction if clicking the same one
        await friendSystemManager.removeReaction(user.id, activityId);
      } else {
        // Add or update reaction
        await friendSystemManager.addReaction(user.id, activityId, reactionType);
      }

      await loadActivities();
    } catch (error) {
      console.error('Error handling reaction:', error);
      toast.error('Failed to update reaction');
    } finally {
      setReactingTo(prev => {
        const newSet = new Set(prev);
        newSet.delete(activityId);
        return newSet;
      });
    }
  };

  const getActivityMessage = (activity: FriendActivity) => {
    switch (activity.activity_type) {
      case 'workout':
        const duration = Math.floor(activity.activity_data.duration_seconds / 60);
        return `completed a ${duration}m workout`;
      case 'achievement':
        return `unlocked "${activity.activity_data.achievement_name}"`;
      case 'level_up':
        return `reached level ${activity.activity_data.new_level}!`;
      case 'streak_milestone':
        return `achieved a ${activity.activity_data.streak_length}-day streak!`;
      default:
        return 'had some activity';
    }
  };

  const getActivityIcon = (activityType: string) => {
    switch (activityType) {
      case 'workout':
        return '🏋️';
      case 'achievement':
        return '🏆';
      case 'level_up':
        return '⬆️';
      case 'streak_milestone':
        return '🔥';
      default:
        return '📈';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Activity className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No recent activity</h3>
        <p className="text-gray-600">Your friends' activities will appear here when they complete workouts or earn achievements!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Friend Activity</h2>
      
      {activities.map((activity) => {
        const userReaction = activity.friend_reactions.find(r => r.user_id === user?.id);
        const reactionCounts = activity.friend_reactions.reduce((acc, reaction) => {
          acc[reaction.reaction_type] = (acc[reaction.reaction_type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        return (
          <Card key={activity.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-start space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={activity.users.avatar_url} alt={activity.users.full_name} />
                  <AvatarFallback>
                    {activity.users.full_name?.charAt(0) || activity.users.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="mb-2">
                    <span className="font-semibold text-gray-800">
                      {activity.users.full_name || activity.users.username}
                    </span>
                    <span className="text-gray-600 ml-2">
                      {getActivityMessage(activity)}
                    </span>
                    <span className="ml-2 text-lg">
                      {getActivityIcon(activity.activity_type)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>

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
                            onClick={() => handleReaction(activity.id, reactionType)}
                            disabled={reactingTo.has(activity.id)}
                          >
                            <span className="mr-1">{emoji}</span>
                            {count > 0 && <span className="text-xs">{count}</span>}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default FriendActivityFeed;
