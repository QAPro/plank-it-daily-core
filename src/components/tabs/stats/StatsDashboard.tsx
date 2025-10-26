import { motion } from "framer-motion";
import { Activity, Calendar, Flame, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MomentumScoreWidget from "@/components/momentum/MomentumScoreWidget";
import { useStatsDashboard } from "@/hooks/useStatsDashboard";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import FeaturedStatCard from "@/components/stats/FeaturedStatCard";
import RegularStatCard from "@/components/stats/RegularStatCard";
import WeeklyActivityChart from "@/components/stats/WeeklyActivityChart";

const StatsDashboard = () => {
  const { keyMetrics, weeklyActivity, personalRecords, recentAchievements, isLoading } = useStatsDashboard();

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 lg:p-6 pb-32 space-y-6 max-w-7xl mx-auto"
    >
      {/* Featured Stat - Current Streak */}
      <FeaturedStatCard 
        icon={Flame}
        label="Current Streak"
        value={`${keyMetrics.currentStreak} days`}
      />

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 px-5">
        <RegularStatCard 
          icon={Activity}
          title="Total Workouts"
          value={keyMetrics.totalWorkouts}
          delay={0}
        />
        
        <RegularStatCard 
          icon={Calendar}
          title="Active Days"
          value={keyMetrics.activeDays}
          delay={0.1}
        />
        
        <RegularStatCard 
          icon={Clock}
          title="Total Time"
          value={keyMetrics.totalDuration}
          delay={0.2}
        />
      </div>

      {/* Momentum Score Widget */}
      <MomentumScoreWidget />

      {/* 7-Day Activity Chart */}
      <div className="px-5">
        <WeeklyActivityChart data={weeklyActivity} />
      </div>

      {/* Personal Records */}
      <div className="px-5">
        <Card className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#7F8C8D] uppercase" style={{ letterSpacing: '0.5px' }}>
              Personal Records
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {personalRecords.length === 0 ? (
              <p className="text-sm text-muted-foreground">Complete workouts to set personal records!</p>
            ) : (
              personalRecords.slice(0, 3).map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{record.exerciseName}</p>
                      <p className="text-xs text-muted-foreground">{record.date}</p>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">{record.duration}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      <div className="px-5">
        <Card className="bg-white rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-[#7F8C8D] uppercase" style={{ letterSpacing: '0.5px' }}>
              Recent Achievements
            </CardTitle>
          </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Keep training to unlock achievements!</p>
            ) : (
              recentAchievements.slice(0, 3).map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <span className="text-2xl">{achievement.badge}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{achievement.title}</p>
                    <p className="text-xs text-muted-foreground">{achievement.date}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Premium Teaser */}
      <div className="px-5">
      <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
        <CardContent className="p-6 text-center">
          <Crown className="w-12 h-12 mx-auto text-primary mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">
            Unlock Deep Dive Analytics
          </h3>
          <p className="text-muted-foreground mb-4">
            Get detailed insights, progress predictions, and personalized recommendations with Premium.
          </p>
          <ul className="text-sm text-muted-foreground mb-6 space-y-2">
            <li>📈 Progress predictions & trends</li>
            <li>🤖 AI-powered insights</li>
            <li>📊 Exercise breakdown charts</li>
            <li>💾 CSV data export</li>
          </ul>
          <Button className="bg-primary hover:bg-primary/90">
            Upgrade to Premium
          </Button>
        </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

export default StatsDashboard;
