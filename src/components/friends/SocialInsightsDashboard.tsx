
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Users, Heart, MessageCircle, Trophy, Flame } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface SocialInsights {
  friendActivities: {
    totalWorkouts: number;
    totalAchievements: number;
    activeToday: number;
    mostActiveStreak: number;
  };
  userComparisons: {
    rank: number;
    totalFriends: number;
    workoutsThisWeek: number;
    averageFriendWorkouts: number;
  };
  motivationMetrics: {
    reactionsGiven: number;
    reactionsReceived: number;
    commentsGiven: number;
    commentsReceived: number;
  };
}

const SocialInsightsDashboard = () => {
  const { user } = useAuth();
  const [insights, setInsights] = useState<SocialInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSocialInsights();
    }
  }, [user]);

  const loadSocialInsights = async () => {
    if (!user) return;

    try {
      // Get friends list
      const { data: friends, error: friendsError } = await supabase
        .from('friends')
        .select('*')
        .or(`user_id.eq.${user.id},friend_id.eq.${user.id}`)
        .eq('status', 'accepted');

      if (friendsError) throw friendsError;

      const friendIds = friends?.map(f => 
        f.user_id === user.id ? f.friend_id : f.user_id
      ) || [];

      const totalFriends = friendIds.length;

      // Get friend activities this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: friendSessions } = await supabase
        .from('user_sessions')
        .select('user_id, completed_at')
        .in('user_id', friendIds)
        .gte('completed_at', weekAgo.toISOString());

      const { data: friendAchievements } = await supabase
        .from('user_achievements')
        .select('user_id')
        .in('user_id', friendIds)
        .gte('earned_at', weekAgo.toISOString());

      // Get active today count
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const activeToday = new Set(
        friendSessions?.filter(s => new Date(s.completed_at) >= today)
          .map(s => s.user_id) || []
      ).size;

      // Get user's workouts this week
      const { data: userSessions } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', weekAgo.toISOString());

      const userWorkoutsThisWeek = userSessions?.length || 0;
      const avgFriendWorkouts = friendIds.length > 0 
        ? Math.round((friendSessions?.length || 0) / friendIds.length) 
        : 0;

      // Calculate user rank
      const workoutCounts = new Map<string, number>();
      friendSessions?.forEach(s => {
        workoutCounts.set(s.user_id, (workoutCounts.get(s.user_id) || 0) + 1);
      });
      workoutCounts.set(user.id, userWorkoutsThisWeek);
      
      const sortedCounts = Array.from(workoutCounts.entries())
        .sort((a, b) => b[1] - a[1]);
      const rank = sortedCounts.findIndex(([id]) => id === user.id) + 1;

      // Get motivation metrics from activity_comments table
      // Note: activity_reactions table doesn't exist yet, so we'll use comments only
      const { count: commentsGiven } = await supabase
        .from('activity_comments')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get user's activities
      const { data: userActivities } = await supabase
        .from('friend_activities')
        .select('id')
        .eq('user_id', user.id);

      const userActivityIds = userActivities?.map(a => a.id) || [];

      const { count: commentsReceived } = await supabase
        .from('activity_comments')
        .select('*', { count: 'exact', head: true })
        .in('activity_id', userActivityIds.length > 0 ? userActivityIds : ['none']);

      const insights: SocialInsights = {
        friendActivities: {
          totalWorkouts: friendSessions?.length || 0,
          totalAchievements: friendAchievements?.length || 0,
          activeToday,
          mostActiveStreak: 0 // Can be calculated from user_streaks if needed
        },
        userComparisons: {
          rank: rank || (totalFriends + 1),
          totalFriends,
          workoutsThisWeek: userWorkoutsThisWeek,
          averageFriendWorkouts: avgFriendWorkouts
        },
        motivationMetrics: {
          reactionsGiven: 0, // Activity reactions table not yet implemented
          reactionsReceived: 0,
          commentsGiven: commentsGiven || 0,
          commentsReceived: commentsReceived || 0
        }
      };

      setInsights(insights);
    } catch (error) {
      console.error('Error loading social insights:', error);
      // Set empty insights on error
      setInsights({
        friendActivities: {
          totalWorkouts: 0,
          totalAchievements: 0,
          activeToday: 0,
          mostActiveStreak: 0
        },
        userComparisons: {
          rank: 1,
          totalFriends: 0,
          workoutsThisWeek: 0,
          averageFriendWorkouts: 0
        },
        motivationMetrics: {
          reactionsGiven: 0,
          reactionsReceived: 0,
          commentsGiven: 0,
          commentsReceived: 0
        }
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading || !insights) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Social Insights</h2>
        <p className="text-gray-600">See how you and your friends are doing this week</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Friend Activity</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Workouts this week</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {insights.friendActivities.totalWorkouts}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Achievements</span>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                  {insights.friendActivities.totalAchievements}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Active today</span>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  {insights.friendActivities.activeToday}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Ranking</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  #{insights.userComparisons.rank}
                </div>
                <div className="text-sm text-gray-600">
                  out of {insights.userComparisons.totalFriends} friends
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Your workouts</span>
                <span className="font-semibold">{insights.userComparisons.workoutsThisWeek}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Friend average</span>
                <span className="text-gray-500">{insights.userComparisons.averageFriendWorkouts}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motivation Given</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span className="text-sm text-gray-600">Reactions given</span>
                </div>
                <span className="font-semibold">{insights.motivationMetrics.reactionsGiven}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3 text-blue-500" />
                  <span className="text-sm text-gray-600">Comments posted</span>
                </div>
                <span className="font-semibold">{insights.motivationMetrics.commentsGiven}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Motivation Received</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Heart className="h-3 w-3 text-red-500" />
                  <span className="text-sm text-gray-600">Reactions received</span>
                </div>
                <span className="font-semibold">{insights.motivationMetrics.reactionsReceived}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <MessageCircle className="h-3 w-3 text-blue-500" />
                  <span className="text-sm text-gray-600">Comments received</span>
                </div>
                <span className="font-semibold">{insights.motivationMetrics.commentsReceived}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Highlights</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                <div>
                  <div className="font-semibold text-orange-800">Most Supportive Friend</div>
                  <div className="text-sm text-orange-600">You've been encouraging your friends! 🎉</div>
                </div>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  +{insights.motivationMetrics.reactionsGiven + insights.motivationMetrics.commentsGiven} encouragements
                </Badge>
              </div>
              
              {insights.userComparisons.workoutsThisWeek > insights.userComparisons.averageFriendWorkouts && (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <div className="font-semibold text-green-800">Above Average</div>
                    <div className="text-sm text-green-600">You're doing better than your friends this week!</div>
                  </div>
                  <Badge variant="secondary" className="bg-green-100 text-green-800">
                    Streak Leader
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SocialInsightsDashboard;
