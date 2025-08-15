
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { challengeService, type ChallengeWithParticipants } from '@/services/challengeService';
import ChallengeCard from './ChallengeCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const ChallengeList = () => {
  const { user } = useAuth();
  const [challenges, setChallenges] = useState<ChallengeWithParticipants[]>([]);
  const [userChallenges, setUserChallenges] = useState<ChallengeWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');

  const loadChallenges = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [availableChallenges, userActiveChallenges] = await Promise.all([
        challengeService.getAvailableChallenges(user.id),
        challengeService.getUserChallenges(user.id)
      ]);

      setChallenges(availableChallenges);
      setUserChallenges(userActiveChallenges);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChallenges();
  }, [user]);

  const handleChallengeUpdate = () => {
    loadChallenges();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading challenges...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Community Challenges</h2>
        <Badge variant="outline">
          {userChallenges.length} Active
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="browse">Browse Challenges</TabsTrigger>
          <TabsTrigger value="my-challenges">
            My Challenges ({userChallenges.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-4">
          {challenges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No challenges available at the moment.</p>
              <p className="text-sm">Check back later for new challenges!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {challenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onUpdate={handleChallengeUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my-challenges" className="space-y-4">
          {userChallenges.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>You haven't joined any challenges yet.</p>
              <p className="text-sm">Browse available challenges to get started!</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {userChallenges.map((challenge) => (
                <ChallengeCard
                  key={challenge.id}
                  challenge={challenge}
                  onUpdate={handleChallengeUpdate}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChallengeList;
