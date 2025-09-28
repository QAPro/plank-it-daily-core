import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Trophy, Crown, Star, Lock, Unlock } from 'lucide-react';
import { useStatusTracks, useFeaturedUsers } from '@/hooks/useStatusTracks';
import { TRACK_METADATA } from '@/services/statusTrackService';
import StatusTrackCard from './StatusTrackCard';
import FeaturedUsersCard from './FeaturedUsersCard';
import { motion } from 'framer-motion';

const StatusTracksDashboard = () => {
  const { 
    statusTracks, 
    unlockedFeatures, 
    allUnlocks,
    loading, 
    getTotalExperience,
    getHighestLevelTrack 
  } = useStatusTracks();
  
  const { data: weeklyFeatured } = useFeaturedUsers('weekly');
  const { data: hallOfFame } = useFeaturedUsers('hall_of_fame');
  
  const [selectedTab, setSelectedTab] = useState('overview');

  const totalXP = getTotalExperience();
  const highestTrack = getHighestLevelTrack();
  const totalUnlocks = unlockedFeatures.length;

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const featuredContent = (
    <div className="space-y-6">
      {/* Featured This Week */}
      <FeaturedUsersCard
        type="weekly"
        featuredUsers={weeklyFeatured || []}
        title="Featured This Week"
        description="Community members making exceptional progress"
        icon={<Star className="w-5 h-5 text-yellow-500" />}
      />
      
      {/* Hall of Fame */}
      <FeaturedUsersCard
        type="hall_of_fame"
        featuredUsers={hallOfFame || []}
        title="Hall of Fame"
        description="Legendary achievers who reached the pinnacle"
        icon={<Crown className="w-5 h-5 text-purple-500" />}
      />
    </div>
  );

  const unlocksContent = (
    <div className="space-y-6">
      {/* Your Unlocked Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Unlock className="w-5 h-5 text-green-500" />
            Your Unlocked Features ({totalUnlocks})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {unlockedFeatures.length > 0 ? (
              unlockedFeatures.map((unlock) => {
                const trackMeta = TRACK_METADATA[unlock.track_name as keyof typeof TRACK_METADATA];
                return (
                  <div key={unlock.id} className="flex items-center gap-3 p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                    <Badge variant="secondary" className="text-xs">
                      {trackMeta?.displayName} Lv.{unlock.level_required}
                    </Badge>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{unlock.feature_name.replace(/_/g, ' ')}</div>
                      <div className="text-xs text-muted-foreground">
                        {unlock.unlock_data.description}
                      </div>
                    </div>
                    <Badge className={`text-xs ${
                      unlock.feature_type === 'privilege' ? 'bg-purple-100 text-purple-700' :
                      unlock.feature_type === 'reward' ? 'bg-yellow-100 text-yellow-700' :
                      unlock.feature_type === 'theme' ? 'bg-blue-100 text-blue-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {unlock.feature_type}
                    </Badge>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-muted-foreground py-8">
                Complete workouts and progress in tracks to unlock features!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Unlocks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-orange-500" />
            Upcoming Unlocks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {statusTracks.map((track) => {
              const nextUnlocks = allUnlocks
                .filter(unlock => 
                  unlock.track_name === track.track_name && 
                  unlock.level_required > track.track_level
                )
                .slice(0, 2);
              
              const trackMeta = TRACK_METADATA[track.track_name as keyof typeof TRACK_METADATA];
              
              return nextUnlocks.map((unlock) => (
                <div key={unlock.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className="text-lg">{trackMeta?.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{unlock.feature_name.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-muted-foreground">
                      {unlock.unlock_data.description}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    Level {unlock.level_required}
                  </Badge>
                </div>
              ));
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {totalXP.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Experience</div>
                </div>
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {highestTrack?.track_level || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Highest Level</div>
                  {highestTrack && (
                    <div className="text-xs text-muted-foreground mt-1">
                      in {TRACK_METADATA[highestTrack.track_name as keyof typeof TRACK_METADATA]?.displayName}
                    </div>
                  )}
                </div>
                <Trophy className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-primary">{totalUnlocks}</div>
                  <div className="text-sm text-muted-foreground">Features Unlocked</div>
                </div>
                <Unlock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tracks">My Tracks</TabsTrigger>
          <TabsTrigger value="unlocks">Unlocks</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {statusTracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <StatusTrackCard track={track} showProgress={true} />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tracks" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {statusTracks.map((track) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <StatusTrackCard track={track} showProgress={true} compact={false} />
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="unlocks">
          {unlocksContent}
        </TabsContent>

        <TabsContent value="featured">
          {featuredContent}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatusTracksDashboard;