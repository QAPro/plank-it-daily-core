import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FriendActivityFeed from '@/components/friends/FriendActivityFeed';
import MyCommunityTab from '@/components/friends/MyCommunityTab';

const FriendsTab = () => {
  const [activeTab, setActiveTab] = useState('activity');

  return (
    <motion.div 
      className="bg-gradient-to-b from-[#FFF9F5] to-[#FFFCFA] min-h-screen p-4 pb-32 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-[#2C3E50]">Social</h2>
        <p className="text-[#7F8C8D]">Connect and compete with your fitness community</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white rounded-full p-1 mx-auto max-w-md flex">
          <TabsTrigger 
            value="activity"
            className="rounded-full px-6 data-[state=active]:bg-transparent data-[state=active]:shadow-none relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-orange-500 data-[state=active]:after:rounded-full data-[state=active]:text-[#2C3E50] transition-all"
          >
            Activity Feed
          </TabsTrigger>
          <TabsTrigger 
            value="community"
            className="rounded-full px-6 data-[state=active]:bg-transparent data-[state=active]:shadow-none relative data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-orange-500 data-[state=active]:after:rounded-full data-[state=active]:text-[#2C3E50] transition-all"
          >
            My Community
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="mt-6">
          <FriendActivityFeed />
        </TabsContent>

        <TabsContent value="community" className="mt-6">
          <MyCommunityTab />
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};

export default FriendsTab;
