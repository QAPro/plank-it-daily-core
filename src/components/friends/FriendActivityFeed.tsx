
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socialActivityManager, type EnhancedActivity } from '@/services/socialActivityService';
import { Loader2, Activity, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import EnhancedActivityCard from './EnhancedActivityCard';
import FlagGuard from '@/components/access/FlagGuard';
import { cheerService } from '@/services/cheerService';

const FriendActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<EnhancedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);

  const handleInvite = async () => {
    if (!user) return;
    
    setSharing(true);
    
    try {
      const referralLink = await cheerService.createReferralLink(user.id);
      
      // Try Web Share API first
      if (navigator.share) {
        try {
          await navigator.share({
            title: 'Join me on my fitness journey!',
            text: "I'm crushing my fitness goals. Join me!",
            url: referralLink
          });
          toast.success('Invite sent!');
        } catch (error: any) {
          // User cancelled or share failed
          if (error.name !== 'AbortError') {
            throw error;
          }
        }
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(referralLink);
        toast.success('Invite link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing invite:', error);
      toast.error('Failed to create invite link');
    } finally {
      setSharing(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadActivities();
      subscribeToActivityUpdates();
    }
  }, [user]);

  const loadActivities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const friendActivities = await socialActivityManager.getFriendActivities(user.id);
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
      .channel('enhanced-friend-activities')
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
          table: 'cheers'
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <FlagGuard featureName="activity_feed">
      <div className="space-y-6">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="text-6xl mb-4">🔥</div>
            <h3 className="text-xl font-semibold mb-2 text-[#2C3E50]">
              No recent activity
            </h3>
            <p className="text-[#7F8C8D] text-center mb-6 max-w-md">
              Your friends' activities will appear here when they complete workouts or earn achievements!
            </p>
            <Button
              onClick={handleInvite}
              disabled={sharing}
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold shadow-lg"
            >
              <UserPlus className="h-5 w-5 mr-2" />
              Invite Friends
            </Button>
            <p className="text-sm text-gray-400 mt-4">
              Start building your fitness community!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <EnhancedActivityCard
                key={activity.id}
                activity={activity}
                currentUserId={user?.id || ''}
                onUpdate={loadActivities}
              />
            ))}
          </div>
        )}
      </div>
    </FlagGuard>
  );
};

export default FriendActivityFeed;
