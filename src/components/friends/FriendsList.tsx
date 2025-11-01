
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendSystemManager, type FriendProfile } from '@/services/friendSystemService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MoreVertical, MessageCircle, UserMinus, Trophy, Flame, Calendar, EyeOff } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import FlagGuard from '@/components/access/FlagGuard';
import { getVisibleProfileFields } from '@/utils/privacyHelpers';
import { supabase } from '@/integrations/supabase/client';

const FriendsList = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState<FriendProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [privacySettings, setPrivacySettings] = useState<Map<string, any>>(new Map());

  useEffect(() => {
    if (user) {
      loadFriends();
    }
  }, [user]);

  const loadFriends = async () => {
    if (!user) return;
    
    try {
      const friendsList = await friendSystemManager.getFriendsList(user.id);
      setFriends(friendsList);

      // Fetch privacy settings for all friends
      const friendIds = friendsList.map(f => f.id);
      if (friendIds.length > 0) {
        const { data: privacyData } = await supabase
          .from('privacy_settings')
          .select('user_id, show_achievements, show_statistics, show_streak')
          .in('user_id', friendIds);

        const privacyMap = new Map();
        privacyData?.forEach(setting => {
          privacyMap.set(setting.user_id, setting);
        });
        setPrivacySettings(privacyMap);
      }
    } catch (error) {
      console.error('Error loading friends:', error);
      toast.error('Failed to load friends list');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFriend = async (friendId: string, friendName: string) => {
    if (!user) return;
    
    if (!confirm(`Are you sure you want to remove ${friendName} from your friends?`)) {
      return;
    }

    try {
      await friendSystemManager.removeFriend(user.id, friendId);
      await loadFriends();
      toast.success(`Removed ${friendName} from friends`);
    } catch (error) {
      console.error('Error removing friend:', error);
      toast.error('Failed to remove friend');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-48"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (friends.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">No friends yet</h3>
          <p className="text-[#7F8C8D] mb-6">Start building your fitness community by adding friends!</p>
        </div>
      </div>
    );
  }

  return (
    <FlagGuard featureName="friend_system">
      <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Your Friends ({friends.length})</h2>
      </div>

      {friends.map((friend) => {
        const friendPrivacy = privacySettings.get(friend.id);
        const visibleFields = getVisibleProfileFields(friendPrivacy);

        return (
        <Card key={friend.id} className="hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={friend.avatar_url} alt={friend.full_name} />
                    <AvatarFallback>
                      {friend.full_name?.charAt(0) || friend.username?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {friend.is_online && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full animate-pulse"></div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <h3 className="font-semibold text-[#2C3E50]">
                      {friend.full_name || friend.username}
                    </h3>
                    <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">
                      Level {friend.current_level}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-[#7F8C8D]">
                    {visibleFields.streak ? (
                      <div className="flex items-center space-x-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span>{friend.current_streak} day streak</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <EyeOff className="w-4 h-4" />
                        <span className="text-xs">Hidden</span>
                      </div>
                    )}
                    {visibleFields.statistics ? (
                      <div className="flex items-center space-x-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>{friend.total_workouts} workouts</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-muted-foreground">
                        <EyeOff className="w-4 h-4" />
                        <span className="text-xs">Hidden</span>
                      </div>
                    )}
                    {friend.last_workout && visibleFields.statistics && (
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <span>Last: {formatDistanceToNow(new Date(friend.last_workout), { addSuffix: true })}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem 
                    onClick={() => handleRemoveFriend(friend.id, friend.username)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <UserMinus className="w-4 h-4 mr-2" />
                    Remove Friend
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardContent>
        </Card>
        );
      })}
      </div>
    </FlagGuard>
  );
};

export default FriendsList;
