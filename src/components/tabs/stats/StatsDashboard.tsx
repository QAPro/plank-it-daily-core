import { motion } from "framer-motion";
import { Activity, Calendar, Flame, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import MomentumScoreWidget from "@/components/momentum/MomentumScoreWidget";
import { useStatsDashboard } from "@/hooks/useStatsDashboard";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";

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
      className="p-4 lg:p-6 pb-24 space-y-6 max-w-7xl mx-auto"
    >
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Activity className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Workouts</p>
                <p className="text-2xl font-bold text-foreground">{keyMetrics.totalWorkouts}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Days</p>
                <p className="text-2xl font-bold text-foreground">{keyMetrics.activeDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Flame className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold text-foreground">{keyMetrics.currentStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Time</p>
                <p className="text-2xl font-bold text-foreground">{keyMetrics.totalDuration}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Momentum Score Widget */}
      <MomentumScoreWidget />

      {/* 7-Day Activity Calendar */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-around items-end h-32">
            {weeklyActivity.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div className="relative group">
                  <div
                    className={`w-8 h-8 rounded-full transition-colors ${
                      day.hasWorkout
                        ? "bg-primary"
                        : "bg-muted"
                    }`}
                  >
                    {day.hasWorkout && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-xs font-bold text-primary-foreground">
                          {day.workoutCount}
                        </span>
                      </div>
                    )}
                  </div>
                  {day.hasWorkout && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-popover text-popover-foreground px-2 py-1 rounded text-xs whitespace-nowrap shadow-lg">
                      {day.workoutCount} workout{day.workoutCount > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{day.label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Personal Records */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Records</CardTitle>
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

      {/* Recent Achievements */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Achievements</CardTitle>
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

      {/* Premium Teaser */}
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
    </motion.div>
  );
};

export default StatsDashboard;
