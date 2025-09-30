
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendSystemManager, type FriendProfile } from '@/services/friendSystemService';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/useDebounce';
import SocialFeatureGuard from '@/components/access/SocialFeatureGuard';

const FriendSearch = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FriendProfile[]>([]);
  const [searching, setSearching] = useState(false);
  const [sendingRequests, setSendingRequests] = useState<Set<string>>(new Set());
  
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    if (debouncedSearchQuery && user) {
      performSearch();
    } else {
      setSearchResults([]);
    }
  }, [debouncedSearchQuery, user]);

  const performSearch = async () => {
    if (!user || !debouncedSearchQuery.trim()) return;
    
    setSearching(true);
    try {
      const results = await friendSystemManager.searchUsers(debouncedSearchQuery, user.id);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const sendFriendRequest = async (targetUserId: string, targetName: string) => {
    if (!user) return;

    setSendingRequests(prev => new Set(prev).add(targetUserId));
    
    try {
      await friendSystemManager.sendFriendRequest(user.id, targetUserId);
      toast.success(`Friend request sent to ${targetName}!`);
      
      // Remove user from search results
      setSearchResults(prev => prev.filter(result => result.id !== targetUserId));
    } catch (error: any) {
      console.error('Error sending friend request:', error);
      toast.error(error.message || 'Failed to send friend request');
    } finally {
      setSendingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUserId);
        return newSet;
      });
    }
  };

  return (
    <SocialFeatureGuard>
      <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Find Friends</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search by username, name, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2"
          />
          {searching && (
            <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 animate-spin" />
          )}
        </div>
      </div>

      {searchQuery && searchResults.length === 0 && !searching && (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No users found</h3>
          <p className="text-gray-600">Try searching with a different username or email</p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-medium text-gray-800">Search Results</h3>
          {searchResults.map((user) => (
            <Card key={user.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={user.avatar_url} alt={user.username} />
                      <AvatarFallback>
                        {user.username?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>

                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold text-gray-800">
                          {user.username}
                        </h4>
                        <Badge variant="secondary" className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">
                          Level {user.current_level}
                        </Badge>
                        {user.is_online && (
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        )}
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{user.current_streak} day streak</span>
                        <span>{user.total_workouts} workouts</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={() => sendFriendRequest(user.id, user.username)}
                    disabled={sendingRequests.has(user.id)}
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  >
                    {sendingRequests.has(user.id) ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Friend
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {!searchQuery && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserPlus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Search for Friends</h3>
          <p className="text-gray-600">Enter a username, name, or email to find people to connect with</p>
        </div>
        )}
      </div>
    </SocialFeatureGuard>
  );
};

export default FriendSearch;
