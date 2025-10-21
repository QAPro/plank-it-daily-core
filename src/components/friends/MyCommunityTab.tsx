import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import FriendsList from './FriendsList';
import FriendSearch from './FriendSearch';
import FriendRequests from './FriendRequests';
import CheerWall from './CheerWall';
import SocialStatsCard from './SocialStatsCard';

const MyCommunityTab = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('friends');

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Section 1: Friend Management */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Manage Friends</h3>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends">My Friends</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="requests">Requests</TabsTrigger>
          </TabsList>

          <TabsContent value="friends" className="mt-4">
            <FriendsList />
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            <FriendSearch />
          </TabsContent>

          <TabsContent value="requests" className="mt-4">
            <FriendRequests />
          </TabsContent>
        </Tabs>
      </div>

      {/* Section 2: Cheer Wall */}
      <div>
        <CheerWall userId={user.id} />
      </div>

      {/* Section 3: Social Stats & Invite */}
      <div>
        <SocialStatsCard userId={user.id} />
      </div>
    </div>
  );
};

export default MyCommunityTab;
