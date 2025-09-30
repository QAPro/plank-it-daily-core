
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, Star, TrendingUp, Heart, Target } from 'lucide-react';
import { useProgressAnalytics } from '@/hooks/useProgressAnalytics';

const ProgressCelebrationDashboard: React.FC = () => {
  const { data: analytics, isLoading, error } = useProgressAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32 bg-muted/10" />
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="w-16 h-16 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Progress</h3>
          <p className="text-muted-foreground text-center">
            We're having trouble loading your progress data. Please try refreshing the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!analytics) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="w-16 h-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ready to Start Your Journey?</h3>
          <p className="text-muted-foreground text-center">
            Complete your first workout to begin tracking your amazing progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  const celebrationMessages = [
    "Every workout is a gift to your future self! 💪",
    "Your consistency is truly inspiring! ✨",
    "Look how far you've come - you're amazing! 🌟",
    "Your dedication is building something incredible! 🎯"
  ];

  const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];

  return (
    <div className="space-y-6">
      {/* Celebration Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2">
          <TrendingUp className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Your Amazing Progress</h1>
          <TrendingUp className="w-8 h-8 text-primary" />
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          {randomMessage}
        </p>
      </motion.div>

      {/* Key Achievements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="text-center">
            <CardHeader className="pb-2">
              <Trophy className="w-8 h-8 text-primary mx-auto" />
              <CardTitle className="text-lg">Time Dedicated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {formatTime(analytics.totalTimeDedicated)}
              </div>
              <p className="text-sm text-muted-foreground">
                Every minute counts toward your goals!
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
            <CardHeader className="pb-2">
              <Star className="w-8 h-8 text-primary mx-auto" />
              <CardTitle className="text-lg">Achievements Unlocked</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {analytics.achievementsEarned}
              </div>
              <p className="text-sm text-muted-foreground">
                Celebrate each milestone you've reached!
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
            <CardHeader className="pb-2">
              <TrendingUp className="w-8 h-8 text-primary mx-auto" />
              <CardTitle className="text-lg">Experience Gained</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {analytics.xpGained.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                Growing stronger with every session!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Progress Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="w-5 h-5 text-primary" />
              Your Growth Journey
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Consistency Streak</span>
                  <Badge variant="secondary">{analytics.currentStreak} days</Badge>
                </div>
                <Progress value={Math.min((analytics.currentStreak / 30) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Amazing dedication! Your consistency is building lasting habits.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Achievement Progress</span>
                  <Badge variant="secondary">{analytics.achievementsEarned} unlocked</Badge>
                </div>
                <Progress value={Math.min((analytics.achievementsEarned / 20) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Every achievement represents your growing strength and commitment.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Experience Growth</span>
                  <Badge variant="secondary">{(analytics.xpGained / 1000).toFixed(1)}k XP</Badge>
                </div>
                <Progress value={Math.min((analytics.xpGained / 10000) * 100, 100)} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  Your knowledge and skills are expanding with every workout.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Encouragement Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="text-center py-8">
            <Heart className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">You're Doing Amazing!</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your commitment to your health and fitness journey is truly inspiring. Every workout, 
              every achievement, and every moment of progress is something to be proud of. 
              Keep up the incredible work - you're building something amazing!
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProgressCelebrationDashboard;