
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
      const [friendActivities, userComparisons, motivationMetrics] = await Promise.all([
        getFriendActivitySummary(user.id),
        getUserComparisons(user.id),
        getMotivationMetrics(user.id)
      ]);

      setInsights({
        friendActivities,
        userComparisons,
        motivationMetrics
      });
    } catch (error) {
      console.error('Error loading social insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFriendActivitySummary = async (userId: string) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    
    const { data: activities } = await supabase
      .from('friend_activities')
      .select('activity_type, created_at')
      .gte('created_at', weekStart.toISOString())
      .neq('visibility', 'private');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      totalWorkouts: activities?.filter(a => a.activity_type === 'workout').length || 0,
      totalAchievements: activities?.filter(a => a.activity_type === 'achievement').length || 0,
      activeToday: activities?.filter(a => new Date(a.created_at) >= today).length || 0,
      mostActiveStreak: 5 // This would require more complex calculation
    };
  };

  const getUserComparisons = async (userId: string) => {
    // This is a simplified version - in a real app you'd want more sophisticated ranking
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const { data: userWorkouts } = await supabase
      .from('friend_activities')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_type', 'workout')
      .gte('created_at', weekStart.toISOString());

    return {
      rank: 3, // Placeholder - would need friend comparison logic
      totalFriends: 12, // Would get from friends count
      workoutsThisWeek: userWorkouts?.length || 0,
      averageFriendWorkouts: 4 // Would calculate from friend data
    };
  };

  const getMotivationMetrics = async (userId: string) => {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    const [reactionsGiven, reactionsReceived, commentsGiven, commentsReceived] = await Promise.all([
      supabase
        .from('friend_reactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', weekStart.toISOString()),
      
      supabase
        .from('friend_reactions')
        .select('*, friend_activities!inner(*)')
        .eq('friend_activities.user_id', userId)
        .gte('friend_reactions.created_at', weekStart.toISOString()),
        
      supabase
        .from('activity_comments')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', weekStart.toISOString()),
        
      supabase
        .from('activity_comments')
        .select('*, friend_activities!inner(*)')
        .eq('friend_activities.user_id', userId)
        .gte('activity_comments.created_at', weekStart.toISOString())
    ]);

    return {
      reactionsGiven: reactionsGiven.data?.length || 0,
      reactionsReceived: reactionsReceived.data?.length || 0,
      commentsGiven: commentsGiven.data?.length || 0,
      commentsReceived: commentsReceived.data?.length || 0
    };
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
