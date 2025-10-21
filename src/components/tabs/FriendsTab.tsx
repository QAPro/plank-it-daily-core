import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FriendActivityFeed from '@/components/friends/FriendActivityFeed';
import MyCommunityTab from '@/components/friends/MyCommunityTab';

const FriendsTab = () => {
  const [activeTab, setActiveTab] = useState('activity');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Social</h2>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="community">My Community</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6">
          <FriendActivityFeed />
        </TabsContent>

        <TabsContent value="community" className="mt-6">
          <MyCommunityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FriendsTab;
