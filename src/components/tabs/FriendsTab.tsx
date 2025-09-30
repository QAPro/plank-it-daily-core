
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, UserPlus, Activity, Settings, TrendingUp, Trophy } from 'lucide-react';
import { useFeatureAccess } from '@/hooks/useFeatureAccess';
import FriendsList from '../friends/FriendsList';
import FriendSearch from '../friends/FriendSearch';
import FriendActivityFeed from '../friends/FriendActivityFeed';
import FriendRequests from '../friends/FriendRequests';
import PrivacySettings from '../friends/PrivacySettings';
import SocialInsightsDashboard from '../friends/SocialInsightsDashboard';
import ChallengeList from '../challenges/ChallengeList';

const FriendsTab = () => {
  const [activeTab, setActiveTab] = useState('activity');
  const { hasAccess } = useFeatureAccess();

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Friends & Social</h1>
        <p className="text-gray-600">Connect with friends and join community challenges</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="activity" className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span className="hidden sm:inline">Activity</span>
          </TabsTrigger>
          {hasAccess('social_challenges') && (
            <>
              <TabsTrigger value="challenges" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Challenges</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Insights</span>
              </TabsTrigger>
            </>
          )}
          <TabsTrigger value="friends" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <span className="hidden sm:inline">Friends</span>
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Add</span>
          </TabsTrigger>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            <span className="hidden sm:inline">Requests</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Privacy</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <FriendActivityFeed />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="challenges" className="mt-6">
          {hasAccess('social_challenges') ? (
            <ChallengeList />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
                <p className="text-muted-foreground mb-4">
                  Unlock challenges and compete with friends with a Premium subscription.
                </p>
                <Badge variant="secondary">Premium Only</Badge>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          {hasAccess('social_challenges') ? (
            <SocialInsightsDashboard />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <TrendingUp className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">Premium Feature</h3>
                <p className="text-muted-foreground mb-4">
                  Get detailed social insights and analytics with a Premium subscription.
                </p>
                <Badge variant="secondary">Premium Only</Badge>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="friends" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <FriendsList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <FriendSearch />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <FriendRequests />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <PrivacySettings />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendsTab;
