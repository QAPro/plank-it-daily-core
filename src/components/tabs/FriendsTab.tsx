import { useState } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import FriendActivityFeed from '@/components/friends/FriendActivityFeed';
import MyCommunityTab from '@/components/friends/MyCommunityTab';
import { useAuth } from '@/contexts/AuthContext';
import { cheerService } from '@/services/cheerService';
import { toast } from 'sonner';

const FriendsTab = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('activity');
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

  return (
    <motion.div 
      className="bg-gradient-to-b from-[#FFF9F5] to-[#FFFCFA] min-h-screen p-4 pb-32 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-[#2C3E50]">Social</h2>
          <p className="text-[#7F8C8D]">Connect and compete with your fitness community</p>
        </div>
        <Button
          onClick={handleInvite}
          disabled={sharing}
          variant="ghost"
          size="sm"
          className="absolute top-0 right-0 text-orange-500 hover:text-orange-600 hover:bg-orange-50"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Invite</span>
        </Button>
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
