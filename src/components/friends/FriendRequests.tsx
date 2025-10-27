
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { friendSystemManager } from '@/services/friendSystemService';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Check, X, UserPlus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface PendingRequest {
  id: string;
  created_at: string;
  users: {
    id: string;
    username: string;
    full_name: string;
    avatar_url?: string;
  };
}

const FriendRequests = () => {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingRequests, setProcessingRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      loadPendingRequests();
    }
  }, [user]);

  const loadPendingRequests = async () => {
    if (!user) return;
    
    try {
      const requests = await friendSystemManager.getPendingRequests(user.id);
      setPendingRequests(requests);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      toast.error('Failed to load friend requests');
    } finally {
      setLoading(false);
    }
  };

  const acceptRequest = async (requestId: string, senderName: string) => {
    if (!user) return;

    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      await friendSystemManager.acceptFriendRequest(user.id, requestId);
      await loadPendingRequests();
      toast.success(`You're now friends with ${senderName}!`);
    } catch (error) {
      console.error('Error accepting friend request:', error);
      toast.error('Failed to accept friend request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  const declineRequest = async (requestId: string, senderName: string) => {
    if (!user) return;

    setProcessingRequests(prev => new Set(prev).add(requestId));
    
    try {
      await friendSystemManager.declineFriendRequest(user.id, requestId);
      await loadPendingRequests();
      toast.success(`Declined friend request from ${senderName}`);
    } catch (error) {
      console.error('Error declining friend request:', error);
      toast.error('Failed to decline friend request');
    } finally {
      setProcessingRequests(prev => {
        const newSet = new Set(prev);
        newSet.delete(requestId);
        return newSet;
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <UserPlus className="w-10 h-10 text-orange-500" />
        </div>
        <h3 className="text-lg font-semibold text-[#2C3E50] mb-2">No pending requests</h3>
        <p className="text-[#7F8C8D]">Friend requests will appear here when people want to connect with you</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        Friend Requests ({pendingRequests.length})
      </h2>
      
      {pendingRequests.map((request) => (
        <Card key={request.id} className="hover:shadow-medium transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={request.users.avatar_url} alt={request.users.username} />
                  <AvatarFallback>
                    {request.users.username?.charAt(0) || 'U'}
                  </AvatarFallback>
                </Avatar>

                <div>
                  <h4 className="font-semibold text-[#2C3E50] mb-1">
                    {request.users.username}
                  </h4>
                  <p className="text-sm text-[#7F8C8D]">
                    Sent {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => acceptRequest(request.id, request.users.username)}
                  disabled={processingRequests.has(request.id)}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  {processingRequests.has(request.id) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
                
                <Button
                  onClick={() => declineRequest(request.id, request.users.username)}
                  disabled={processingRequests.has(request.id)}
                  variant="outline"
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                  size="sm"
                >
                  {processingRequests.has(request.id) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <X className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FriendRequests;
