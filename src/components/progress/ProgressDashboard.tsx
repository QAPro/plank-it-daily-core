import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Camera, Music, BookOpen, TrendingUp, Users, Heart, BarChart3 } from 'lucide-react';
import VictoryGallery from '../investment/VictoryGallery';
import VictoryPlaylistManager from '../investment/VictoryPlaylistManager';
import VictoryChronicles from '../investment/VictoryChronicles';
import VictoryPartnershipsManager from '../investment/VictoryPartnershipsManager';
import SuccessCircle from '../investment/SuccessCircle';
import ProgressMetricsDashboard from './ProgressMetricsDashboard';
import ProgressTimeline from './ProgressTimeline';
import { motion } from 'framer-motion';

const ProgressDashboard = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Progress Center</h1>
        <p className="text-muted-foreground text-lg">
          Building your personal fitness journey, one victory at a time
        </p>
      </div>

      {/* Progress Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <CardContent className="p-6">
              <Camera className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Victory Gallery</h3>
              <p className="text-sm text-muted-foreground">
                Your transformation journey captured in success moments
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center">
            <CardContent className="p-6">
              <Music className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Power Playlists</h3>
              <p className="text-sm text-muted-foreground">
                Your personal soundtracks that fuel every victory
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center">
            <CardContent className="p-6">
              <BookOpen className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Success Chronicles</h3>
              <p className="text-sm text-muted-foreground">
                Your detailed log of wins, insights, and breakthroughs
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center">
            <CardContent className="p-6">
              <Users className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Victory Partners</h3>
              <p className="text-sm text-muted-foreground">
                Your accountability partners who share the success journey
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="text-center">
            <CardContent className="p-6">
              <Heart className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Success Circle</h3>
              <p className="text-sm text-muted-foreground">
                Share stories and inspire others in the community
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="text-center">
            <CardContent className="p-6">
              <BarChart3 className="w-12 h-12 mx-auto text-primary mb-4" />
              <h3 className="font-semibold text-lg mb-2">Progress Analytics</h3>
              <p className="text-sm text-muted-foreground">
                Track your fitness progress and growth metrics
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="analytics" className="flex items-center">
            <BarChart3 className="w-4 h-4 mr-2" />
            Progress Analytics
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex items-center">
            <Camera className="w-4 h-4 mr-2" />
            Victory Gallery
          </TabsTrigger>
          <TabsTrigger value="playlists" className="flex items-center">
            <Music className="w-4 h-4 mr-2" />
            Power Playlists
          </TabsTrigger>
          <TabsTrigger value="chronicles" className="flex items-center">
            <BookOpen className="w-4 h-4 mr-2" />
            Success Chronicles
          </TabsTrigger>
          <TabsTrigger value="partners" className="flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Victory Partners
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center">
            <Heart className="w-4 h-4 mr-2" />
            Success Circle
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <div className="space-y-6">
            <ProgressMetricsDashboard />
            <ProgressTimeline />
          </div>
        </TabsContent>

        <TabsContent value="gallery">
          <VictoryGallery />
        </TabsContent>

        <TabsContent value="playlists">
          <VictoryPlaylistManager />
        </TabsContent>

        <TabsContent value="chronicles">
          <VictoryChronicles />
        </TabsContent>

        <TabsContent value="partners">
          <VictoryPartnershipsManager />
        </TabsContent>

        <TabsContent value="community">
          <SuccessCircle />
        </TabsContent>
      </Tabs>

      {/* Progress Value Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-center text-center">
              <div className="mr-6">
                <TrendingUp className="w-16 h-16 text-primary mx-auto mb-4" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Your Progress is Growing!
                </h3>
                <p className="text-muted-foreground">
                  Every photo, playlist, and victory story you add enriches your fitness journey. 
                  You're building something meaningful - your personal fitness story that grows stronger with every workout!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
};

export default ProgressDashboard;