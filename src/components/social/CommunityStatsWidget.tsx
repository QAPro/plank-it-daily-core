import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Target, Trophy } from 'lucide-react';
import { SocialRewardsService, type CommunityStats } from '@/services/socialRewardsService';
import { motion } from 'framer-motion';

const CommunityStatsWidget = () => {
  const [stats, setStats] = useState<CommunityStats>({
    activeUsersToday: 0,
    currentPlankers: 0,
    totalWorkoutsToday: 0,
    topPerformer: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const communityStats = await SocialRewardsService.getCommunityStats();
        setStats(communityStats);
      } catch (error) {
        console.error('Failed to fetch community stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    
    // Refresh stats every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-muted rounded w-3/4"></div>
            <div className="h-8 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-primary flex items-center gap-2">
          <Users className="h-5 w-5" />
          Community Pulse
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Live Activity Stats */}
        <div className="grid grid-cols-2 gap-3">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-background/50 rounded-lg p-3 text-center"
          >
            <div className="text-2xl font-bold text-primary">{stats.activeUsersToday}</div>
            <div className="text-xs text-muted-foreground">Active Today</div>
          </motion.div>
          
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-background/50 rounded-lg p-3 text-center"
          >
            <div className="text-2xl font-bold text-accent flex items-center justify-center gap-1">
              {stats.currentPlankers}
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            </div>
            <div className="text-xs text-muted-foreground">Planking Now</div>
          </motion.div>
        </div>

        {/* Motivational Message */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center p-3 bg-accent/10 rounded-lg"
        >
          <p className="text-sm font-medium text-accent">
            Join {stats.currentPlankers} people planking right now! 🔥
          </p>
          {stats.totalWorkoutsToday > 0 && (
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalWorkoutsToday} workouts completed today
            </p>
          )}
        </motion.div>

        {/* Top Performer */}
        {stats.topPerformer && (
          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center justify-between p-3 bg-primary/10 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-medium">Today's Champion</div>
                <div className="text-xs text-muted-foreground">
                  @{stats.topPerformer.username}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {stats.topPerformer.achievement}
            </Badge>
          </motion.div>
        )}

        {/* Call to Action */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center pt-2"
        >
          <p className="text-xs text-muted-foreground italic">
            "Every plank brings our community stronger together" 💪
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default CommunityStatsWidget;