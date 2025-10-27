
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socialActivityManager, type EnhancedActivity } from '@/services/socialActivityService';
import { Loader2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import EnhancedActivityCard from './EnhancedActivityCard';
import FlagGuard from '@/components/access/FlagGuard';

const FriendActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<EnhancedActivity[]>([]);
  const [loading, setLoading] = useState(true);

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
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Activity className="w-10 h-10 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-[#2C3E50]">
              No recent activity
            </h3>
            <p className="text-[#7F8C8D]">
              Your friends' activities will appear here when they complete workouts or earn achievements!
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
