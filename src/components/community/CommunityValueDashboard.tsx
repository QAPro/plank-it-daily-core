import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Heart, MessageCircle, Award, HandHeart, Star, Target } from 'lucide-react';

const CommunityValueDashboard = () => {
  // Mock data for community connections and contributions
  const communityStats = {
    connectionsCount: 12,
    encouragementsGiven: 47,
    encouragementsReceived: 32,
    storiesShared: 8,
    challengesCompleted: 5,
    helpfulContributions: 15
  };

  const recentConnections = [
    { name: "Sarah M.", lastInteraction: "2 hours ago", type: "workout buddy" },
    { name: "Mike J.", lastInteraction: "1 day ago", type: "challenge partner" },
    { name: "Emma L.", lastInteraction: "3 days ago", type: "accountability friend" }
  ];

  const upcomingChallenges = [
    { name: "30-Day Consistency Challenge", participants: 47, startsIn: "3 days" },
    { name: "Morning Warriors Group", participants: 23, startsIn: "1 week" },
    { name: "Strength Building Journey", participants: 31, startsIn: "2 weeks" }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Your Community Impact</h1>
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          The connections you've built and the encouragement you've shared create lasting value 
          that extends far beyond any single platform.
        </p>
      </motion.div>

      {/* Community Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <Users className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{communityStats.connectionsCount}</div>
              <div className="text-sm text-muted-foreground">Meaningful Connections</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <HandHeart className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{communityStats.encouragementsGiven}</div>
              <div className="text-sm text-muted-foreground">Encouragements Given</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <Star className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{communityStats.helpfulContributions}</div>
              <div className="text-sm text-muted-foreground">Helpful Contributions</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <MessageCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{communityStats.storiesShared}</div>
              <div className="text-sm text-muted-foreground">Success Stories</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{communityStats.challengesCompleted}</div>
              <div className="text-sm text-muted-foreground">Group Challenges</div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="text-center">
            <CardContent className="pt-6">
              <Heart className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">{communityStats.encouragementsReceived}</div>
              <div className="text-sm text-muted-foreground">Support Received</div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Connections */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Your Fitness Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentConnections.map((connection, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{connection.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {connection.type} • Last active {connection.lastInteraction}
                    </div>
                  </div>
                  <Badge variant="secondary">{connection.type}</Badge>
                </div>
              ))}
              <Button variant="outline" className="w-full">
                <Users className="w-4 h-4 mr-2" />
                Connect with More People
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Upcoming Challenges */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" />
              Community Challenges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingChallenges.map((challenge, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{challenge.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {challenge.participants} participants • Starts in {challenge.startsIn}
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Join Challenge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Community Value Message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="text-center py-8">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">The Real Value You've Created</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The encouragement you've given, the connections you've made, and the support you've 
              received represent the most valuable part of your fitness journey. These relationships 
              and positive impacts extend far beyond any platform - they're part of who you are 
              and the positive influence you have on others.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default CommunityValueDashboard;