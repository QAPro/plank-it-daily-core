import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Target, Zap, Clock, Trophy } from 'lucide-react';
import { useProgressAnalytics } from '@/hooks/useProgressAnalytics';

const ProgressMetricsDashboard: React.FC = () => {
  const { data: analytics, isLoading } = useProgressAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-muted rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
            <div className="h-24 bg-muted rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Start your first workout to see your progress overview!</p>
          </CardContent>
        </Card>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Progress Score Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-primary mb-2">Your Progress Overview</h2>
                <p className="text-muted-foreground">
                  {formatTime(analytics.totalTimeInvested)} dedicated • Progress Score: {analytics.progressScore}
                </p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-primary">
                  <TrendingUp className="w-8 h-8 mr-2" />
                  <div>
                    <div className="text-3xl font-bold">{analytics.progressScore}</div>
                    <div className="text-sm text-muted-foreground">Progress Points</div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2 text-primary" />
                Time Dedicated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {analytics.totalTimeInvestedHours.toFixed(1)}h
              </div>
              <p className="text-sm text-muted-foreground">
                Total time dedicated to your fitness journey
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Trophy className="w-5 h-5 mr-2 text-primary" />
                Achievements Unlocked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {analytics.achievementsEarned}
              </div>
              <p className="text-sm text-muted-foreground">
                Milestones unlocked through dedication
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center text-lg">
                <Zap className="w-5 h-5 mr-2 text-primary" />
                Experience Points
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary mb-2">
                {analytics.xpGained.toLocaleString()}
              </div>
              <p className="text-sm text-muted-foreground">
                XP points accumulated from progress
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
            <CardTitle className="flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-primary" />
              Progress Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Streak Progress</span>
                <div className="flex items-center">
                  <div className="w-32 bg-muted rounded-full h-2 mr-3">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((analytics.portfolioBreakdown.streakValue / 500) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-primary font-semibold">
                    {analytics.portfolioBreakdown.streakValue}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Achievement Progress</span>
                <div className="flex items-center">
                  <div className="w-32 bg-muted rounded-full h-2 mr-3">
                    <div 
                      className="bg-secondary h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((analytics.portfolioBreakdown.achievementValue / 1000) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-secondary font-semibold">
                    {analytics.portfolioBreakdown.achievementValue}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Experience Progress</span>
                <div className="flex items-center">
                  <div className="w-32 bg-muted rounded-full h-2 mr-3">
                    <div 
                      className="bg-accent h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((analytics.portfolioBreakdown.xpValue / 1000) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-accent font-semibold">
                    {Math.round(analytics.portfolioBreakdown.xpValue)}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Consistency Progress</span>
                <div className="flex items-center">
                  <div className="w-32 bg-muted rounded-full h-2 mr-3">
                    <div 
                      className="bg-primary/70 h-2 rounded-full transition-all duration-1000"
                      style={{ 
                        width: `${Math.min((analytics.portfolioBreakdown.consistencyValue / 750) * 100, 100)}%` 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm text-primary/70 font-semibold">
                    {analytics.portfolioBreakdown.consistencyValue}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Progress Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-gradient-to-r from-secondary/5 to-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="w-5 h-5 mr-2 text-primary" />
              Progress Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-primary mb-2">Strong Areas:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  {analytics.currentStreak >= 7 && <li>• Excellent streak momentum building</li>}
                  {analytics.achievementsEarned >= 5 && <li>• Great achievement diversity</li>}
                  {analytics.xpGained >= 1000 && <li>• Strong experience accumulation</li>}
                  {analytics.totalTimeInvestedHours >= 5 && <li>• Substantial time dedicated</li>}
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-primary mb-2">Growth Opportunities:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  {analytics.currentStreak < 7 && <li>• Build consistency for stronger streaks</li>}
                  {analytics.achievementsEarned < 5 && <li>• Unlock more achievements</li>}
                  {analytics.totalTimeInvestedHours < 5 && <li>• Increase workout frequency</li>}
                  <li>• Build on your progress daily</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ProgressMetricsDashboard;