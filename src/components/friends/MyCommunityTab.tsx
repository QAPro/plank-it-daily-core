import { useState } from 'react';
import { motion } from 'framer-motion';
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

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Section 1: Friend Management */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold mb-4 text-[#2C3E50] flex items-center gap-2">
          <span className="text-2xl">👥</span>
          Manage Friends
        </h3>
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
      </motion.div>

      <div className="h-px bg-border/50" />

      {/* Section 2: Cheer Wall */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold mb-4 text-[#2C3E50] flex items-center gap-2">
          <span className="text-2xl">💬</span>
          Cheer Wall
        </h3>
        <CheerWall userId={user.id} />
      </motion.div>

      <div className="h-px bg-border/50" />

      {/* Section 3: Social Stats & Invite */}
      <motion.div variants={itemVariants}>
        <h3 className="text-xl font-semibold mb-4 text-[#2C3E50] flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Social Stats
        </h3>
        <SocialStatsCard userId={user.id} />
      </motion.div>
    </motion.div>
  );
};

export default MyCommunityTab;
