
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { socialActivityManager, type EnhancedActivity, type ActivityFilters } from '@/services/socialActivityService';
import { Loader2, Activity } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import EnhancedActivityCard from './EnhancedActivityCard';
import ActivityFilters from './ActivityFilters';

const FriendActivityFeed = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<EnhancedActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<ActivityFilters>({
    type: 'all',
    timeframe: 'week',
    friends: 'all'
  });

  useEffect(() => {
    if (user) {
      loadActivities();
      subscribeToActivityUpdates();
    }
  }, [user, filters]);

  const loadActivities = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const friendActivities = await socialActivityManager.getFriendActivities(user.id, filters);
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
          table: 'friend_reactions'
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
          table: 'activity_comments'
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Friend Activity</h2>
      </div>

      <ActivityFilters 
        filters={filters} 
        onFiltersChange={setFilters}
        activityCount={activities.length}
      />

      {activities.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Activity className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            {filters.type !== 'all' || filters.timeframe !== 'week' 
              ? 'No activities match your filters' 
              : 'No recent activity'
            }
          </h3>
          <p className="text-gray-600">
            {filters.type !== 'all' || filters.timeframe !== 'week'
              ? 'Try adjusting your filters to see more activities'
              : "Your friends' activities will appear here when they complete workouts or earn achievements!"
            }
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
  );
};

export default FriendActivityFeed;
