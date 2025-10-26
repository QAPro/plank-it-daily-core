import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStatsDashboard } from "@/hooks/useStatsDashboard";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import RegularStatCard from "@/components/stats/RegularStatCard";
import MomentumActivityCard from "@/components/stats/MomentumActivityCard";

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
      className="space-y-4 max-w-3xl mx-auto"
    >
      {/* Key Metrics Cards - 4 Card Row */}
      <div className="grid grid-cols-4 gap-3">
        <RegularStatCard 
          emoji="🏋️"
          title="Total Workouts"
          value={keyMetrics.totalWorkouts}
          delay={0}
        />
        
        <RegularStatCard 
          emoji="📅"
          title="Active Days"
          value={keyMetrics.activeDays}
          delay={0.05}
        />
        
        <RegularStatCard 
          emoji="🔥"
          title="Current Streak"
          value={`${keyMetrics.currentStreak}`}
          delay={0.1}
        />
        
        <RegularStatCard 
          emoji="⏱️"
          title="Total Time"
          value={keyMetrics.totalDuration}
          delay={0.15}
        />
      </div>

      {/* Momentum + 7-Day Activity Combined Widget */}
      <MomentumActivityCard weeklyActivity={weeklyActivity} />

      {/* Personal Records */}
      <Card className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-[#7F8C8D] flex items-center gap-2">
            <span className="text-lg">⏱️</span>
            PERSONAL RECORDS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {personalRecords.length === 0 ? (
              <p className="text-sm text-[#7F8C8D]">Complete workouts to set personal records!</p>
            ) : (
              personalRecords.slice(0, 3).map((record) => (
                <div key={record.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="font-medium text-[#2C3E50] text-sm">{record.exerciseName}</p>
                    <p className="text-xs text-[#7F8C8D]">{record.date}</p>
                  </div>
                  <span className="text-lg font-bold text-[#FF6B35]">{record.duration}</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card className="bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <CardHeader className="pb-3">
          <div>
            <CardTitle className="text-sm font-semibold text-[#7F8C8D]">ACHIEVEMENTS</CardTitle>
            <p className="text-xs text-[#7F8C8D] mt-0.5">Recent</p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recentAchievements.length === 0 ? (
              <p className="text-sm text-[#7F8C8D]">Keep training to unlock achievements!</p>
            ) : (
              recentAchievements.slice(0, 3).map((achievement, index) => {
                const icons = ['👟', '⚡', '🎯'];
                return (
                  <div key={achievement.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{achievement.badge}</span>
                      <div>
                        <p className="font-medium text-[#2C3E50] text-sm">{achievement.title}</p>
                        <p className="text-xs text-[#7F8C8D]">{achievement.date}</p>
                      </div>
                    </div>
                    <span className="text-2xl">{icons[index % icons.length]}</span>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>

      {/* Premium Teaser */}
      <Card className="bg-gradient-to-br from-[#3B82F6] to-[#FDB961] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <CardContent className="p-6 text-center">
          <Crown className="w-10 h-10 mx-auto text-white mb-3" />
          <h3 className="text-lg font-semibold text-white mb-2">
            Unlock Deep Dive Analytics
          </h3>
          <p className="text-white/90 text-sm mb-4">
            Get detailed insights and personalized recommendations
          </p>
          <Button className="bg-white text-[#3B82F6] hover:bg-white/90 font-semibold">
            Upgrade to Premium
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default StatsDashboard;
